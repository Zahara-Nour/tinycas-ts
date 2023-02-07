import {
	Node,
	isFunction,
	isNumber,
	isSum,
	isDifference,
	isOpposite,
	isProduct,
	isProductImplicit,
	isProductPoint,
	isDivision,
	isQuotient,
	isSymbol,
	isExp,
	isLn,
	isCos,
	isSin,
	isPower,
	isRadical,
	isExpressionWithChildren,
	isBracket,
	SignedTerm,
	isPositive,
	Numbr,
	isTemplate,
	Template,
	isHole,
	isIncorrectExp,
	isSegmentLength,
} from './types'

import { math } from './math'
import Decimal from 'decimal.js'
import { gcd, shuffle } from '../utils/utils'
import {
	createNode,
	notdefined,
	number,
	product,
	productImplicit,
	symbol,
} from './node'

const constants: { [key: string]: string } = {
	pi: '3.14',
	e: '2.7',
}

export function compose(node: Node, g: Node, variable = 'x') {
	const replace = () => {
		return '(' + g.string + ')'
	}
	return math(
		node.string.replace(new RegExp(`(${variable})(?!p)(?<!e)`, 'g'), replace),
	).removeUnecessaryBrackets()
}

export function beautify(node: Node) {
	return node.normal.node
}

export function derivate(node: Node, variable = 'x') {
	let e: Node = node

	//  si c'est une fonction composée
	if (isFunction(node) && node.first.string !== variable) {
		const g = node.first
		// const f = createNode({type:node.type, children:node.children.map(c => math(c.string))})
		const f = createNode({
			prototype: Object.getPrototypeOf(node),
			children: [symbol(variable)],
		})
		const fprime = f.derivate(variable)
		e = g.derivate(variable).mult(fprime.compose(g, variable))
	} else if (isNumber(node)) {
		e = number(0)
	} else if (isSum(node)) {
		e = node.first
			.derivate(variable)
			.bracket()
			.add(node.last.derivate(variable).bracket())
	} else if (isDifference(node)) {
		e = node.first
			.derivate(variable)
			.bracket()
			.sub(node.last.derivate(variable).bracket())
	} else if (isOpposite(node)) {
		e = node.first.derivate(variable).oppose()
	} else if (
		isProduct(node) ||
		isProductImplicit(node) ||
		isProductPoint(node)
	) {
		e = node.first
			.derivate(variable)
			.mult(node.last)
			.add(node.first.mult(node.last.derivate(variable)))
	} else if (isDivision(node) || isQuotient(node)) {
		e = node.first
			.derivate(variable)
			.mult(node.last)
			.sub(node.first.mult(node.last.derivate(variable)))
			.frac(node.last.pow(number(2)))
	} else if (isSymbol(node)) {
		e = node.string === variable ? number(1) : number(0)
	} else if (isExp(node)) {
		e = node.first.derivate(variable).mult(node)
	} else if (isLn(node)) {
		e = node.first.derivate(variable).mult(node.first.inverse())
	} else if (isCos(node)) {
		e = node.first.derivate(variable).mult(node.first.sin().oppose())
	} else if (isSin(node)) {
		e = node.first.derivate(variable).mult(node.first.cos())
	} else if (isPower(node)) {
		const f = node.first
		const g = node.last
		const fprime = f.derivate(variable)
		const gprime = g.derivate(variable)

		e = gprime
			.mult(f.ln())
			.add(g.mult(fprime.frac(f)))
			.mult(f.pow(g))
	} else if (isRadical(node)) {
		e = node.first.derivate(variable).frac(number(2).mult(node.first.radical()))
	}

	return e.normal.node
}

export function reduceFractions(node: Node) {
	// On considère que les fractions sont composées de nombres positifs. Il faut appeler removeSign avant ?

	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.reduceFractions()),
		  })
		: node

	if (
		e.isNumeric() &&
		isQuotient(e) &&
		(isNumber(e.first) ||
			(isOpposite(e.first) && isNumber(e.first.first)) ||
			(isBracket(e.first) &&
				(isNumber(e.first.first) ||
					(isOpposite(e.first.first) && isNumber(e.first.first.first))))) &&
		(isNumber(e.last) ||
			(isOpposite(e.last) && isNumber(e.last.first)) ||
			(isBracket(e.last) &&
				(isNumber(e.last.first) ||
					(isOpposite(e.last.first) && isNumber(e.last.first.first)))))
	) {
		e = e.reduce()
	}

	e = math(e.string)
	e.unit = node.unit
	return e
}

export function removeZerosAndSpaces(node: Node) {
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.removeZerosAndSpaces()),
		  })
		: math(node.string)

	if (isNumber(node)) {
		e = e.eval({ decimal: true })
	}
	e.unit = node.unit

	return e
}

export function removeMultOperator(node: Node) {
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.removeMultOperator()),
		  })
		: math(node.string)

	if (
		isProduct(node) &&
		(isFunction(node.last) ||
			isBracket(node.last) ||
			isSymbol(node.last) ||
			(isPower(node.last) && isSymbol(node.last.first)))
	) {
		e = productImplicit([node.first, node.last])
	}
	e.unit = node.unit
	return e
}

export function removeNullTerms(node: Node) {
	let e: Node

	if (isSum(node)) {
		const first = node.first.removeNullTerms()
		const last = node.last.removeNullTerms()

		if (first.equalsZero() && last.equalsZero()) {
			e = number(0)
		} else if (first.equalsZero()) {
			e = math(last.string)
		} else if (last.equalsZero()) {
			e = math(first.string)
		} else {
			e = first.add(last)
		}
	} else if (isDifference(node)) {
		const first = node.first.removeNullTerms()
		const last = node.last.removeNullTerms()

		if (first.equalsZero() && last.equalsZero()) {
			e = number(0)
		} else if (first.equalsZero()) {
			e = math(last.string).oppose()
		} else if (last.equalsZero()) {
			e = math(first.string)
		} else {
			e = first.sub(last)
		}
	} else if (isExpressionWithChildren(node)) {
		e = node.copy({
			children: node.children.map((child) => child.removeNullTerms()),
		})
	} else {
		e = math(node.string)
	}

	e.unit = node.unit
	return e
}

export function removeFactorsOne(node: Node) {
	let e: Node

	if (isProduct(node)) {
		const first = node.first.removeFactorsOne()
		const last = node.last.removeFactorsOne()

		if (first.isOne() && last.isOne()) {
			e = number(1)
		} else if (first.isOne()) {
			// e = math(last.string)
			e = last
			if (isBracket(e)) {
				e = e.first
			}
		} else if (last.isOne()) {
			// e = math(first.string)
			e = first
			if (isBracket(e)) {
				e = e.first
			}
		} else {
			e = node.copy({ children: [first, last] })
		}
	} else if (isExpressionWithChildren(node)) {
		e = node.copy({
			children: node.children.map((child) => child.removeFactorsOne()),
		})
	} else {
		e = math(node.string)
	}

	if (node.unit && !e.unit) {
		e.unit = node.unit
	}
	return e
}

export function simplifyNullProducts(node: Node) {
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.simplifyNullProducts()),
		  })
		: math(node.string)
	if (isProduct(node)) {
		const factors = e.factors
		if (factors.some((factor) => factor.isZero())) {
			e = number(0)
		}
	}
	e.unit = node.unit
	return e
}

export function removeUnecessaryBrackets(
	node: Node,
	allowFirstNegativeTerm = false,
) {
	let e: Node
	if (
		isBracket(node) &&
		(!node.parent ||
			node.parent.isFunction() ||
			node.parent.isBracket() ||
			node.first.isFunction() ||
			node.first.isHole() ||
			node.first.isNumber() ||
			node.first.isSymbol() ||
			(node.parent.isSum() && node.first.isSum()) ||
			(node.parent.isSum() && node.first.isDifference()) ||
			(node.parent.isSum() && node.first.isProduct()) ||
			(node.parent.isSum() && node.first.isQuotient()) ||
			(node.parent.isSum() && node.first.isDivision()) ||
			(node.parent.isSum() && node.first.isPower()) ||
			(node.parent.isOpposite() && node.first.isProduct()) ||
			(node.parent.isOpposite() && node.first.isQuotient()) ||
			(node.parent.isOpposite() && node.first.isDivision()) ||
			(node.parent.isDifference() && node.first.isSum() && node.isFirst()) ||
			(node.parent.isDifference() &&
				node.first.isDifference() &&
				node.isFirst()) ||
			(node.parent.isDifference() && node.first.isProduct()) ||
			(node.parent.isDifference() && node.first.isQuotient()) ||
			(node.parent.isDifference() && node.first.isDivision()) ||
			(node.parent.isDifference() && node.first.isPower()) ||
			(node.parent.isProduct() && node.first.isProduct()) ||
			(node.parent.isProduct() && node.first.isQuotient() && node.isFirst()) ||
			(node.parent.isProduct() && node.first.isDivision()) ||
			(node.parent.isProduct() && node.first.isPower()) ||
			(node.parent.isQuotient() && node.first.isProduct() && node.isFirst()) ||
			(node.parent.isQuotient() && node.first.isQuotient() && node.isFirst()) ||
			(node.parent.isQuotient() && node.first.isDivision() && node.isFirst()) ||
			(node.parent.isQuotient() && node.first.isPower()) ||
			(node.parent.isDivision() && node.first.isProduct() && node.isFirst()) ||
			(node.parent.isDivision() && node.first.isQuotient() && node.isFirst()) ||
			(node.parent.isDivision() && node.first.isDivision() && node.isFirst()) ||
			(node.parent.isDivision() && node.first.isPower()) ||
			(node.parent.isPower() && node.first.isPower() && node.isFirst()) ||
			(node.parent.isPower() && node.isLast()) ||
			(!allowFirstNegativeTerm &&
				node.parent.isSum() &&
				node.first.isOpposite() &&
				node.isFirst()) ||
			(!allowFirstNegativeTerm &&
				node.parent.isSum() &&
				node.first.isPositive() &&
				node.isFirst()) ||
			(!allowFirstNegativeTerm &&
				node.parent.isDifference() &&
				node.first.isOpposite() &&
				node.isFirst()) ||
			(!allowFirstNegativeTerm &&
				node.parent.isDifference() &&
				node.first.isPositive() &&
				node.isFirst()) ||
			node.parent.isEquality() ||
			node.parent.isUnequality() ||
			node.parent.isInequality() ||
			// cas ou les brackets doivent être remplacées par des curly brackets en sortie
			(node.parent.isProduct() && node.first.isQuotient() && node.isLast()) ||
			(node.parent.isQuotient() && node.first.isProduct() && node.isLast()) ||
			(node.parent.isQuotient() && node.first.isQuotient() && node.isLast()) ||
			(node.parent.isQuotient() && node.first.isDivision() && node.isLast()) ||
			(node.parent.isQuotient() && node.first.isOpposite()) ||
			(node.parent.isQuotient() && node.first.isSum()) ||
			(node.parent.isQuotient() && node.first.isDifference()))
	) {
		e = node.first.removeUnecessaryBrackets(allowFirstNegativeTerm)
	} else if (isExpressionWithChildren(node)) {
		e = node.copy({
			children: node.children.map((child) =>
				child.removeUnecessaryBrackets(allowFirstNegativeTerm),
			),
		})
	} else {
		e = math(node.string)
	}
	e.unit = node.unit

	return e
}

export function shallowShuffleTerms(node: Node) {
	const terms = node.terms
	shuffle(terms)

	const firstTerm = terms.pop() as SignedTerm
	let e = firstTerm.op === '+' ? firstTerm.term : firstTerm.term.oppose()
	terms.forEach((term) => {
		e = term.op === '+' ? e.add(term.term) : e.sub(term.term)
	})
	e.unit = node.unit
	return e
}

export function shuffleTerms(node: Node) {
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.shuffleTerms()),
		  })
		: math(node.string)
	const terms = e.terms
	shuffle(terms)

	const firstTerm = terms.pop() as SignedTerm
	e = firstTerm.op === '+' ? firstTerm.term : firstTerm.term.oppose()
	terms.forEach((term) => {
		e = term.op === '+' ? e.add(term.term) : e.sub(term.term)
	})
	e.unit = node.unit
	return e
}

export function shallowShuffleFactors(node: Node) {
	const factors = node.factors
	shuffle(factors)
	let e = factors.pop() as Node // factors is not empty
	factors.forEach((factor) => (e = e.mult(factor)))
	e.unit = node.unit
	return e
}

export function shuffleFactors(node: Node) {
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.shuffleFactors()),
		  })
		: math(node.string)
	const factors = node.factors
	shuffle(factors)

	e = factors.pop() as Node
	factors.forEach((factor) => (e = e.mult(factor)))
	e.unit = node.unit
	return e
}

export function shuffleTermsAndFactors(node: Node) {
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.shuffleTermsAndFactors()),
		  })
		: math(node.string)
	if (e.isProduct()) {
		e = e.shallowShuffleFactors()
	} else if (e.isSum() || e.isDifference()) {
		e = e.shallowShuffleTerms()
	}
	e.unit = node.unit
	return e
}

export function shallowSortTerms(node: Node) {
	let e: Node = notdefined('exp not initialized')
	if (node.isSum() || node.isDifference()) {
		const terms = node.terms

		const positives = terms
			.filter((term) => term.op === '+')
			.map((term) => term.term)
			.sort((a, b) => a.compareTo(b))

		const negatives = terms
			.filter((term) => term.op === '-')
			.map((term) => term.term)
			.sort((a, b) => a.compareTo(b))

		if (positives.length) {
			e = positives.shift() as Node
			positives.forEach((term) => (e = e.add(term)))
		}

		if (negatives) {
			if (!e.isIncorrect()) {
				e = (negatives.shift() as Node).oppose()
			}
			negatives.forEach((term) => (e = e.sub(term)))
		}
		e.unit = node.unit
	} else {
		e = node
	}

	return e
}

export function sortTerms(node: Node) {
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.sortTerms()),
		  })
		: math(node.string)
	if (node.isSum() || node.isDifference()) {
		e = e.shallowSortTerms()
	}
	e.unit = node.unit
	return e
}

export function shallowSortFactors(node: Node) {
	let e: Node

	if (node.isProduct()) {
		const factors = node.factors
		factors.sort((a, b) => a.compareTo(b))
		e = factors.shift() as Node
		factors.forEach((term) => (e = e.mult(term)))
		e.unit = node.unit
	} else {
		e = node
	}
	return e
}

export function sortFactors(node: Node) {
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.sortFactors()),
		  })
		: math(node.string)
	if (node.isProduct()) {
		e = e.shallowSortFactors()
	}
	e.unit = node.unit
	return e
}

export function sortTermsAndFactors(node: Node) {
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.sortTermsAndFactors()),
		  })
		: math(node.string)
	if (node.isSum() || node.isDifference()) {
		e = e.shallowSortTerms()
	} else if (node.isProduct()) {
		e = e.shallowSortFactors()
	}
	e.unit = node.unit
	return e
}

export function removeSigns(node: Node) {
	// sauvegarde du parent
	const parent = node.parent
	let e = isExpressionWithChildren(node)
		? node.copy({
				children: node.children.map((child) => child.removeSigns()),
		  })
		: math(node.string)

	// TODO: est-ce vraiment nécessaire ?

	if (isProduct(e) || isDivision(e) || isQuotient(e)) {
		let first: Node, last: Node
		let negative = false
		if (isBracket(e.first) && isOpposite(e.first.first)) {
			first = e.first.first.first
			negative = !negative
		} else if (isBracket(e.first) && isPositive(e.first.first)) {
			first = e.first.first.first
		} else if (isQuotient(e) && isOpposite(e.first)) {
			first = e.first.first
			negative = !negative
		} else {
			first = e.first
		}

		if (isBracket(e.last) && isOpposite(e.last.first)) {
			last = e.last.first.first
			negative = !negative
			if (!(last.isNumber() || last.isSymbol())) {
				last = last.bracket()
			}
		} else if (isBracket(e.last) && isPositive(e.last.first)) {
			last = e.last.first.first
		} else if (isQuotient(e) && isOpposite(e.last)) {
			last = e.last.first
			negative = !negative
		} else {
			last = e.last
		}

		if (e.isProduct()) {
			e = e.copy({ children: [first, last] })
			// e = first.mult(last)
		} else if (e.isDivision()) {
			e = first.div(last)
		} else {
			e = first.frac(last)
		}

		if (negative) {
			e = e.oppose()
		}
		// else {
		//   e = e.positive()
		// }
		if (
			negative &&
			parent &&
			!(
				parent.isBracket() ||
				parent.isQuotient() ||
				(parent.isPower() && e.isLast())
			)
		) {
			e = e.bracket()
		}
	} else if (isSum(e) && isBracket(e.last) && isOpposite(e.last.first)) {
		e = e.first.sub(e.last.first.first)
	} else if (isSum(e) && isBracket(e.last) && isPositive(e.last.first)) {
		e = e.first.add(e.last.first.first)
	} else if (isDifference(e) && isBracket(e.last) && isOpposite(e.last.first)) {
		e = e.first.add(e.last.first.first)
	} else if (isDifference(e) && isBracket(e.last) && isPositive(e.last.first)) {
		e = e.first.sub(e.last.first.first)
	} else if (isPositive(e) && isBracket(e.first) && isOpposite(e.first.first)) {
		e = e.first.first
	} else if (isPositive(e) && isBracket(e.first) && isPositive(e.first.first)) {
		e = e.first.first.first
	} else if (isOpposite(e) && isBracket(e.first) && isOpposite(e.first.first)) {
		e = e.first.first.first.positive()
	} else if (isOpposite(e) && isBracket(e.first) && isPositive(e.first.first)) {
		e = e.first.first.first.oppose()
	} else if (isBracket(e) && isPositive(e.first)) {
		if (
			parent &&
			(parent.isQuotient() || parent.isDivision()) &&
			node.isLast() &&
			(e.first.first.isQuotient() || e.first.first.isDivision())
		) {
			e = e.first.first.bracket()
		} else {
			e = e.first.first
		}
	}

	if ((!parent || !parent.isBracket()) && isPositive(e)) {
		e = e.first
	}

	// else if (e.parent  && e.parent.isBracket() && e.isPositive()) {
	//   e = e.first.first.removeSigns()
	// }

	// else if (e.isPositive()) {
	//   e = e.first.removeSigns()
	// }
	e = math(e.string)
	e.unit = node.unit
	e.parent = parent
	return e
}

export function substitute(node: Node, values: Record<string, string>) {
	let e = node
	if (!values) return e

	if (isSymbol(node)) {
		if (!constants[node.symbol] && !values[node.symbol]) {
			return e
		} else if (constants[node.symbol]) {
			e = math(constants[node.symbol])
		} else {
			e = math(values[node.symbol])
			// on refait une substitution au cas où un nouveau symbol a été introduit
			e = substitute(e, values)
		}
	} else if (isExpressionWithChildren(node)) {
		e = node.copy({
			children: node.children.map((child) => substitute(child, values)),
		})
	} else {
		e = math(node.string)
	}
	e.unit = node.unit

	return e
}

// function getRandomArbitrary(min: number, max: number) {
// 	return Math.random() * (max - min) + min
// }

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}

function getIntOfNdigits(nmin: number, nmax: number, trailingzero = true) {
	// inclusive

	function getNumber() {
		return getRandomInt(
			nmin === 0 ? 0 : Math.pow(10, nmin - 1),
			nmax === 0 ? 0 : Math.pow(10, getRandomIntInclusive(nmin, nmax)),
		)
	}
	let v = getNumber()

	if (!trailingzero && nmax !== 0) {
		while (v % 10 === 0) {
			v = getNumber()
		}
	}
	return v
}

function isInSegment(x: Numbr, a: Numbr, b: Numbr) {
	return b.value.gte(x.value) && a.value.lte(x.value)
}

//   La génération d'un template doit retouner une valeur numérique.
//  Contrairement à la fonction générale "generate", il faut donc substituer les variables.
function generateTemplate(node: Template) {
	const decimal = node.nature === '$$'
	const precision = node.precision

	let e: Node
	let value: Decimal
	let decimalPart: number
	let integerPart: number
	let ref
	let include
	let exclude: Node[]

	switch (node.nature) {
		case '$e':
		case '$ep':
		case '$ei': {
			let doItAgain = false
			const children = node.children.map((child) =>
				isTemplate(child)
					? generateTemplate(child)
					: generate(Object.assign(child.substitute(), { parent: node })).eval({
							decimal,
							precision,
					  }),
			)

			const excludeMin = node.excludeMin
			const excludeMax = node.excludeMax
			const excludeDivider = node.excludeDivider
			const excludeMultiple = node.excludeMultiple
			const exclude = node.exclude
				? node.exclude.map((child) =>
						isTemplate(child)
							? generateTemplate(child)
							: generate(
									Object.assign(child.substitute(), { parent: node }),
							  ).eval({
									decimal,
									precision,
							  }),
				  )
				: null

			const excludeCommonDividersWith = node.excludeCommonDividersWith
				? node.excludeCommonDividersWith.map((child) =>
						isTemplate(child)
							? generateTemplate(child)
							: generate(
									Object.assign(child.substitute(), { parent: node }),
							  ).eval({
									decimal,
									precision,
							  }),
				  )
				: null

			do {
				// whatis children[1] ?
				// ça veut dire une expression du type $e{;}
				doItAgain = false
				if (!children[1].isHole()) {
					e = number(
						getIntOfNdigits(
							isHole(children[0]) ? 1 : (children[0] as Numbr).value.toNumber(),
							(children[1] as Numbr).value.toNumber(),
						),
					)
					if (node.relative && !e.isZero()) {
						if (getRandomIntInclusive(0, 1)) {
							e = e.oppose()
						} else if (node.signed) {
							e = e.positive()
						}
					}

					doItAgain =
						!!exclude && exclude.map((exp) => exp.string).includes(e.string)
				} else {
					e = number(
						getRandomIntInclusive(
							isOpposite(children[2])
								? (children[2].first as Numbr).value.toNumber() * -1
								: (children[2] as Numbr).value.toNumber(),
							isOpposite(children[3])
								? (children[3].first as Numbr).value.toNumber() * -1
								: (children[3] as Numbr).value.toNumber(),
						),
					)
					if (node.relative && !e.isZero()) {
						if (getRandomIntInclusive(0, 1)) {
							e = e.oppose()
						} else if (node.signed) {
							e = e.positive()
						}
					}
					doItAgain =
						(!!exclude &&
							exclude.map((exp) => exp.string).includes(e.string)) ||
						(!!excludeMin &&
							isInSegment(e as Numbr, excludeMin as Numbr, excludeMax as Numbr))
				}
				if (excludeMultiple) {
					doItAgain =
						doItAgain ||
						excludeMultiple.some((elt) =>
							(e as Numbr).value.mod((elt.eval() as Numbr).value).equals(0),
						)
				}
				if (excludeDivider) {
					doItAgain =
						doItAgain ||
						excludeDivider.some((elt) =>
							(elt.eval() as Numbr).value.mod((e as Numbr).value).equals(0),
						)
				}
				if (excludeCommonDividersWith) {
					doItAgain =
						doItAgain ||
						excludeCommonDividersWith.some((elt) => {
							const aExp = elt.generate().eval()
							const a = isOpposite(aExp)
								? (aExp.first as Numbr).value.toNumber()
								: (aExp as Numbr).value.toNumber()
							const bExp = e.generate().eval()
							const b = isOpposite(bExp)
								? (bExp.first as Numbr).value.toNumber()
								: (bExp as Numbr).value.toNumber()
							return gcd(a, b) !== 1
						})
				}
			} while (doItAgain)

			node.root.generated.push(e)
			break
		}
		case '$d': {
			const children = node.children.map((child) =>
				isTemplate(child)
					? generateTemplate(child)
					: generate(Object.assign(child.substitute(), { parent: node })).eval({
							decimal,
							precision,
					  }),
			)
			if (children[0]) {
				// partie entière
				integerPart = (children[0].generate() as Numbr).value.toNumber()
				decimalPart = (children[1].generate() as Numbr).value.toNumber()
				// console.log('inteferpart', integerPart)
				value = new Decimal(getIntOfNdigits(integerPart, integerPart))

				//  partie décimale
				value = value.add(
					new Decimal(getIntOfNdigits(decimalPart, decimalPart, false)).div(
						Math.pow(10, decimalPart),
					),
				)
			} else {
				const integerPartMin = (
					children[2].generate() as Numbr
				).value.toNumber()
				const integerPartMax = (
					children[3].generate() as Numbr
				).value.toNumber()
				const decimalPartMin = (
					children[4].generate() as Numbr
				).value.toNumber()
				const decimalPartMax = (
					children[5].generate() as Numbr
				).value.toNumber()
				integerPart = getRandomIntInclusive(integerPartMin, integerPartMax)
				decimalPart = getRandomIntInclusive(decimalPartMin, decimalPartMax)
				value = new Decimal(integerPart).div(Math.pow(10, decimalPart))
			}

			// pourquoi aussi compliqué ?
			e = number(value)

			if (node.relative && getRandomIntInclusive(0, 1)) e = e.oppose()

			node.root.generated.push(e)
			break
		}

		case '$l': {
			// const children = node.children.map(
			//   child =>
			//     child.isTemplate()
			//       ? generateTemplate(child)
			//       : generate(Object.assign(child.substitute(), { parent: node }))
			// )
			const children = node.children
			include = children

			let doItAgain = false
			if (node.exclude) {
				const excludeStrings = node.exclude.map((exp) => exp.eval().string)
				// console.log('exclude', exclude)
				include = include.filter((elt) => !excludeStrings.includes(elt.string))
			}
			do {
				doItAgain = false
				e = include[Math.floor(Math.random() * include.length)]
				doItAgain =
					!!node.excludeMin &&
					isInSegment(
						e as Numbr,
						node.excludeMin as Numbr,
						node.excludeMax as Numbr,
					)
				if (node.excludeMultiple) {
					doItAgain =
						doItAgain ||
						(node.excludeMultiple &&
							node.excludeMultiple.some((elt) =>
								(e as Numbr).value.mod((elt.eval() as Numbr).value).isZero(),
							))
				}
				if (node.excludeDivider) {
					doItAgain =
						doItAgain ||
						(node.excludeDivider &&
							node.excludeDivider.some((elt) =>
								(elt.eval() as Numbr).value.mod((e as Numbr).value).isZero(),
							))
				}
			} while (doItAgain)
			e = e.generate()
			node.root.generated.push(e)
			break
		}
		case '$':
		case '$$': {
			const children = node.children.map((child) =>
				isTemplate(child)
					? generateTemplate(child)
					: generate(Object.assign(child.substitute(), { parent: node })).eval({
							decimal,
							precision,
					  }),
			)
			e = children[0]
			node.root.generated.push(e)
			break
		}

		default:
			// $1....

			ref = parseInt(node.nature.slice(1, node.nature.length), 10)
			e = node.root.generated[ref - 1]
	}

	if (node.unit) e.unit = node.unit
	return e
}

// génération d'une expression quelconque
export function generate(node: Node) {
	let e: Node = node

	if (isTemplate(node)) {
		e = generateTemplate(node)
	} else if (
		isSymbol(node) ||
		isHole(node) ||
		isNumber(node) ||
		isIncorrectExp(node) ||
		isSegmentLength(node)
	) {
		e = node
	} else if (isExpressionWithChildren(node)) {
		e = node.copy({
			children: node.children.map((child) => generate(child)),
		})
	}
	return e
}
