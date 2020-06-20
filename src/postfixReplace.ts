import type { FilterProcessor } from './filterManager'
import type { TagInfo } from './tags'

import { calculateCoordinates, replaceAndGetOffset } from './utils'

// traverses in postfix order
export const postfixReplace = (baseText: string, rootTag: TagInfo, baseDepth: number, filterProcessor: FilterProcessor): [string, number[], boolean, [number, number][]] => {
    const baseStack = []

    const tagReduce = ([text, stack, ready]: [string, number[], boolean], tagInfo: TagInfo): [string, number[], boolean] => {

        // going DOWN
        stack.push(stack[stack.length - 1])

        const [
            modText,
            modStack,
            modReady,
        ] = tagInfo.innerTags.reduce(tagReduce, [text, stack, true])

        // get offsets
        const innerOffset = modStack.pop() - modStack[modStack.length - 1]
        const leftOffset = modStack.pop()

        ///////////////////// Updating valuesRaw and values with innerTags
        const [
            lend,
            rend,
        ] = calculateCoordinates(tagInfo.start, tagInfo.end, leftOffset, innerOffset)

        // correctly treat the base levels: they don't have have tags!
        const depth = tagInfo.data.depth + 1
        const tagData = depth <= baseDepth
            ? tagInfo.data.shadowFromText(modText, lend, rend)
            : tagInfo.data.shadowFromTextWithoutDelimiters(modText, lend, rend)

        // save base tags
        if (depth === baseDepth) {
            baseStack.push([lend, rend])
        }

        ///////////////////// Evaluate current tag
        const filterOutput = filterProcessor(tagData, {
            ready: modReady,
            depth: depth - baseDepth,
        })

        const [
            newText,
            newOffset,
        ] = replaceAndGetOffset(modText, filterOutput.result, lend, rend)

        // going UP
        const sum = innerOffset + leftOffset + newOffset
        modStack.push(sum)

        tagInfo.update(lend, rend, null, null)

        // console.info('going up:', tag.data.path, modText, '+++', filterOutput.result, '===', newText)
        // console.groupCollapsed('offsets', tag.data.path)
        // console.log('left', leftOffset)
        // console.log('inner' , innerOffset)
        // console.log('new', newOffset)
        // console.info('lend', lend)
        // console.info('rend', rend)
        // console.groupEnd()

        return [
            newText,
            modStack,
            // ready means everything to the left is ready
            // filterOutput.ready means everything within and themselves are ready
            ready && filterOutput.ready
        ]
    }

    const [
        modifiedText,
        stack,
        ready,
    ] = tagReduce([baseText, [0,0], true], rootTag)

    return [modifiedText, stack, ready, baseStack]
}