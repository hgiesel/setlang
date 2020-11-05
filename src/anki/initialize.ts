import type { MemoryMap } from './persistence'
import type { FilterManager } from '..'
import type { Delimiters } from '../template/parser/tokenizer/delimiters'

import { BrowserTemplate, cleanup } from '../browser'
import { persistenceInterface } from './persistence'

import { ankiLog } from './utils'
import { delayAction } from './delay'


type CardSide = 'front' | 'back'

interface DefaultPreset {
    card: string
    cardNumber: number
    tagsFull: string
    tags: string[]
    side: CardSide
    [key: string]: unknown
}

const getCardNumber = (textNum: string): number => Number(textNum.match(/[0-9]*$/))

const preset = (cardType: string, tagsFull: string, side: CardSide): DefaultPreset => ({
    card: cardType,
    cardNumber: getCardNumber(cardType),
    tagsFull: tagsFull,
    tags: tagsFull.length === 0
        ? []
        : tagsFull.split(' '),
    side: side,
})

/////////////////////////////////////// LOAD

interface SetupOptions {
    delimiters: Delimiters,
}

const load = <T extends Record<string, unknown>>(
    elements: Element[],
    memoryMap: MemoryMap,
    filterManager: FilterManager<T>,
    options?: SetupOptions,
): number => {
    const before = window.performance.now()
    BrowserTemplate
        .makeFromNodes(elements, options?.delimiters)
        .renderToNodes(filterManager)

    memoryMap.writeBack()
    const after = window.performance.now()

    return after - before
}

/////////////////////////////////////// INIT

type SetupOutput<T extends Record<string, unknown>> = [
    Element[],
    MemoryMap,
    FilterManager<T>,
    SetupOptions?,
]

type UserLogic<T extends Record<string, unknown>> = (
    closet: NodeModule,
    preset: T,
    chooseMemory: (memoryKey: string) => MemoryMap,
) => SetupOutput<T>[]

// Export for legacy support
export const init = (
    closet: NodeModule,
    logic: UserLogic<DefaultPreset>,
    cardType: string,
    tagsFull: string,
    side: CardSide,
): number[] => {
    const userPreset = preset(cardType, tagsFull, side)
    const chooseMemory = persistenceInterface(side, document.getElementById('qa')?.innerHTML ?? '')

    return logic(closet, userPreset, chooseMemory)
        .map((value: SetupOutput<DefaultPreset>) => load(...value))
}

/////////////////////////////////////// INITIALIZE

const logInit = (
    closet: NodeModule,
    logic: UserLogic<DefaultPreset>,
    cardType: string,
    tagsFull: string,
    side: CardSide,
): void => {
    try {
        const times = init(closet, logic, cardType, tagsFull, side)
        console.log(`Closet executed in ${times.map((t: number) => t.toFixed(3))}ms.`)
    }
    catch (error) {
        console.log('An error occured while executing Closet:', error)
        ankiLog('An error occured while executing Closet', error)
    }
    finally {
        cleanup()
    }
}

export const initialize = (
    closet: NodeModule,
    logic: UserLogic<DefaultPreset>,
    cardType: string,
    tagsFull: string,
    side: CardSide,
): NodeModule => {
    delayAction(() => logInit(closet, logic, cardType, tagsFull, side))
    return closet
}