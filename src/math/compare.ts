import {
	TYPE_BOOLEAN,
	TYPE_BRACKET,
	TYPE_COS,
	TYPE_DIFFERENCE,
	TYPE_DIVISION,
	TYPE_EQUALITY,
	TYPE_ERROR,
	TYPE_EXP,
	TYPE_FLOOR,
	TYPE_GCD,
	TYPE_HOLE,
	TYPE_IDENTIFIER,
	TYPE_INEQUALITY_LESS,
	TYPE_INEQUALITY_LESSOREQUAL,
	TYPE_INEQUALITY_MORE,
	TYPE_INEQUALITY_MOREOREQUAL,
	TYPE_LIMIT,
	TYPE_LN,
	TYPE_LOG,
	TYPE_MOD,
	TYPE_NUMBER,
	TYPE_OPPOSITE,
	TYPE_PERCENTAGE,
	TYPE_POSITIVE,
	TYPE_POWER,
	TYPE_PRODUCT,
	TYPE_PRODUCT_IMPLICIT,
	TYPE_PRODUCT_POINT,
	TYPE_QUOTIENT,
	TYPE_RADICAL,
	TYPE_SEGMENT_LENGTH,
	TYPE_SIN,
	TYPE_SUM,
	TYPE_SYMBOL,
	TYPE_TAN,
	TYPE_TEMPLATE,
	TYPE_UNEQUALITY,
	TYPE_UNIT,
	TYPE_NPRODUCT,
	TYPE_NSUM,
	CompareArg,
	NlistElement,
	isNlist,
	isExpression,
	isNormal,
	isNumber,
	Numbr,
	isSymbol,
	isIdentifier,
	isHole,
	isTemplate,
	isExpressionWithChildren,
	ExpressionWithChildren,
	isIncorrectExp,
	IncorrectExp,
	isLimit,
	Limit,
} from './types'
/**
 * Un ordre doit être défini sur les expressions afin de créer les formes normales, qui permettent d'identifier
 * deux expressions équivalentes
 * ordre choisi:
 * 2 < a < ? < boolean < template < positive< opposite < percentage < segment length < () < function < operations +  - * : / <  "<" , "<=" , ">" , ">=" , "="
 * pour les autres type, on compare les formes normales, termes à termes
 * renvoie 1 si node1 > node2
 * renvoie 0 si node1 = node2
 * renvoie -1 si node1 < node2
 */

export default function compare(node1: CompareArg, node2: CompareArg) {
	let result: -1 | 0 | 1

	const priorityList = [
		TYPE_NUMBER,
		TYPE_SYMBOL,
		TYPE_IDENTIFIER,
		TYPE_HOLE,
		TYPE_BOOLEAN,
		TYPE_TEMPLATE,
		TYPE_POSITIVE,
		TYPE_OPPOSITE,
		TYPE_PERCENTAGE,
		TYPE_SEGMENT_LENGTH,
		TYPE_BRACKET,
		TYPE_COS,
		TYPE_SIN,
		TYPE_TAN,
		TYPE_LN,
		TYPE_LOG,
		TYPE_EXP,
		TYPE_RADICAL,
		TYPE_FLOOR,
		TYPE_GCD,
		TYPE_MOD,
		TYPE_SUM,
		TYPE_DIFFERENCE,
		TYPE_PRODUCT,
		TYPE_PRODUCT_IMPLICIT,
		TYPE_PRODUCT_POINT,
		TYPE_DIVISION,
		TYPE_QUOTIENT,
		TYPE_POWER,
		TYPE_UNIT,
		TYPE_EQUALITY,
		TYPE_UNEQUALITY,
		TYPE_INEQUALITY_LESS,
		TYPE_INEQUALITY_LESSOREQUAL,
		TYPE_INEQUALITY_MORE,
		TYPE_INEQUALITY_MOREOREQUAL,
		TYPE_ERROR,
		TYPE_NSUM,
		TYPE_NPRODUCT,
		TYPE_LIMIT,
	]

	// TODO: et l'unité ?

	if (
		!(priorityList.includes(node1.type) && priorityList.includes(node2.type))
	) {
		throw new Error(`type ${node1.type} forgotten`)
	}

	if (isNlist(node1) && isNlist(node2)) {
		const i1 = node1[Symbol.iterator]()
		const i2 = node2[Symbol.iterator]()
		let next1 = i1.next()
		let next2 = i2.next()

		while (!next1.done && !next2.done) {
			const child1: NlistElement = next1.value
			const child2: NlistElement = next2.value

			// on compare d'abord les bases
			// base1 et base2 sont soit un nProduct, soit une exp
			const base1 = child1[1]
			const base2 = child2[1]

			if (isNlist(base1) && isNlist(base2)) {
				result = base1.compareTo(base2)
			} else if (isExpression(base1) && isExpression(base2)) {
				result = base1.compareTo(base2)
			} else {
				throw new Error('impossible to compare bases.')
			}

			if (result !== 0) return result

			// ce n'est pas concluant, on passe aux coefs
			const coef1 = child1[0]
			const coef2 = child2[0]
			if (isNlist(coef1) && isNlist(coef2)) {
				result = coef1.compareTo(coef2)
				if (result !== 0) return result
			} else if (isExpression(coef1) && isExpression(coef2)) {
				// ce sont des number ou rationels, on compare les valeurs numériques
				if (coef1.isLowerThan(coef2)) {
					return -1
				} else if (coef1.isGreaterThan(coef2)) {
					return 1
				}
			} else {
				throw new Error('unable to compare coefs.')
			}
			//  La comparaison n'est toujours pas concluante, on passe au terme suivant
			next1 = i1.next()
			next2 = i2.next()
		}
		if (next1.done && next2.done) {
			return 0 // les expressions sont équivalentes
		}
		if (next1.done) return -1 // il reste des éléments dans l'expression2 : c'est elle la + grande
		return 1 // c'est exp1 la + grande
	}
	// on doit comparer des formes normales
	else if (isNormal(node1) && isNormal(node2)) {
		result = node1.n.mult(node2.d).compareTo(node2.n.mult(node1.d))

		if (result === 0) {
			//  on doit comparer les unités
			if (node1.unit && node2.unit) {
				result = node1.unit.compareTo(node2.unit)
			} else if (node1.unit) {
				result = 1
			} else if (node2.unit) {
				result = -1
			}
		}
		return result
	}
	// on doit comparer des Expressions
	else if (isExpression(node1) && isExpression(node2)) {
		if (node1.type === node2.type) {
			if (isNumber(node1)) {
				if (node1.value.lt((node2 as Numbr).value)) {
					return -1
				} else if (node1.value.gt((node2 as Numbr).value)) {
					return 1
				}
				return 0
			} else if (isSymbol(node1) || isIdentifier(node1)) {
				if (node1.string < node2.string) {
					return -1
				} else if (node1.string > node2.string) {
					return 1
				} else {
					return 0
				}
			} else if (isHole(node1) || isTemplate(node1)) {
				return 0
			} else if (isExpressionWithChildren(node1) && !isLimit(node1)) {
				for (let i = 0; i < node1.children.length; i++) {
					const comparaison = node1.children[i].compareTo(
						(node2 as ExpressionWithChildren).children[i],
					)
					if (comparaison) return comparaison
				}
				return 0
			} else if (isIncorrectExp(node1)) {
				if (node1.message < (node2 as IncorrectExp).message) {
					return -1
				} else if (node1.message > (node2 as IncorrectExp).message) {
					return 1
				}
				return 0
			} else if (isLimit(node1)) {
				if (node1.first.isSymbol() && (node2 as Limit).first.isSymbol()) {
					return node1.sign < (node2 as Limit).sign
						? -1
						: node1.sign > (node2 as Limit).sign
						? 1
						: 0
				} else if (node1.first.isSymbol()) {
					return 1
				} else if ((node2 as Limit).first.isSymbol()) {
					return -1
				} else {
					if (node1.first.equals((node2 as Limit).first)) {
						return node1.sign < (node2 as Limit).sign
							? -1
							: node1.sign > (node2 as Limit).sign
							? 1
							: 0
					} else {
						return node1.first.compareTo((node2 as Limit).first)
					}
				}
			} else {
				throw new Error(`type ${node1.type} forgotten in the compare list`)
			}
		} else {
			return priorityList.indexOf(node1.type) < priorityList.indexOf(node2.type)
				? -1
				: 1
		}
	} else {
		throw new Error(`incompatible types to compare ${node1} ${node2}`)
	}
}
