import type { Comparator } from './priorityQueue'
import type { Internals } from '.'

import { PriorityQueue } from './priorityQueue'

export type Deferred = (entry: DeferredEntry, internals: Internals) => void

interface DeferredEntry {
    keyword: string,
    procedure: Deferred
    priority: number
    persistent: boolean
}

interface DeferredOptions {
    priority?: number
    persistent?: boolean
}

const defaultDeferredOptions: DeferredOptions = {
    priority: 0,
    persistent: false,
}

// bigger number means higher priority, and higher priority means executed first
const deferredComparator: Comparator = (x: DeferredEntry, y: DeferredEntry): boolean => x.priority > y.priority

export class DeferredApi {
    private readonly _deferred: Map<string, DeferredEntry>
    private readonly _blocked: Set<string>

    constructor() {
        this._deferred = new Map()
        this._blocked = new Set()
    }

    register(keyword: string, procedure: Deferred, {
        priority = 0,
        persistent = false,
    }: DeferredOptions,
    ): void {
        this._deferred.set(keyword, {
            keyword: keyword,
            procedure: procedure,
            priority: priority,
            persistent: persistent,
        })
    }

    registerIfNotExists(keyword: string, procedure: Deferred, options = defaultDeferredOptions): void {
        if (!this.isRegistered(keyword)) {
            this.register(keyword, procedure, options)
        }
    }

    unregister(keyword: string): void {
        this._deferred.delete(keyword)
    }

    isRegistered(keyword: string): boolean {
        return this._deferred.has(keyword)
    }

    block(keyword: string) {
        this._blocked.add(keyword)
    }

    unblock(keyword: string) {
        this._blocked.delete(keyword)
    }

    isBlocked(keyword: string): boolean {
        return this._blocked.has(keyword)
    }

    clear(): void {
        this._deferred.clear()
        this._blocked.clear()
    }

    executeEach(internals: Internals): void {
        const prioQueue = new PriorityQueue<DeferredEntry>(deferredComparator)
        prioQueue.push(...this._deferred.values())

        for (const def of prioQueue.generate()) {
            if (!this.isBlocked(def.keyword)) {
                def.procedure(def, internals)
            }

            if (!def.persistent) {
                this.unregister(def.keyword)
            }
        }

        this._blocked.clear()
    }
}
