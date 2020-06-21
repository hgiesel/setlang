import type { TagData, FilterApi, Internals } from './types'

import { Stylizer } from './stylizer'
import { sequencer } from './sequencer'

export const shufflingRecipe = ({
    tagname,
    stylizer = new Stylizer(),
}) => (filterApi: FilterApi) => {
    const shuffleFilter = (tag: TagData, internals: Internals) => {
        const unitId = `${tag.fullKey}:${tag.fullOccur}`
        const sequenceId = tag.num ? tag.fullKey : unitId

        const maybeValues = sequencer(
            unitId,
            sequenceId,
            tag.values,
            internals,
        )

        if (maybeValues) {
            return stylizer.stylize(maybeValues)
        }
    }

    filterApi.register(tagname, shuffleFilter as any, ['::', '||'])
}
