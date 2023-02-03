import Decimal from 'decimal.js'
import parser from './parser'

type MathArg = number | Decimal | string
export function math(exp: MathArg, options?) {
	return parser(options).parse(exp)
}
