import Decimal from 'decimal.js'
import parser from './parser.js'

type MathArg = number | Decimal | string
export function math(exp: MathArg, options?) {
	return parser(options).parse(exp)
}
