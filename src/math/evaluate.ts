import {
	EvalArg,
	Node,
	isNumber,
	isSymbol,
	isHole,
	isPositive,
	isBracket,
	isOpposite,
	isRadical,
	isDifference,
	isPower,
	isQuotient,
	isDivision,
	isSum,
	isProduct,
	isProductPoint,
	isProductImplicit,
	isCos,
	isSin,
	isTan,
	isLn,
	isExp,
	isLog,
} from './types'

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

export default function evaluate(node: Node, params: EvalArg): Decimal {
	if (isNumber(node)) {
		return node.value
	} else if (isSymbol(node)) {
		throw new Error(`Le symbole ${node.symbol} doit être substitué.`)
	} else if (isHole(node)) {
		throw new Error(`Impossible d'évaluer une expression contenant un trou.`)
	} else if (isPositive(node) || isBracket(node)) {
		return evaluate(node.first, params)
	} else if (isOpposite(node)) {
		return evaluate(node.first, params).mul(-1)
	} else if (isRadical(node)) {
		return evaluate(node.first, params).sqrt()
	} else if (isDifference(node)) {
		return evaluate(node.first, params).sub(evaluate(node.last, params))
	} else if (isPower(node)) {
		return evaluate(node.first, params).pow(evaluate(node.last, params))
	} else if (isQuotient(node) || isDivision(node)) {
		return evaluate(node.first, params).div(evaluate(node.last, params))
	} else if (isSum(node)) {
		return node.children.reduce(
			(sum, child) => sum.add(evaluate(child, params)),
			new Decimal(0),
		)
	} else if (
		isProduct(node) ||
		isProductPoint(node) ||
		isProductImplicit(node)
	) {
		return node.children.reduce(
			(sum, child) => sum.mul(evaluate(child, params)),
			new Decimal(1),
		)
	}

	// case TYPE_ABS: {
	//   const v = evaluate(node.first, params)
	//   if (v.isNegative()) {
	//     return v.mul(-1)
	//   } else {
	//     return v
	//   }
	// }
	else if (isCos(node)) {
		return evaluate(node.first, params).cos()
	} else if (isSin(node)) {
		return evaluate(node.first, params).sin()
	} else if (isTan(node)) {
		return evaluate(node.first, params).tan()
	} else if (isLn(node)) {
		return evaluate(node.first, params).ln()
	} else if (isExp(node)) {
		return evaluate(node.first, params).exp()
	} else if (isLog(node)) {
		return evaluate(node.first, params).log()
	} else {
		throw new Error(
			'Exp non recognized for decimal evaluation : ' + node.string,
		)
	}
}
