import { Status, ProcessorOutput } from './template/evaluate'

import { MetaFilterManager, ManagerInfo } from './filterManager'
import { Filter as FilterType, WeakFilter as WeakFilterType, FilterResult, FilterApi } from './filterManager/filters'

import { TagRenderer, TemplateInfo, IterationInfo } from './template'
import { TagProcessor, RoundInfo } from './template/evaluate'
import { TagData, WeakDataOptions } from './template/tags'

export type Internals = ManagerInfo<TemplateInfo, IterationInfo, RoundInfo, WeakDataOptions> & TemplateInfo & IterationInfo & RoundInfo
export type DeferredInternals = ManagerInfo<TemplateInfo, IterationInfo, RoundInfo, WeakDataOptions> & TemplateInfo & IterationInfo
export type AftermathInternals = ManagerInfo<TemplateInfo, IterationInfo, RoundInfo, WeakDataOptions> & TemplateInfo

export type Filters = FilterApi<Internals, WeakDataOptions>
export type { WeakDataOptions } from './template/tags'

export type Filter = FilterType<Internals, WeakDataOptions>
export type WeakFilter = WeakFilterType<Internals, WeakDataOptions>
export type { FilterResult, WeakFilterResult } from './filterManager/filters'

const filterResultToProcessorOutput = (filterResult: FilterResult): ProcessorOutput => {
    if (!filterResult.ready) {
        return {
            result: null,
            status: Status.NotReady,
        }
    }

    if (filterResult.containsTags) {
        return {
            result: filterResult.result,
            status: Status.ContainsTags,
        }
    }

    return {
        result: filterResult.result,
        status: Status.Ready,
    }
}

export class FilterManager extends MetaFilterManager<TemplateInfo, IterationInfo, RoundInfo, WeakDataOptions> implements TagRenderer {
    makeProcessor(template: TemplateInfo, iteration: IterationInfo): TagProcessor {
        return (data: TagData, round: RoundInfo): ProcessorOutput => {
            return filterResultToProcessorOutput(this.filterProcessor(template, iteration)(data, round))
        }
    }

    finishIteration(template: TemplateInfo, iteration: IterationInfo) {
        this.executeDeferred(template, iteration)
    }

    finishRun(template: TemplateInfo): void {
        this.executeAftermath(template)
        this.reset()
    }
}
