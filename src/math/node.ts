import evaluate from './evaluate'
import fraction from './fraction'
import { text, latex, texmacs } from './output'
import compare from './compare'
import {
	substitute,
	generate,
	sortTermsAndFactors,
	removeUnecessaryBrackets,
	removeSigns,
	removeNullTerms,
	removeFactorsOne,
	removeMultOperator,
	reduceFractions,
	shallowShuffleFactors,
	shallowShuffleTerms,
	sortTerms,
	sortFactors,
	shallowSortTerms,
	shallowSortFactors,
	simplifyNullProducts,
	removeZerosAndSpaces,
	shuffleTerms,
	shuffleFactors,
	shuffleTermsAndFactors,
	compose,
	derivate,
} from './transform'
import Decimal from 'decimal.js'
import { math } from './math'
import {
	Abs,
	Bool,
	Bracket,
	CopyArg,
	Cos,
	CreateNodeArg,
	Difference,
	Division,
	Equality,
	EvalArg,
	Exp,
	ExpressionWithChildren,
	Floor,
	Gcd,
	Hole,
	Identifier,
	IncorrectExp,
	InequalityLess,
	InequalityLessOrEqual,
	InequalityMore,
	InequalityMoreOrEqual,
	isBoolean,
	isDifference,
	isEquality,
	isExpressionWithChildren,
	isHole,
	isIdentifier,
	isIncorrectExp,
	isInequalityLess,
	isInequalityLessOrEqual,
	isInequalityMore,
	isInequalityMoreOrEQual,
	isInt,
	isLimit,
	isMaxP,
	isMinP,
	isNumber,
	isOpposite,
	isPositive,
	isProduct,
	isRelations,
	isSegmentLength,
	isSum,
	isSymbol,
	isTemplate,
	Limit,
	Log,
	LogN,
	Max,
	MaxP,
	Min,
	MinP,
	Mod,
	Node,
	NonEmptyArr,
	Numbr,
	Opposite,
	Percentage,
	Positive,
	Power,
	Product,
	ProductImplicit,
	ProductPoint,
	Quotient,
	Radical,
	Relations,
	SegmentLength,
	SignedTerm,
	Sin,
	Sum,
	Symbl,
	Tan,
	Template,
	TemplateArg,
	Time,
	ToLatexArg,
	ToStringArg,
	ToTexmacsArg,
	TYPE_ABS,
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
	TYPE_MAX,
	TYPE_MAXP,
	TYPE_MIN,
	TYPE_MINP,
	TYPE_MOD,
	TYPE_NOT_INITALIZED,
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
	TYPE_RELATIONS,
	TYPE_SEGMENT_LENGTH,
	TYPE_SIN,
	TYPE_SUM,
	TYPE_SYMBOL,
	TYPE_TAN,
	TYPE_TEMPLATE,
	TYPE_TIME,
	TYPE_UNEQUALITY,
	Unequality,
} from './types'
import { unit } from './unit'
import normalize from './normal'

Decimal.set({
	toExpPos: 89,
	toExpNeg: -89,
})

const toStringDefaults: ToStringArg = {
	isUnit: false,
	displayUnit: true,
	comma: false,
	addBrackets: false,
	implicit: false,
}
const toLatexDefaults: ToLatexArg = {
	addBrackets: false,
	implicit: false,
	addSpaces: true,
	keepUnecessaryZeros: false,
}
const toTexmacsDefaults: ToTexmacsArg = {
	addBrackets: false,
	implicit: false,
	addSpaces: true,
	keepUnecessaryZeros: false,
}

const evalDefaults: EvalArg = {
	precision: 20,
	decimal: false,
}

function createPNode(): Node {
	return {
		type: TYPE_NOT_INITALIZED,
		generated: [],
		derivate(variable = 'x') {
			if (isIncorrectExp(this)) return this
			return derivate(this, variable)
		},

		get normal() {
			if (!this._normal) this._normal = normalize(this)
			return this._normal
		},

		compose(g: Node, variable = 'x') {
			if (isIncorrectExp(this)) return this
			return compose(this, g, variable)
		},

		//  simplifier une fraction numérique
		reduce() {
			// la fraction est déj
			// on simplifie les signes.
			if (isIncorrectExp(this)) return this
			const b = this.removeSigns()
			if (isExpressionWithChildren(b)) {
				const negative = b.isOpposite()
				const frac = fraction(negative ? b.first.string : b.string).reduce()

				let result: Node

				if (frac.n.equals(0)) {
					result = number(0)
				} else if (frac.d.equals(1)) {
					result = frac.s === 1 ? number(frac.n) : opposite([number(frac.n)])
				} else {
					result = quotient([number(frac.n), number(frac.d)])
					if (frac.s === -1) {
						result = opposite([result])
					}
				}

				if (negative) {
					if (isOpposite(result)) {
						result = result.first
					} else {
						result = opposite([result])
					}
				}
				return result
			} else {
				return this
			}
		},

		isCorrect() {
			return this.type !== TYPE_ERROR
		},
		isIncorrect() {
			return this.type === TYPE_ERROR
		},
		isRelations() {
			return this.type === TYPE_RELATIONS
		},
		isEquality() {
			return this.type === TYPE_EQUALITY
		},
		isUnequality() {
			return this.type === TYPE_UNEQUALITY
		},
		isInequality() {
			return (
				this.type === TYPE_INEQUALITY_LESS ||
				this.type === TYPE_INEQUALITY_LESSOREQUAL ||
				this.type === TYPE_INEQUALITY_MORE ||
				this.type === TYPE_INEQUALITY_MOREOREQUAL
			)
		},

		isBoolean() {
			return this.type === TYPE_BOOLEAN
		},

		isSum() {
			return this.type === TYPE_SUM
		},
		isDifference() {
			return this.type === TYPE_DIFFERENCE
		},
		isOpposite() {
			return this.type === TYPE_OPPOSITE
		},
		isPositive() {
			return this.type === TYPE_POSITIVE
		},
		isProduct() {
			return (
				this.type === TYPE_PRODUCT ||
				this.type === TYPE_PRODUCT_IMPLICIT ||
				this.type === TYPE_PRODUCT_POINT
			)
		},
		isDivision() {
			return this.type === TYPE_DIVISION
		},
		isQuotient() {
			return this.type === TYPE_QUOTIENT
		},
		isPower() {
			return this.type === TYPE_POWER
		},
		isRadical() {
			return this.type === TYPE_RADICAL
		},
		isPGCD() {
			return this.type === TYPE_GCD
		},
		isMax() {
			return this.type === TYPE_MAX
		},
		isMaxP() {
			return this.type === TYPE_MAXP
		},
		isMin() {
			return this.type === TYPE_MIN
		},
		isMinP() {
			return this.type === TYPE_MINP
		},
		isMod() {
			return this.type === TYPE_MOD
		},
		isCos() {
			return this.type === TYPE_COS
		},
		isSin() {
			return this.type === TYPE_SIN
		},
		isTan() {
			return this.type === TYPE_TAN
		},
		isLn() {
			return this.type === TYPE_LN
		},
		isLog() {
			return this.type === TYPE_LOG
		},
		isExp() {
			return this.type === TYPE_EXP
		},
		isFloor() {
			return this.type === TYPE_FLOOR
		},
		isAbs() {
			return this.type === TYPE_ABS
		},
		isNumber() {
			return this.type === TYPE_NUMBER
		},
		isBracket() {
			return this.type === TYPE_BRACKET
		},
		isSymbol() {
			return this.type === TYPE_SYMBOL
		},
		isSegmentLength() {
			return this.type === TYPE_SEGMENT_LENGTH
		},
		isTemplate() {
			return this.type === TYPE_TEMPLATE
		},
		isHole() {
			return this.type === TYPE_HOLE
		},
		isTime() {
			return this.type === TYPE_TIME
		},
		isLimit() {
			return this.type === TYPE_LIMIT
		},
		isChild() {
			return !!this.parent
		},
		isIdentifier() {
			return this.type === TYPE_IDENTIFIER
		},

		isFirst() {
			return !!this.parent && this.parent.children.indexOf(this) === 0
		},

		isLast() {
			return !!this.parent && this.parent.children.indexOf(this) === 1
		},

		isFunction() {
			return (
				this.isRadical() ||
				this.isPGCD() ||
				this.isMin() ||
				this.isMinP() ||
				this.isMax() ||
				this.isMaxP() ||
				this.isMod() ||
				this.isCos() ||
				this.isSin() ||
				this.isTan() ||
				this.isLog() ||
				this.isLn() ||
				this.isExp() ||
				this.isFloor() ||
				this.isAbs()
			)
		},

		isDuration() {
			if (isIncorrectExp(this)) return false
			return (
				this.isTime() || (!!this.unit && this.unit.isConvertibleTo(unit('s')))
			)
		},

		isLength() {
			if (isIncorrectExp(this)) return false
			return !!this.unit && this.unit.isConvertibleTo(unit('m'))
		},

		isMass() {
			if (isIncorrectExp(this)) return false
			return !!this.unit && this.unit.isConvertibleTo(unit('g'))
		},

		isVolume() {
			if (isIncorrectExp(this)) return false
			return (
				!!this.unit &&
				(this.unit.isConvertibleTo(unit('m').mult(unit('m')).mult(unit('m'))) ||
					this.unit.isConvertibleTo(unit('L')))
			)
		},

		compareTo(e: Node) {
			if (isIncorrectExp(this)) return -1
			if (isIncorrectExp(e)) return 1
			return compare(this, e)
		},

		isLowerThan(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return false
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return false
			// TODO: wtf !!!!!
			const e1 = this.normal.node
			const e2 = e.normal.node
			let result: boolean
			try {
				result = fraction(e1).isLowerThan(fraction(e2))
			} catch (err) {
				result = e1
					.eval({ decimal: true })
					.isLowerThan(e2.eval({ decimal: true }))
			}
			return result
		},

		isLowerOrEqual(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return false
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return false
			return this.isLowerThan(e) || this.equals(e)
		},

		isGreaterThan(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return false
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return false
			return e.isLowerThan(this)
		},

		isGreaterOrEqual(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return false
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return false
			return this.isGreaterThan(e) || this.equals(e)
		},

		isOne() {
			return this.toString({ displayUnit: false }) === '1'
		},

		isMinusOne() {
			return this.string === '-1'
		},

		isZero() {
			return this.toString({ displayUnit: false }) === '0'
		},

		equalsZero() {
			return this.eval().isZero()
		},

		strictlyEquals(e: Node) {
			return this.string === e.string
		},

		equals(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return false
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return false
			// TODO: A revoir
			if (isEquality(this)) {
				return (
					isEquality(e) &&
					((this.first.equals(e.first) && this.last.equals(e.last)) ||
						(this.first.equals(e.last) && this.last.equals(e.first)))
				)
			} else if (isInequalityLess(this)) {
				return (
					(isInequalityLess(e) &&
						this.first.equals(e.first) &&
						this.last.equals(e.last)) ||
					(isInequalityMore(e) &&
						this.first.equals(e.last) &&
						this.last.equals(e.first))
				)
			} else if (isInequalityLessOrEqual(this)) {
				return (
					(isInequalityLessOrEqual(e) &&
						this.first.equals(e.first) &&
						this.last.equals(e.last)) ||
					(isInequalityMoreOrEQual(e) &&
						this.first.equals(e.last) &&
						this.last.equals(e.first))
				)
			} else if (isInequalityMore(this)) {
				return (
					(isInequalityMore(e) &&
						this.first.equals(e.first) &&
						this.last.equals(e.last)) ||
					(isInequalityLess(e) &&
						this.first.equals(e.last) &&
						this.last.equals(e.first))
				)
			} else if (isInequalityMoreOrEQual(this)) {
				return (
					(isInequalityMoreOrEQual(e) &&
						this.first.equals(e.first) &&
						this.last.equals(e.last)) ||
					(isInequalityLessOrEqual(e) &&
						this.first.equals(e.last) &&
						this.last.equals(e.first))
				)
			} else {
				return this.normal.string === e.normal.string
			}
		},

		isSameQuantityType(e: Node) {
			// return (!this.unit && !e.unit) || this.normal.isSameQuantityType(e.normal)
			return this.normal.isSameQuantityType(e.normal)
		},

		// recusirvly gets sum terms (with signs)
		get terms() {
			let left: NonEmptyArr<SignedTerm>
			let right: NonEmptyArr<SignedTerm>
			let signedTerm: SignedTerm

			if (isSum(this)) {
				if (isPositive(this.first)) {
					signedTerm = { op: '+', term: this.first.first }
					left = [signedTerm]
				} else if (isOpposite(this.first)) {
					signedTerm = { op: '-', term: this.first.first }
					left = [signedTerm]
				} else {
					left = this.first.terms
				}
				signedTerm = { op: '+', term: this.last }
				right = [signedTerm]
				return left.concat(right) as NonEmptyArr<SignedTerm>
			} else if (isDifference(this)) {
				if (isPositive(this.first)) {
					signedTerm = { op: '+', term: this.first.first }
					left = [signedTerm]
				} else if (isOpposite(this.first)) {
					signedTerm = { op: '-', term: this.first.first }
					left = [signedTerm]
				} else {
					left = this.first.terms
				}
				signedTerm = { op: '-', term: this.last }
				right = [signedTerm]
				return left.concat(right) as NonEmptyArr<SignedTerm>
			} else {
				signedTerm = { op: '+', term: this }
				return [signedTerm] as NonEmptyArr<SignedTerm>
			}
		},

		// recusirvly gets product factors
		get factors() {
			if (isProduct(this)) {
				const left: NonEmptyArr<Node> = this.first.factors
				const right: NonEmptyArr<Node> = this.last.factors
				return left.concat(right) as NonEmptyArr<Node>
			} else {
				return [this] as NonEmptyArr<Node>
			}
		},

		get pos() {
			return this.parent ? this.parent.children.indexOf(this) : 0
		},

		toString(params?: ToStringArg) {
			if (isIncorrectExp(this)) return this.error
			return text(this, { ...toStringDefaults, ...(params || {}) })
		},

		get string() {
			return this.toString()
		},

		toLatex(params?: ToLatexArg) {
			return latex(this, { ...toLatexDefaults, ...(params || {}) })
		},

		get latex() {
			return this.toLatex()
		},

		toTexmacs(params?: ToTexmacsArg) {
			return texmacs(this, { ...toTexmacsDefaults, ...(params || {}) })
		},

		get texmacs() {
			return this.toTexmacs()
		},

		get root() {
			if (this.parent) {
				return this.parent.root
			} else {
				return this
			}
		},

		isInt() {
			// trick pour tester si un nombre est un entier
			// return this.isNumber() && (this.value | 0) === this.value
			return isNumber(this) && this.value.isInt()
		},

		isEven() {
			return isInt(this) && this.value.mod(2).equals(0)
		},

		isOdd() {
			return isInt(this) && this.value.mod(2).equals(1)
		},

		isNumeric() {
			return (
				isNumber(this) ||
				(isExpressionWithChildren(this) &&
					this.children.every((child) => child.isNumeric()))
			)
		},

		add(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return this
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return e
			return sum([this, e])
		},

		sub(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return this
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return e
			return difference([this, e])
		},

		mult(
			exp: Node | string | number | Decimal,
			type:
				| typeof TYPE_PRODUCT
				| typeof TYPE_PRODUCT_IMPLICIT
				| typeof TYPE_PRODUCT_POINT = TYPE_PRODUCT,
		) {
			if (isIncorrectExp(this)) return this
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return e
			if (type === TYPE_PRODUCT) {
				return product([this, e])
			} else if (type === TYPE_PRODUCT_IMPLICIT) {
				return productImplicit([this, e])
			} else {
				return productPoint([this, e])
			}
		},

		div(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return this
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return e
			return division([this, e])
		},

		frac(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return this
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return e
			return quotient([this, e])
		},

		oppose() {
			if (isIncorrectExp(this)) return this
			return opposite([this])
		},

		inverse() {
			if (isIncorrectExp(this)) return this
			return quotient([number(1), this])
		},

		radical() {
			if (isIncorrectExp(this)) return this
			return radical([this])
		},

		positive() {
			if (isIncorrectExp(this)) return this
			return positive([this])
		},

		bracket() {
			if (isIncorrectExp(this)) return this
			return bracket([this])
		},

		pow(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return this
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return e
			return power([this, e])
		},

		floor() {
			if (isIncorrectExp(this)) return this
			return floor([this])
		},

		mod(exp: Node | string | number | Decimal) {
			if (isIncorrectExp(this)) return this
			const e = convertToExp(exp)
			if (isIncorrectExp(e)) return e
			return mod([this, e])
		},

		abs() {
			if (isIncorrectExp(this)) return this
			return abs([this])
		},

		exp() {
			if (isIncorrectExp(this)) return this
			return exp([this])
		},

		ln() {
			if (isIncorrectExp(this)) return this
			return ln([this])
		},

		log() {
			if (isIncorrectExp(this)) return this
			return log([this])
		},

		sin() {
			if (isIncorrectExp(this)) return this
			return sin([this])
		},

		cos() {
			if (isIncorrectExp(this)) return this
			return cos([this])
		},

		shallowShuffleTerms() {
			if (isIncorrectExp(this)) return this
			if (isSum(this) || isDifference(this)) {
				return shallowShuffleTerms(this)
			} else {
				return this
			}
		},

		shallowShuffleFactors() {
			if (isIncorrectExp(this)) return this
			if (isProduct(this)) {
				return shallowShuffleFactors(this)
			} else {
				return this
			}
		},

		shuffleTerms() {
			if (isIncorrectExp(this)) return this
			return shuffleTerms(this)
		},

		shuffleFactors() {
			if (isIncorrectExp(this)) return this
			return shuffleFactors(this)
		},

		shuffleTermsAndFactors() {
			if (isIncorrectExp(this)) return this
			return shuffleTermsAndFactors(this)
		},

		sortTerms() {
			if (isIncorrectExp(this)) return this
			return sortTerms(this)
		},

		shallowSortTerms() {
			if (isIncorrectExp(this)) return this
			return shallowSortTerms(this)
		},

		sortFactors() {
			if (isIncorrectExp(this)) return this
			return sortFactors(this)
		},

		shallowSortFactors() {
			if (isIncorrectExp(this)) return this
			return shallowSortFactors(this)
		},

		sortTermsAndFactors() {
			if (isIncorrectExp(this)) return this
			return sortTermsAndFactors(this)
		},

		reduceFractions() {
			if (isIncorrectExp(this)) return this
			return reduceFractions(this)
		},

		removeMultOperator() {
			if (isIncorrectExp(this)) return this
			return removeMultOperator(this)
		},

		removeUnecessaryBrackets(allowFirstNegativeTerm = false) {
			if (isIncorrectExp(this)) return this
			return removeUnecessaryBrackets(this, allowFirstNegativeTerm)
		},

		removeZerosAndSpaces() {
			if (isIncorrectExp(this)) return this
			return removeZerosAndSpaces(this)
		},

		removeSigns() {
			if (isIncorrectExp(this)) return this
			return removeSigns(this)
		},

		removeNullTerms() {
			if (isIncorrectExp(this)) return this
			return removeNullTerms(this)
		},

		removeFactorsOne() {
			if (isIncorrectExp(this)) return this
			return removeFactorsOne(this)
		},

		simplifyNullProducts() {
			if (isIncorrectExp(this)) return this
			return simplifyNullProducts(this)
		},

		searchUnecessaryZeros() {
			if (isIncorrectExp(this)) return false
			if (isNumber(this)) {
				const regexs = [/^0\d+/, /[.,]\d*0$/]
				const input = this.input
				return regexs.some((regex) => input.replace(/ /g, '').match(regex))
			} else if (isExpressionWithChildren(this)) {
				return this.children.some((child) => child.searchUnecessaryZeros())
			} else {
				return false
			}
		},

		searchMisplacedSpaces() {
			if (isIncorrectExp(this)) return false
			if (isNumber(this)) {
				const [int, dec] = this.input.replace(',', '.').split('.')
				let regexs = [
					/\d{4}/,
					/\s$/,
					/\s\d{2}$/,
					/\s\d{2}\s/,
					/\s\d$/,
					/\s\d\s/,
				]
				if (regexs.some((regex) => int.match(regex))) return true

				if (dec) {
					regexs = [/\d{4}/, /^\s/, /^\d{2}\s/, /\s\d{2}\s/, /^\d\s/, /\s\d\s/]
					if (regexs.some((regex) => dec.match(regex))) return true
				}
				return false
			} else if (isExpressionWithChildren(this)) {
				return this.children.some((child) => child.searchMisplacedSpaces())
			} else {
				return false
			}
		},

		/* 
  params contient :
   - les valeurs de substitution
   - decimal : true si on veut la valeur décimale (approchée dans certains cas)
   - precision : précision du résultat approché
   - unit : l'unité dans laquelle on veut le résultat
   */

		eval(params?: EvalArg) {
			if (isIncorrectExp(this)) return this
			// par défaut on veut une évaluation exacte (entier, fraction, racine,...)
			params = { ...evalDefaults, ...params }
			// on substitue récursivement car un symbole peut en introduire un autre. Exemple : a = 2 pi
			let e = this.substitute(params.values)
			// if (this.ops && !e.ops) {
			// 	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
			// }
			const unit =
				typeof params.unit === 'string' && params.unit !== 'HMS'
					? math('1 ' + params.unit).unit
					: params.unit

			//  Cas particuliers : fonctions minip et maxip
			// ces fonctions doivent retourner la forme initiale d'une des deux expressions
			// et non la forme normale
			if (this.isNumeric() && (isMaxP(this) || isMinP(this))) {
				// TODO: et l'unité ?
				if (isMinP(this)) {
					e = this.first.isLowerThan(this.last) ? this.first : this.last
				} else {
					e = this.first.isGreaterThan(this.last) ? this.first : this.last
				}
			} else {
				// on passe par la forme normale car elle nous donne la valeur exacte et gère les unités
				let n = e.normal

				// si l'unité du résultat est imposée
				if (unit && n.unit) {
					if (
						(unit === 'HMS' && !n.isDuration()) ||
						(unit !== 'HMS' &&
							// pourquoi pas unit.normal directement ?
							!math('1' + unit.string).normal.isSameQuantityType(n))
					) {
						throw new Error(
							`Unités incompatibles ${n.string} ${
								typeof unit === 'string' ? unit : unit.string
							}`,
						)
					}
					if (unit !== 'HMS') {
						const coef = n.unit.getCoefTo(unit.normal())
						n = n.mult(coef)
					}
				}

				// on retourne à la forme naturelle
				if (unit === 'HMS') {
					e = n.toNode({ formatTime: true })
				} else {
					e = n.node
				}

				// on met à jour l'unité qui a pu être modifiée par une conversion
				//  par défaut, c'est l'unité de base de la forme normale qui est utilisée.
				if (unit && unit !== 'HMS') {
					e.unit = unit
				}
			}

			// si on veut la valeur décimale, on utilise la fonction evaluate
			if (params.decimal && unit !== 'HMS') {
				//  on garde en mémoire l'unité
				const u = e.unit

				// evaluate retourne un objet Decimal
				e = number(
					evaluate(e, params).toDecimalPlaces(params.precision).toString(),
				)

				//  on remet l'unité qui avait disparu
				if (u) e.unit = u
			}
			return e
		},

		// génère des valeurs pour les templates
		generate() {
			if (isIncorrectExp(this)) return this
			// tableau contenant les valeurs générées pour  $1, $2, ....
			this.root.generated = []
			return generate(this)
		},

		shallow() {
			return {
				nature: this.type,
				children: isExpressionWithChildren(this)
					? this.children.map((e) => e.type)
					: null,
				unit: this.unit ? this.unit.string : '',
			}
		},

		// substituee les symboles
		// certains symboles (pi, ..) sont résevés à des constantes
		substitute(values: Record<string, string> = {}) {
			if (isIncorrectExp(this)) return this
			this.root.substitutionMap = { ...this.root.substitutionMap, ...values }
			return substitute(this, values)
		},

		matchTemplate(t: Node) {
			if (isIncorrectExp(this)) return false
			if (isIncorrectExp(t)) return false
			let n: number
			let integerPart: number
			let decimalPart: number

			function checkChildren(
				e: ExpressionWithChildren,
				t: ExpressionWithChildren,
			) {
				for (let i = 0; i < t.length; i++) {
					if (!e.children[i].matchTemplate(t.children[i])) return false
				}
				return true
			}

			function checkDigitsNumber(
				n: number,
				minDigits: number,
				maxDigits: number,
			) {
				const ndigits = n === 0 ? 0 : Math.floor(Math.log10(n)) + 1
				return ndigits <= maxDigits && ndigits >= minDigits
			}

			function checkLimits(n: number, min: number, max: number) {
				return n >= min && n <= max
			}

			if (isNumber(t)) {
				return isNumber(this) && this.value.equals(t.value)
			} else if (isHole(t)) {
				return this.isHole()
			} else if (isSymbol(t)) {
				return isSymbol(this) && this.symbol === t.symbol
			} else if (isTemplate(t)) {
				switch (t.nature) {
					case '$e':
					case '$ep':
					case '$ei':
						if (
							(t.signed && (isOpposite(this) || isPositive(this))) ||
							(t.relative && isOpposite(this))
						)
							return this.first.matchTemplate(
								template({ nature: t.nature, children: t.children }),
							)
						if (
							!isHole(t.children[1]) &&
							!checkDigitsNumber(
								(this as Numbr).value.toNumber(),
								!isHole(t.children[0])
									? (t.children[0] as Numbr).value.toNumber()
									: 0,
								(t.children[1] as Numbr).value.toNumber(),
							)
						) {
							return false
						}
						if (
							!isHole(t.children[2]) &&
							!checkLimits(
								(this as Numbr).value.toNumber(),
								(t.children[2] as Numbr).value.toNumber(),
								(t.children[3] as Numbr).value.toNumber(),
							)
						) {
							return false
						}
						if (t.nature === '$e') return this.isInt()
						if (t.nature === '$ep') return this.isEven()
						if (t.nature === '$ei') return this.isOdd()
						break

					case '$d':
						if (t.relative && isOpposite(this))
							return this.first.matchTemplate(t)
						if (!this.isNumber()) return false

						if (this.isInt()) {
							// TODO: A quoi sert intgerPart si on retourne false ?
							// integerPart = this.value.trunc()
							return false
						} else {
							const [integerPartString, decimalPartString] = (
								this as Numbr
							).value
								.toString()
								.split('.')
							integerPart = parseInt(integerPartString, 10)
							decimalPart = parseInt(decimalPartString, 10)

							if (t.children[0].isTemplate()) {
								if (
									!number(
										Math.floor(Math.log10(integerPart)) + 1,
									).matchTemplate(t.children[0])
								) {
									return false
								}
							} else if (
								!checkDigitsNumber(
									integerPart,
									(t.children[0] as Numbr).value.toNumber(),
									(t.children[0] as Numbr).value.toNumber(),
								)
							) {
								return false
							}

							if (t.children[1].isTemplate()) {
								if (
									!number(
										Math.floor(Math.log10(decimalPart)) + 1,
									).matchTemplate(t.children[1])
								)
									return false
							} else if (
								!checkDigitsNumber(
									decimalPart,
									(t.children[1] as Numbr).value.toNumber(),
									(t.children[1] as Numbr).value.toNumber(),
								)
							) {
								return false
							}

							return true
						}

					case '$l':
						return true

					default:
						n = parseInt(t.nature.slice(1, t.nature.length), 10)
						return this.matchTemplate(t.root.generated[n - 1])
				}
			} else if (isExpressionWithChildren(t)) {
				return (
					isExpressionWithChildren(this) &&
					t.type === this.type &&
					t.length === this.length &&
					checkChildren(this, t)
				)
			}
			return true
		},

		copyFromString(withUnit = true) {
			return math(this.toString({ displayUnit: withUnit }))
		},

		copy(children?: Node[]) {
			const params: CopyArg = {}
			if (this.unit) params.unit = this.unit
			if (isExpressionWithChildren(this)) {
				params.children = children || [...this.children]
			}
			if (isNumber(this)) {
				params.value = this.value
				params.input = this.input
			}
			if (isBoolean(this)) {
				params.value = this.value
				params.boolvalue = this.boolvalue
			}
			if (isSymbol(this)) {
				params.symbol = this.symbol
			}
			if (isSegmentLength(this)) {
				params.begin = this.begin
				params.end = this.end
			}
			if (isIdentifier(this)) {
				params.name = this.name
			}
			if (isIncorrectExp(this)) {
				params.error = this.error
				params.message = this.message
			}
			if (isLimit(this)) {
				params.sign = this.sign
			}
			if (isRelations(this)) {
				params.ops = this.ops
			}
			return createNode({ type: this.type, ...params })
		},

		[Symbol.iterator](this: ExpressionWithChildren): IterableIterator<Node> {
			return this.children[Symbol.iterator]()
		},
		get first() {
			return (this as ExpressionWithChildren).children[0]
		},

		get last() {
			return (this as ExpressionWithChildren).children[
				(this as ExpressionWithChildren).children.length - 1
			]
		},

		get length() {
			return (this as ExpressionWithChildren).children.length
		},

		isTrue() {
			return isBoolean(this) && this.boolvalue
		},

		isFalse() {
			return isBoolean(this) && !this.boolvalue
		},
	}
}

/* 
Création de la représentation intermédiaire de l'expresssion mathématique (AST)
La forme normale utilise une forme propre.
 */

export function createNode({ type, children, ...params }: CreateNodeArg) {
	const node: Node = createPNode()
	if (children) {
		children = children.map((child) => {
			if (child.parent) {
				const newChild = child.copy()
				newChild.parent = node as ExpressionWithChildren
				return newChild
			} else {
				child.parent = node as ExpressionWithChildren
				return child
			}
		})
		node.children = children
	}
	node.type = type
	Object.assign(node, params)

	// TODO: est-ce vraiment bien util ?
	// if (node.exclude) {
	// 	for (const e of node.exclude) {
	// 		e.parent = node
	// 	}
	// }

	// if (node.excludeCommonDividersWith) {
	// 	for (const e of node.excludeCommonDividersWith) {
	// 		e.parent = node
	// 	}
	// }

	return node as Node
}

export function sum(children: Node[]) {
	return createNode({ type: TYPE_SUM, children }) as Sum
}
export function difference(children: Node[]) {
	return createNode({ type: TYPE_DIFFERENCE, children }) as Difference
}
export function division(children: Node[]) {
	return createNode({ type: TYPE_DIVISION, children }) as Division
}
export function product(children: Node[]) {
	return createNode({ type: TYPE_PRODUCT, children }) as Product
}
export function productImplicit(children: Node[]) {
	return createNode({
		type: TYPE_PRODUCT_IMPLICIT,
		children,
	}) as ProductImplicit
}
export function productPoint(children: Node[]) {
	return createNode({ type: TYPE_PRODUCT_POINT, children }) as ProductPoint
}
export function quotient(children: Node[]) {
	return createNode({ type: TYPE_QUOTIENT, children }) as Quotient
}
export function power(children: Node[]) {
	return createNode({ type: TYPE_POWER, children }) as Power
}
export function opposite(children: Node[]) {
	return createNode({ type: TYPE_OPPOSITE, children }) as Opposite
}
export function positive(children: Node[]) {
	return createNode({ type: TYPE_POSITIVE, children }) as Positive
}
export function bracket(children: Node[]) {
	return createNode({ type: TYPE_BRACKET, children }) as Bracket
}
export function radical(children: Node[]) {
	return createNode({ type: TYPE_RADICAL, children }) as Radical
}

export function cos(children: Node[]) {
	return createNode({ type: TYPE_COS, children }) as Cos
}

export function sin(children: Node[]) {
	return createNode({ type: TYPE_SIN, children }) as Sin
}

export function tan(children: Node[]) {
	return createNode({ type: TYPE_TAN, children }) as Tan
}

export function ln(children: Node[]) {
	return createNode({ type: TYPE_LN, children }) as LogN
}

export function log(children: Node[]) {
	return createNode({ type: TYPE_LOG, children }) as Log
}

export function exp(children: Node[]) {
	return createNode({ type: TYPE_EXP, children }) as Exp
}

export function pgcd(children: Node[]) {
	return createNode({ type: TYPE_GCD, children }) as Gcd
}

export function mod(children: Node[]) {
	return createNode({ type: TYPE_MOD, children }) as Mod
}

export function floor(children: Node[]) {
	return createNode({ type: TYPE_FLOOR, children }) as Floor
}

export function abs(children: Node[]) {
	return createNode({ type: TYPE_ABS, children }) as Abs
}

export function min(children: Node[]) {
	return createNode({ type: TYPE_MIN, children }) as Min
}

export function minPreserve(children: Node[]) {
	return createNode({ type: TYPE_MINP, children }) as MinP
}

export function max(children: Node[]) {
	return createNode({ type: TYPE_MAX, children }) as Max
}

export function maxPreserve(children: Node[]) {
	return createNode({ type: TYPE_MAXP, children }) as MaxP
}

export function percentage(children: Node[]) {
	return createNode({ type: TYPE_PERCENTAGE, children }) as Percentage
}
export function number(input: number | Decimal | string) {
	//  on remplace la virgule par un point car decimaljs ne gère pas la virgule
	const value = new Decimal(
		typeof input === 'string'
			? input.replace(',', '.').replace(/\s/g, '') // decimaljs ne gere pas les espaces
			: input, // number
	)

	return createNode({
		type: TYPE_NUMBER,
		value,
		input: input.toString().trim().replace(',', '.'),
	}) as Numbr
}

export function boolean(value: boolean) {
	return createNode({
		type: TYPE_BOOLEAN,
		boolvalue: value,
		value: value ? new Decimal(1) : new Decimal(0),
	}) as Bool
}
export function symbol(symbl: string) {
	return createNode({ type: TYPE_SYMBOL, symbol: symbl }) as Symbl
}
export function segmentLength(begin: string, end: string) {
	return createNode({ type: TYPE_SEGMENT_LENGTH, begin, end }) as SegmentLength
}
export function notdefined(error: string, message = '', input = '') {
	return createNode({
		type: TYPE_ERROR,
		error,
		message,
		input,
	}) as IncorrectExp
}
export function hole() {
	return createNode({ type: TYPE_HOLE }) as Hole
}

export function template(params: TemplateArg) {
	return createNode({ type: TYPE_TEMPLATE, ...params }) as Template
}

export function relations(ops: string[], children: Node[]) {
	return createNode({ type: TYPE_RELATIONS, ops, children }) as Relations
}
export function equality(children: Node[]) {
	return createNode({ type: TYPE_EQUALITY, children }) as Equality
}

export function unequality(children: Node[]) {
	return createNode({ type: TYPE_UNEQUALITY, children }) as Unequality
}

export function inequality(
	children: Node[],
	relation: '<' | '>' | '<=' | '>=',
) {
	if (relation === '<') {
		return createNode({
			type: TYPE_INEQUALITY_LESS,
			children,
		}) as InequalityLess
	} else if (relation === '>') {
		return createNode({
			type: TYPE_INEQUALITY_MORE,
			children,
		}) as InequalityMore
	} else if (relation === '<=') {
		return createNode({
			type: TYPE_INEQUALITY_LESSOREQUAL,
			children,
		}) as InequalityLessOrEqual
	} else {
		return createNode({
			type: TYPE_INEQUALITY_MOREOREQUAL,
			children,
		}) as InequalityMoreOrEqual
	}
}

export function time(children: Node[]) {
	return createNode({ type: TYPE_TIME, children }) as Time
}

export function identifier(name: string) {
	return createNode({ type: TYPE_IDENTIFIER, name }) as Identifier
}

export function limit(sign: string, children: Node[]) {
	return createNode({ type: TYPE_LIMIT, sign, children }) as Limit
}

function convertToExp(exp: Node | string | number | Decimal) {
	let e: Node
	if (
		typeof exp === 'string' ||
		typeof exp === 'number' ||
		Decimal.isDecimal(exp)
	) {
		e = math(exp)
	} else {
		e = exp
	}
	return e
}
