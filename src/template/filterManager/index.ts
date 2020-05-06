import type {
    Tag,
} from '../../templateTypes'

import type {
    Internals,
    FilterManager,
    FilterResult,
    Iteration,
    NextIterationApi,
} from './types'

import {
    defaultMemoizer,
    generateMemoizerKey,
} from './memoizer'

import {
    mkStoreApi,
} from './store'

import {
    executeFilter,
    mkFilterApi,
} from './filters'

import {
    mkDeferredApi,
} from './deferred'

const mkFilterManager = (meta = {}, memoizer = defaultMemoizer): FilterManager => {
    const store = new Map()
    const storeApi = mkStoreApi(store)

    const filters = new Map()
    const filterApi = mkFilterApi(filters)

    const deferred = new Map()
    const deferredApi = mkDeferredApi(deferred)

    let nextIteration: boolean = true
    const nextIterationApi: NextIterationApi = {
        activate: (value = true) => {
            nextIteration = value
        },
        isActivated: () => nextIteration,
    }

    const internals: Internals = {
        meta: meta,
        nextIteration: nextIterationApi,
        store: storeApi,
        filters: filterApi,
        deferred: deferredApi,
    }

    const processFilter = (key: string, data: Tag): FilterResult => {
        const memoizerKey = generateMemoizerKey(data)

        if (memoizer.hasItem(memoizerKey)) {
            return memoizer.getItem(memoizerKey)
        }

        const result = executeFilter(filters, key, data, internals)

        if (result.memoize) {
            memoizer.setItem(memoizerKey, result)
        }

        return result
    }

    const iterations = function*() {
        while (nextIteration) {
            nextIteration = false

            yield {
                processFilter: processFilter,
            }

            for (const [name, def] of deferred) {
                def(name)
            }
            deferred.clear()
        }
    }

    return {
        iterations: iterations,
        filters: filterApi,
    }
}

export default mkFilterManager