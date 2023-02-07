console.log('module math')
import Decimal from 'decimal.js'
import parser from './parser'
import { ParserOptions } from './types'

type MathArg = number | Decimal | string
export function math(exp: MathArg, options?: ParserOptions) {
	return parser(options).parse(exp)
}
console.log('end module math')
