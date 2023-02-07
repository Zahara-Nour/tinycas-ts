import {
	TYPE_POSITIVE,
	TYPE_BRACKET,
	TYPE_DIFFERENCE,
	TYPE_DIVISION,
	TYPE_HOLE,
	TYPE_NUMBER,
	TYPE_OPPOSITE,
	TYPE_POWER,
	TYPE_PRODUCT,
	TYPE_PRODUCT_IMPLICIT,
	TYPE_PRODUCT_POINT,
	TYPE_QUOTIENT,
	TYPE_RADICAL,
	TYPE_SUM,
	TYPE_SYMBOL,
	TYPE_COS,
	TYPE_SIN,
	TYPE_TAN,
	TYPE_LN,
	TYPE_EXP,
	EvalArg,
	Expression,
} from './types.js'

import Decimal from 'decimal.js'

// Decimal.set({ toExpPos: 20 })
// const a = new Decimal('50388979879871545478.334343463469121445345434456456465412321321321546546546478987987')
// console.log('a', a.toString())
// const b = new Decimal('-0.2').toFraction()
// console.log('b', b.toString())

// Evaluation décimale d'une expression normalisée dont les symboles ont été substitués.
// Pour éviter les conversions répétées, renvoie un Decimal
// Les unités ne sont pas gérées ici, mais dans la fonction appelante eval() associée
// à node
// ???  est ce que les children ont déjà été évalués ?

export default function evaluate(node: Expression, params: EvalArg): Decimal {
	switch (node.type) {
		case TYPE_NUMBER:
			return node.value

		case TYPE_SYMBOL:
			throw new Error(`Le symbole ${node.letter} doit être substitué.`)

		case TYPE_HOLE:
			throw new Error(`Impossible d'évaluer une expression contenant un trou.`)

		case TYPE_POSITIVE:
		case TYPE_BRACKET:
			return evaluate(node.first, params)

		case TYPE_OPPOSITE:
			return evaluate(node.first, params).mul(-1)

		case TYPE_RADICAL:
			return evaluate(node.first, params).sqrt()

		case TYPE_DIFFERENCE:
			return evaluate(node.first, params).sub(evaluate(node.last, params))

		case TYPE_POWER:
			return evaluate(node.first, params).pow(evaluate(node.last, params))

		case TYPE_QUOTIENT:
		case TYPE_DIVISION:
			return evaluate(node.first, params).div(evaluate(node.last, params))

		case TYPE_SUM:
			return node.children.reduce(
				(sum, child) => sum.add(evaluate(child, params)),
				new Decimal(0),
			)

		case TYPE_PRODUCT:
		case TYPE_PRODUCT_IMPLICIT:
		case TYPE_PRODUCT_POINT:
			return node.children.reduce(
				(sum, child) => sum.mul(evaluate(child, params)),
				new Decimal(1),
			)

		// case TYPE_ABS: {
		//   const v = evaluate(node.first, params)
		//   if (v.isNegative()) {
		//     return v.mul(-1)
		//   } else {
		//     return v
		//   }
		// }

		case TYPE_COS: {
			return evaluate(node.first, params).cos()
		}

		case TYPE_SIN: {
			return evaluate(node.first, params).sin()
		}

		case TYPE_TAN: {
			return evaluate(node.first, params).tan()
		}

		case TYPE_LN: {
			return evaluate(node.first, params).ln()
		}

		case TYPE_EXP: {
			return evaluate(node.first, params).exp()
		}

		default:
			throw new Error(
				'Exp non recognized for decimal evaluation : ' + node.string,
			)
	}
}
