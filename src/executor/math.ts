import {
    Slang,
    SlangTypes,
} from '../types'

import {
    mkNumber,
    isNumber,
} from '../constructors'

import {
    SlangTypeError,
    SlangArityError,
} from './exception'

export const addition = (args: Slang[]) => {
    console.log('bla', args)

    let sum = 0

    for (const arg of args) {
        if (!isNumber(arg)) {
            throw new SlangTypeError('Value needs to be a number')
        }

        sum += arg.real
    }

    return mkNumber(sum)
}

export const subtraction = (args: Slang[]) => {
    const headArg = args[0]

    if (!headArg) {
        throw new SlangArityError('Subtraction needs at least one operand')
    } else if (!isNumber(headArg)) {
        throw new SlangTypeError('Value needs to be a number')
    }

    let diff = headArg.real

    for (const arg of args.slice(1)) {
        if (!isNumber(arg)) {
            throw new SlangTypeError('Value needs to be a number')
        }

        diff -= arg.real
    }

    return mkNumber(diff)
}

export const multiplication = (args: Slang[]) => {
    let prod = 1

    for (const arg of args) {
        if (arg.kind !== SlangTypes.Number) {
            throw new SlangTypeError('Expected number')
        }

        prod *= arg.real
    }

    return mkNumber(prod)
}