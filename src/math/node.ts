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
	conversionTable,
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
	isAbs,
	isBoolean,
	isBracket,
	isCos,
	isDifference,
	isDivision,
	isEquality,
	isExp,
	isExpressionWithChildren,
	isFloor,
	isHole,
	isIdentifier,
	isIncorrectExp,
	isInequalityLess,
	isInequalityLessOrEqual,
	isInequalityMore,
	isInequalityMoreOrEQual,
	isInt,
	isLimit,
	isLn,
	isLog,
	isMax,
	isMaxP,
	isMin,
	isMinP,
	isMod,
	isNlist,
	isNumber,
	isOpposite,
	isPercentage,
	isPGCD,
	isPositive,
	isPower,
	isProduct,
	isProductImplicit,
	isProductPoint,
	isQuotient,
	isRadical,
	isRelations,
	isSegmentLength,
	isSin,
	isSum,
	isSymbol,
	isTan,
	isTemplate,
	isTime,
	isUnequality,
	Limit,
	Log,
	LogN,
	Max,
	MaxP,
	Min,
	MinP,
	Mod,
	Nlist,
	NlistElement,
	NlistElements,
	Node,
	NonEmptyArr,
	Normal,
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
	ToNodeArg,
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
	TYPE_NORMAL,
	TYPE_NOT_INITALIZED,
	TYPE_NPRODUCT,
	TYPE_NSUM,
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
	TYPE_UNIT,
	Unequality,
	Unit,
} from './types'
import {
	binarySearchCmp,
	gcd,
	pgcdDecimals,
	primeFactors,
	RadicalReduction,
} from '../utils/utils'

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
			return derivate(this, variable)
		},

		get normal() {
			if (!this._normal) this._normal = normalize(this)
			return this._normal
		},

		compose(g: Node, variable = 'x') {
			return compose(this, g, variable)
		},

		//  simplifier une fraction numérique
		reduce() {
			// la fraction est déj
			// on simplifie les signes.
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
			return (
				this.isTime() || (!!this.unit && this.unit.isConvertibleTo(unit('s')))
			)
		},

		isLength() {
			return !!this.unit && this.unit.isConvertibleTo(unit('m'))
		},

		isMass() {
			return !!this.unit && this.unit.isConvertibleTo(unit('g'))
		},

		isVolume() {
			return (
				!!this.unit &&
				(this.unit.isConvertibleTo(unit('m').mult(unit('m')).mult(unit('m'))) ||
					this.unit.isConvertibleTo(unit('L')))
			)
		},

		compareTo(e: Node) {
			return compare(this, e)
		},

		isLowerThan(e: Node | string | number) {
			// TODO: wtf !!!!!
			const e1 = this.normal.node
			const e2 =
				typeof e === 'string' || typeof e === 'number'
					? math(e).normal.node
					: e.normal.node
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

		isLowerOrEqual(e: Node | string | number) {
			if (typeof e === 'string' || typeof e === 'number') {
				e = math(e)
			}
			return this.isLowerThan(e) || this.equals(e)
		},

		isGreaterThan(e: Node | string | number) {
			if (typeof e === 'string' || typeof e === 'number') {
				e = math(e)
			}
			return e.isLowerThan(this)
		},

		isGreaterOrEqual(e: Node | string | number) {
			if (typeof e === 'string' || typeof e === 'number') {
				e = math(e)
			}
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

		equals(exp: Node | string | number) {
			let e: Node
			if (typeof exp === 'string' || typeof exp === 'number') {
				e = math(exp)
			} else {
				e = exp
			}
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
			const e = convertToExp(exp)
			return sum([this, e])
		},

		sub(exp: Node | string | number | Decimal) {
			const e = convertToExp(exp)
			return difference([this, e])
		},

		mult(
			exp: Node | string | number | Decimal,
			type:
				| typeof TYPE_PRODUCT
				| typeof TYPE_PRODUCT_IMPLICIT
				| typeof TYPE_PRODUCT_POINT = TYPE_PRODUCT,
		) {
			const e = convertToExp(exp)
			if (type === TYPE_PRODUCT) {
				return product([this, e])
			} else if (type === TYPE_PRODUCT_IMPLICIT) {
				return productImplicit([this, e])
			} else {
				return productPoint([this, e])
			}
		},

		div(exp: Node | string | number | Decimal) {
			const e = convertToExp(exp)
			return division([this, e])
		},

		frac(exp: Node | string | number | Decimal) {
			const e = convertToExp(exp)
			return quotient([this, e])
		},

		oppose() {
			return opposite([this])
		},

		inverse() {
			return quotient([number(1), this])
		},

		radical() {
			return radical([this])
		},

		positive() {
			return positive([this])
		},

		bracket() {
			return bracket([this])
		},

		pow(exp: Node | string | number | Decimal) {
			const e = convertToExp(exp)
			return power([this, e])
		},

		floor() {
			return floor([this])
		},

		mod(exp: Node | string | number | Decimal) {
			const e = convertToExp(exp)
			return mod([this, e])
		},

		abs() {
			return abs([this])
		},

		exp() {
			return exp([this])
		},

		ln() {
			return ln([this])
		},

		log() {
			return log([this])
		},

		sin() {
			return sin([this])
		},

		cos() {
			return cos([this])
		},

		shallowShuffleTerms() {
			if (isSum(this) || isDifference(this)) {
				return shallowShuffleTerms(this)
			} else {
				return this
			}
		},

		shallowShuffleFactors() {
			if (isProduct(this)) {
				return shallowShuffleFactors(this)
			} else {
				return this
			}
		},

		shuffleTerms() {
			return shuffleTerms(this)
		},

		shuffleFactors() {
			return shuffleFactors(this)
		},

		shuffleTermsAndFactors() {
			return shuffleTermsAndFactors(this)
		},

		sortTerms() {
			return sortTerms(this)
		},

		shallowSortTerms() {
			return shallowSortTerms(this)
		},

		sortFactors() {
			return sortFactors(this)
		},

		shallowSortFactors() {
			return shallowSortFactors(this)
		},

		sortTermsAndFactors() {
			return sortTermsAndFactors(this)
		},

		reduceFractions() {
			return reduceFractions(this)
		},

		removeMultOperator() {
			return removeMultOperator(this)
		},

		removeUnecessaryBrackets(allowFirstNegativeTerm = false) {
			return removeUnecessaryBrackets(this, allowFirstNegativeTerm)
		},

		removeZerosAndSpaces() {
			return removeZerosAndSpaces(this)
		},

		removeSigns() {
			return removeSigns(this)
		},

		removeNullTerms() {
			return removeNullTerms(this)
		},

		removeFactorsOne() {
			return removeFactorsOne(this)
		},

		simplifyNullProducts() {
			return simplifyNullProducts(this)
		},

		searchUnecessaryZeros() {
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
			this.root.substitutionMap = { ...this.root.substitutionMap, ...values }
			return substitute(this, values)
		},

		matchTemplate(t: Node) {
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

const PUnit: Unit = {
	mult(u: Unit) {
		return unit(
			this.u.mult(u.u, TYPE_PRODUCT_POINT),
			this.normal().mult(u.normal()),
		)
	},

	div(u: Unit) {
		return unit(this.u.div(u.u), this.normal().div(u.normal()))
	},
	pow(n: Node) {
		//  n doit être un entier relatif
		return unit(this.u.pow(n), this.normal().pow(n.normal))
	},

	toString(): string {
		return this.u.toString({ isUnit: true })
	},

	get string(): string {
		return this.toString()
	},

	isVolume(): boolean {
		return this.isMetricalVolume() || this.isCapacity()
	},

	isMetricalVolume(): boolean {
		return this.isConvertibleTo(unit('m').mult(unit('m')).mult(unit('m')))
	},

	isCapacity(): boolean {
		return this.isConvertibleTo(unit('L'))
	},

	isConvertibleTo(expectedUnit: Unit): boolean {
		return this.normal().isConvertibleTo(expectedUnit.normal())
		// on compare les bases de la forme normale
	},

	getCoefTo(u: Unit): Node {
		return this.normal().getCoefTo(u.normal()).node
	},

	equalsTo(u: Unit): boolean {
		return this.normal().equalsTo(u.normal())
	},
	type: TYPE_UNIT,
	normal() {
		return this._normal as Normal
	},
	get u() {
		return this._u as Node
	},
}

/* 
ne doit être appelée à l'extérieur que pour créer une unité simple. Les unités composées sont créées par multiplication, division ou exponentiation.
*/
function unit(u: string | Node, normal?: Normal) {
	// if (!normal) {
	if (typeof u === 'string') {
		// c'est une unité simple créé avec une string
		const coef = number(baseUnits[u][0])
		const base = symbol(baseUnits[u][1])
		normal = coef.mult(base).normal
	}

	const e: Unit = Object.create(PUnit)
	Object.assign(e, {
		_u: typeof u === 'string' ? symbol(u) : u,
		_normal: normal,
	})
	return e
}

const baseUnits: Record<string, conversionTable> = {
	Qr: [1, 'Qr'],
	'k€': [1000, '€'],
	'€': [1, '€'],
	kL: [1000, 'L'],
	hL: [100, 'L'],
	daL: [10, 'L'],
	L: [1, 'L'],
	dL: [0.1, 'L'],
	cL: [0.01, 'L'],
	mL: [0.001, 'L'],
	km: [1000, 'm'],
	hm: [100, 'm'],
	dam: [10, 'm'],
	m: [1, 'm'],
	dm: [0.1, 'm'],
	cm: [0.01, 'm'],
	mm: [0.001, 'm'],
	t: [1000000, 'g'],
	q: [100000, 'g'],
	kg: [1000, 'g'],
	hg: [100, 'g'],
	dag: [10, 'g'],
	g: [1, 'g'],
	dg: [0.1, 'g'],
	cg: [0.01, 'g'],
	mg: [0.001, 'g'],
	an: [31536000000, 'ms'],
	ans: [31536000000, 'ms'],
	mois: [2592000000, 'ms'],
	semaine: [604800000, 'ms'],
	semaines: [604800000, 'ms'],
	jour: [86400000, 'ms'],
	jours: [86400000, 'ms'],
	h: [3600000, 'ms'],
	min: [60000, 'ms'],
	mins: [60000, 'ms'],
	s: [1000, 'ms'],
	ms: [1, 'ms'],
	'°': [1, '°'],
	noUnit: [1, 'noUnit'],
}

export { unit, baseUnits }

/* 
Les formes normales servent à déterminer si deux expressions sont équivalentes.
Les formes normales sont vues comme des fractions rationnelles.
Le numérateur et le dénominateur doivent être développées et réduits. Les fractions et racines doivent être simplifiées.
Les fonctions numériques doivent être évaluées à une forme exacte.
Les unités sont converties à l'unité de base.
*/

const defaultsToNode: ToNodeArg = { isUnit: false, formatTime: false }

const pNlist: Nlist = {
	type: TYPE_NSUM,
	children: [],
	[Symbol.iterator]() {
		return this.children[Symbol.iterator]()
	},

	// on compare deux listes de même type (NSum NProduct)
	compareTo(l: Nlist) {
		return compare(this, l)
	},

	// TODO: c'est pour des listes ou des formes normales ?
	// TODO: A revoir
	equalsTo(l: Nlist) {
		// if (typeof e === 'string') e = math(e).normal
		// avec ou sans l'unité ?
		return this.string === l.string
	},

	// fusionne deux listes de même type
	merge(l: Nlist) {
		let pos: number
		// on part des fils de this (on enlève les éléments où le coef vaut 0)
		const result = this.children.filter((child) => !child[0].isZero())

		for (const child of l) {
			const base = child[1]
			const coef2 = child[0]
			if (coef2.isZero()) continue
			const bases = result.map((e) => e[1])
			// on cherche où insérer child en comparant les bases
			pos =
				bases.length > 0
					? binarySearchCmp(bases, base, (e, f) => {
							if (isNlist(e)) {
								return e.compareTo(f as Nlist)
							} else {
								return e.compareTo(f as Node)
							}
					  })
					: ~0
			if (pos < 0) {
				// il n'y a pas de base identique
				result.splice(~pos, 0, child)
			} else {
				// on doit fusionner les deux éléments qui ont la même base
				const coef1 = result[pos][0]

				let coef: Nlist | Node
				if (isNlist(coef1)) {
					coef = coef1.merge(coef2 as Nlist) // coef1 est un nSum
				} else {
					const newcoefvalue = fraction(coef1.string)
						.add(fraction(coef2.string))
						.reduce()

					coef = math(newcoefvalue.toString())
				}

				if (coef.isZero()) {
					// on enleve un terme ou un facteur inutile
					result.splice(pos, 1)
				} else {
					result[pos] = [coef, base]
				}
			}
		}
		return this.createList(this.type, result)
	},

	createList(
		type: typeof TYPE_NSUM | typeof TYPE_NPRODUCT,
		children: NlistElements,
	) {
		return type === TYPE_NSUM ? nSum(children) : nProduct(children)
	},

	// symmetrize an element [coef, base]
	symmetrize(this: Nlist) {
		const f = function (
			e: [Nlist | Node, Nlist | Node],
		): [Nlist | Node, Nlist | Node] {
			const coef = e[0]
			const base = e[1]
			let newcoef: Nlist | Node
			if (coef.isZero()) return e
			if (isNlist(coef)) {
				newcoef = coef.oppose()
			} else {
				newcoef = isOpposite(coef) ? coef.first : coef.oppose()
			}
			return [newcoef, base]
		}

		return this.createList(this.type, this.children.map(f))
	},

	get string() {
		return this.toString()
	},

	toString(params?: ToStringArg) {
		return this.node.toString(params)
	},

	isOne() {
		return this.node.isOne()
	},
	isZero() {
		return this.node.isZero()
	},
	isMinusOne() {
		return this.node.isMinusOne()
	},
	isInt() {
		return this.node.isInt()
	},
	isOpposite() {
		return this.node.isOpposite()
	},
	get first() {
		return this.children[0]
	},
	get last() {
		return this.children[this.children.length - 1]
	},
	get length() {
		return this.children.length
	},
	get node() {
		return this.toNode()
	},

	toNode() {
		const nProductElementToNode = function ([coef, base]: [Node, Node]) {
			// normalement coef est différent de 0
			// TODO: mise a jour ds parents ?
			let e = base
			if (coef.string === '1/2') {
				e = radical([base])
			} else if (!base.isOne() && !coef.isOne()) {
				// e = e.pow(coef.isNumber() || coef.isSymbol() ? coef : bracket([coef]))
				if (e.isOpposite()) {
					e = e.bracket()
				}
				e = e.pow(coef)
			}
			return e
		}

		let e: Node
		if (this.type === TYPE_NPRODUCT) {
			e = number(1)
			for (let i = 0; i < this.children.length; i++) {
				const coef = this.children[i][0]
				const base = this.children[i][1]
				let factor = nProductElementToNode([coef as Node, base as Node])

				if (factor.isOpposite() || factor.isSum() || factor.isDifference()) {
					// console.log('factor', factor.string)
					factor = factor.bracket()
				}
				if (i === 0) {
					e = factor
				} else if (!factor.isOne()) {
					// est ce que c'est possible?
					e = e.mult(factor)
				}
			}
		} else {
			// type NSum
			e = number(0)
			for (let i = 0; i < this.children.length; i++) {
				const child = this.children[i]
				let coef = isNlist(child[0]) ? child[0].node : child[0]
				const base = (child[1] as Nlist).node
				let term: Node
				let minus = false
				if (base.isOne()) {
					term = coef
				} else if (coef.isOne()) {
					term = base
				} else if (coef.isMinusOne()) {
					minus = true
					term = base
				} else if (isOpposite(coef)) {
					minus = true
					if (coef.first.isSum() || coef.first.isDifference()) {
						term = coef.first.bracket().mult(base)
					} else {
						term = coef.first.mult(base)
					}
				} else {
					if (coef.isSum() || coef.isDifference()) {
						coef = coef.bracket()
					}
					term = coef.mult(base)
				}
				if (i === 0) {
					e = minus ? term.oppose() : term
				} else {
					e = minus ? e.sub(term) : e.add(term)
				}
			}
		}
		return e
	},

	mult(l: Nlist) {
		let t: NlistElements = []
		if (this.type === TYPE_NPRODUCT) {
			t = t.concat(this.merge(l).children)
			t = t.filter((e) => !e[1].isOne())
			return nProduct(t)
		}
		//  NSum
		else {
			// on boucle d'abord sur les termes des deux sommes que l'on doit multiplier deux à deux
			for (const term1 of this) {
				for (const term2 of l) {
					const coefs: [Node, Nlist][] = []
					// on multiplie les coefs d'un côté, les bases de l'autre
					const coef1 = term1[0] as Nlist // nSum
					const base1 = term1[1] as Nlist // nProduct
					const coef2 = term2[0] as Nlist // nSum
					const base2 = term2[1] as Nlist // nProduct

					// coef1 et coef2 sont des nSum, il faut les multiplier proprement
					for (const [coefcoef1, basecoef1] of coef1) {
						for (const [coefcoef2, basecoef2] of coef2) {
							// coefcoef1 et coefcoef2 sont des nombres, fractions
							// basecoef1 et basecoef2 sont des nProduct
							// TODO: pourquoi ne pas faire les calculs sur des Decimal ?
							// TODO: pourquoi que des valeurs entières ?
							const newcoefvalue =
								parseInt(coefcoef1.string) * parseInt(coefcoef2.string)
							const negative = newcoefvalue < 0
							let coef: Node = number(Math.abs(newcoefvalue))
							let base = (basecoef1 as Nlist).mult(basecoef2 as Nlist)
							if (isNumber(base.node) && !base.node.isOne()) {
								coef = number((coef as Numbr).value.mul(base.node.value))
								base = baseOne()
							}
							if (negative) coef = coef.oppose()
							coefs.push([coef, base])
						}
					}
					// ne pas oublier de merger : (2+racine(3))(3+racine(3)) -> les bases changent de type
					const coef = simpleCoef(number(0)).merge(nSum(coefs))
					// A verfier : (1-x)(1+x)
					// et si l'une des bases  vaut 1 ?
					t.push([coef, base1.mult(base2)])
				}
			}
			return nSumZero().merge(nSum(t))
		}
	},

	add(l: Nlist) {
		return this.merge(l)
	},

	sub(l: Nlist) {
		return this.merge(l.oppose())
	},

	oppose() {
		return this.symmetrize()
	},

	invert() {
		return this.symmetrize()
	},

	div(l: Nlist) {
		return this.frac(l)
	},

	frac(denom: Nlist) {
		return this.mult(denom.invert())
	},
}

const emptyList = Object.create(pNlist)

const pNormal: Normal = {
	type: TYPE_NORMAL,
	get n() {
		return this._n as Nlist
	},
	get d() {
		return this._d as Nlist
	},
	isZero() {
		return this.n.isZero()
	},

	isInt() {
		return this.node.isInt()
	},

	isOne() {
		return this.node.isOne()
	},

	isProduct() {
		return this.node.isProduct()
	},

	isPower() {
		return this.node.isPower()
	},

	isDivision() {
		return this.node.isDivision()
	},

	isQuotient() {
		return this.node.isQuotient()
	},

	isOpposite() {
		return this.node.isOpposite()
	},

	isMinusOne() {
		return this.node.isMinusOne()
	},

	isNumeric() {
		return this.node.isNumeric()
	},

	isDuration() {
		return !!this.unit && this.unit.isConvertibleTo(unit('s').normal())
	},
	isLength() {
		return !!this.unit && this.unit.isConvertibleTo(unit('m').normal())
	},
	isMass() {
		return !!this.unit && this.unit.isConvertibleTo(unit('g').normal())
	},

	// test if two units are the same type
	isConvertibleTo(u: Normal) {
		const u1N = nSum([[simpleCoef(number(1)), this.n.first[1]]])
		const u1D = nSum([[simpleCoef(number(1)), this.d.first[1]]])
		const u1 = normal(u1N, u1D)
		const u2N = nSum([[simpleCoef(number(1)), u.n.first[1]]])
		const u2D = nSum([[simpleCoef(number(1)), u.d.first[1]]])
		const u2 = normal(u2N, u2D)

		return (
			u1.equalsTo(u2) ||
			(u1.string === 'm^3' && u2.string === 'L') ||
			(u1.string === 'L' && u2.string === 'm^3')
		)
	},

	isSameQuantityType(e: Normal) {
		return (
			(!this.unit && !e.unit) ||
			(!!this.unit && !!e.unit && this.unit.isConvertibleTo(e.unit))
		)
	},

	getCoefTo(u: Normal) {
		const coefN1 = nSum([[this.n.first[0], baseOne()]])
		const coefD1 = nSum([[this.d.first[0], baseOne()]])
		const coef1 = normal(coefN1, coefD1)
		const coefN2 = nSum([[u.n.first[0], baseOne()]])
		const coefD2 = nSum([[u.d.first[0], baseOne()]])
		const coef2 = normal(coefN2, coefD2)

		const baseN1 = nSum([[nSumOne(), this.n.first[1]]])
		const baseD1 = nSum([[nSumOne(), this.d.first[1]]])
		const base1 = normal(baseN1, baseD1)
		const baseN2 = nSum([[nSumOne(), u.n.first[1]]])
		const baseD2 = nSum([[nSumOne(), u.d.first[1]]])
		const base2 = normal(baseN2, baseD2)
		// console.log('base1', base1.string)
		//   console.log('base2', base2.string)

		let coef = coef1.div(coef2)
		if (base1.string === 'L' && base2.string === 'm^3') {
			// console.log('base1', base1.string)
			// console.log('base2', base2.string)
			coef = coef.mult(math(0.001).normal)
		} else if (base2.string === 'L' && base1.string === 'm^3') {
			// console.log('base1', base1.string)
			// console.log('base2', base2.string)
			coef = coef.mult(math(1000).normal)
		}
		return coef
	},

	// réduit une expression normale correspondant à une fraction numérique
	reduce(this: Normal) {
		// todo : vérifier que c'est bien une fraction numérique
		function lookForPGCDinSum(s: Nlist) {
			let n = new Decimal(0)

			s.children.forEach((term) => {
				const coef = term[0]
				let p: Decimal
				if (isNlist(coef)) {
					p = lookForPGCDinSum(coef)
				} else {
					p = isOpposite(coef)
						? (coef.first as Numbr).value
						: (coef as Numbr).value
				}
				n = !n.isZero() ? pgcdDecimals([n, p]) : p
			})
			return n
		}

		function simplify(s: Nlist, p: Decimal) {
			const terms = s.children.map((term) => {
				let coef = term[0]
				const base = term[1]
				let elmt: NlistElement

				if (isNlist(coef)) {
					coef = simplify(coef, p)
					elmt = [coef, base]
				} else {
					elmt = isOpposite(coef)
						? [number((coef.first as Numbr).value.div(p)).oppose(), base]
						: [number((coef as Numbr).value.div(p)), base]

					// return coef.div(number(p)).eval()
				}
				return elmt
			})
			return nSum(terms)
		}

		const n_pgcd = lookForPGCDinSum(this.n)
		const d_pgcd = lookForPGCDinSum(this.d)

		const p = pgcdDecimals([n_pgcd, d_pgcd])
		let n = simplify(this.n, p)
		let d = simplify(this.d, p)

		let negative = false
		if (n.node.isOpposite()) {
			negative = true
			n = n.oppose()
		}
		if (d.node.isOpposite()) {
			negative = !negative
			d = d.oppose()
		}

		if (negative) n = n.oppose()
		//  console.log('lookup pgcd', this.string, n_pgcd, d_pgcd, p,  n.string)
		return normal(n, d, this.unit)
	},

	add(e: Normal) {
		if (!this.isSameQuantityType(e)) {
			throw new Error("Erreur d'unité")
		}

		return normal(
			this.n.mult(e.d).add(e.n.mult(this.d)),
			this.d.mult(e.d),
			this.unit,
		).reduce()
	},

	sub(e: Normal) {
		// console.log('e', e, e.unit)
		// console.log('this', this, this.unit)

		if (
			(e.unit && this.unit && !e.unit.equalsTo(this.unit)) ||
			(this.unit && !e.unit) ||
			(!this.unit && e.unit)
		)
			throw new Error("Erreur d'unité")
		return normal(
			this.n.mult(e.d).sub(e.n.mult(this.d)),
			this.d.mult(e.d),
			this.unit,
		).reduce()
	},

	mult(exp: Normal | string | number | Decimal) {
		const e = convertToNormal(exp)
		let unit: Normal | undefined
		if (this.unit && e.unit) unit = this.unit.mult(e.unit)
		else if (this.unit) unit = this.unit
		else unit = e.unit

		if (unit && unit.string === '1') unit = undefined
		return normal(this.n.mult(e.n), e.d.mult(this.d), unit).reduce()
	},

	div(e: Normal) {
		// TODO: prendre en compte le cas de la division par 0
		return this.mult(e.invert())
	},

	pow(e: Normal) {
		if (e.isZero()) return normOne(this.unit)
		if (e.isOne()) return this
		if (this.isZero()) return this
		if (this.isOne()) return this
		if (e.isMinusOne()) return this.invert()

		let result: Normal
		if (isInt(e.node)) {
			// e.node.value >=2
			const n = e.node.value.toNumber()
			result = this.mult(this)
			if (n >= 3) {
				for (let i = 1; i < n - 1; i++) {
					result = result.mult(this)
				}
			}
		} else if (isOpposite(e.node) && isInt(e.node.first)) {
			const n = e.node.first.value.toNumber() //n>=2
			result = this.mult(this)
			if (n >= 3) {
				for (let i = 1; i < n - 1; i++) {
					result = result.mult(this)
				}
			}
			result = result.invert()
		} else if (isProduct(this.node)) {
			const factors = this.node.factors.map((factor) => factor.normal)
			result = (factors.shift() as Normal).pow(e)
			factors.forEach((factor) => {
				result = result.mult(factor.pow(e))
			})
		} else if (this.isQuotient() || this.isDivision()) {
			result = this.n.node.normal.pow(e).div(this.d.node.normal.pow(e))
		} else if (isPower(this.node)) {
			// const exp= fraction(this.node.last.string)
			const exp = this.node.last.mult(e.node).eval()
			result = this.node.first.normal.pow(exp.normal)
		} else if (e.equalsTo(number(0.5).normal) && isInt(this.node)) {
			if (this.node.value.sqrt().isInt()) {
				result = number(this.node.value.sqrt()).normal
			} else {
				const n = this.node.value.toNumber()
				const k = RadicalReduction(n)
				if (k === 1) {
					const coef = nSum([[number(1), createBase(this.node, e.node)]])
					const n = nSum([[coef, baseOne()]])
					const d = nSumOne()
					result = normal(n, d)
				} else {
					result = number(k).mult(number(n / (k * k)).pow(number(0.5))).normal
				}
			}
		} else if (
			isOpposite(e.node) &&
			e.node.first.equals(number(0.5)) &&
			isInt(this.node) &&
			this.node.value.sqrt().isInt()
		) {
			result = number(this.node.value.sqrt().toNumber()).normal.invert()
		} else {
			// TODO: parenthèses ??
			let n: Nlist, d: Nlist
			if (this.isNumeric() && e.isNumeric()) {
				const coef = nSum([[number(1), createBase(this.node, e.node)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			} else {
				n = nSum([[coefOne(), createBase(this.node, e.node)]])
				d = nSumOne()
			}

			// TODO: et l'unité ???
			result = normal(n, d)
		}
		return result
	},

	oppose() {
		return normal(this.n.oppose(), this.d, this.unit)
	},

	invert() {
		const unit = this.unit ? this.unit.invert() : undefined
		let n: Nlist
		let d: Nlist
		if (this.n.length === 1) {
			const coef = this.n.first[0]
			d = nSum([[coef, baseOne()]])
			const base = (this.n.first[1] as Nlist).symmetrize()
			n = nSum([[coefOne(), base]])
		} else {
			n = nSumOne()
			d = this.n
		}
		n = n.mult(this.d)
		// }
		return normal(n, d, unit).reduce()
	},

	compareTo(e: Normal) {
		return compare(this, e)
	},

	get node() {
		return (this as Normal).toNode()
	},

	//  si la forme représente une fraction numérique, celle-ci a été simplifiée et le signe
	// est au numérateur
	toNode({ formatTime }: ToNodeArg = defaultsToNode) {
		let e: Node
		let n = this.n.node
		const d = this.d.node

		if (d.isOne()) {
			e = n
		} else {
			let positive = true
			if (isOpposite(n)) {
				positive = false
				n = n.first
			}

			e = n.frac(d)
			if (!positive) e = e.oppose()
		}

		if (this.unit) {
			if (formatTime) {
				let s = ''
				let ms = (e as Numbr).value.toNumber()
				const ans = Math.floor(ms / 31536000000)
				if (ans) s += ans + ' ans '
				ms = ms % 31536000000
				const jours = Math.floor(ms / 86400000)
				if (jours) s += jours + ' jours '
				ms = ms % 86400000
				const heures = Math.floor(ms / 3600000)
				if (heures) s += heures + ' h '
				ms = ms % 3600000
				const minutes = Math.floor(ms / 60000)
				if (minutes) s += minutes + ' min '
				ms = ms % 60000
				const secondes = Math.floor(ms / 1000)
				if (secondes) s += secondes + ' s '
				ms = ms % 1000
				if (ms) s += ms + ' ms '

				e = math(s)
			} else {
				e.unit = math(
					'1' + this.unit.toNode({ isUnit: true }).toString({ isUnit: true }),
				).unit
			}
		}

		return e
	},

	get string() {
		return (this as Normal).node.string
	},

	equalsTo(exp: Normal | string | number) {
		const e = convertToNormal(exp)
		return this.n.mult(e.d).equalsTo(this.d.mult(e.n))
	},
}

function normal(n: Nlist, d: Nlist, unit?: Normal) {
	const o = Object.create(pNormal)
	if (!d) d = nSumOne()
	Object.assign(o, {
		_n: n,
		_d: d,
		unit,
		type: TYPE_NORMAL,
	})
	return o as Normal
}

/**
 * Les formes normales sont exprimées sous la forme de sommes de produits
 * Les sommes et les produits sont sous forme de listes dont les éléments comportent deux parties : un coefficient et une base
 * pour les produits, le coefficient correspond à l'exposant.
 * Attention, un coefficient peut très bien lui aussi s'exprimer sous la forme d'une somme, par exemple pour pouvoir
 * travailler avec des expressions de la forme (2+racine(3))*x
 * nSum = [ [coef, base], ...] où coef est un nSum (où les coefs sont des entiers) et base un nProduct
 * nProduct = [ [coef, base], ...] où coef est un nSum et base une expression
 * Exemples de formes normales :
 * one et number(0) sont des expressions représentant les nombres 1 et 0
 *
 * nSum([ [ nSum([[number(0), one]]), nProduct() ] ])
 * 0 =0*1^1-> [ [ [[0,1]], [[1, 1]] ] ]
 * 1 = 1*1^1-> [ [ [[1, 1]], [[1, 1]] ] ]
 * 2 = 2*1^1-> [ [ [[2, 1]], [[1, 1]] ] ]
 * racine(2) = racine(2)*1^1-> [ [ [[1, racine(2)]], [[1, 1]] ] ]
 * 3*racine(2) = 3*racine(2)*1^1-> [ [ [[3, racine(2)]], [[1, 1]] ] ]
 * 5 + 3*racine(2) -> [ [[[5, 1]], [[1, 1]]],   [[[3, racine(2)]], [[1, 1]]] ]
 * x = 1*x^1-> [ [ [[1, 1]], [[1, x]] ] ]
 * x^2 = 1*x^2-> [ [ [[1, 1]], [[2, x]] ] ]
 * 2x = 2*x^1-> [ [ [[2, 1]], [[1, x]] ] ]
 * 1+x -> [ [ [[1, 1]], [[1, 1]] ], [ [[1, 1]], [[1, x]] ] ]
 * x*y -> [ [ [[1, 1]], [[1, x], [1,y]] ] ]
 */

/**
 * Prototype des formes normales intermédiaires
 */

/**
 * Constantes utilisées
 */
function baseOne() {
	return nProduct([[number(1), number(1)]])
}

function simpleCoef(coef: Node) {
	return nSum([[coef, baseOne()]])
}

function coefOne() {
	return simpleCoef(number(1))
}

function coefZero() {
	return simpleCoef(number(0))
}

function nSumOne() {
	return nSum([[coefOne(), baseOne()]])
}

function nSumZero() {
	return nSum([[coefZero(), baseOne()]])
}

// forme normale du nombre 1 - singleton
function normOne(unit?: Normal) {
	return normal(nSumOne(), nSumOne(), unit)
}

function nProduct(children: NlistElements) {
	const o: Nlist = Object.create(pNlist)
	Object.assign(o, {
		type: TYPE_NPRODUCT,
		children:
			!children || children.length === 0 ? [[number(1), number(1)]] : children,
	})
	return o
}

function nSum(children: NlistElements) {
	const o: Nlist = Object.create(pNlist)

	Object.assign(o, {
		type: TYPE_NSUM,
		children:
			!children || children.length === 0 ? nSumZero().children : children,
	})
	return o
}

function createBase(b: Node, e?: Node) {
	return nProduct([[e || number(1), b]])
}

export default function normalize(node: Node): Normal {
	let d: Nlist = emptyList // dénominateur de la partie normale
	let n: Nlist = emptyList // numérateur de la partie normale
	let e: Normal | null = null // forme normale retournée

	// pose des problèmes de prototypes
	// const { unit, ...others } = node // ? est-ce qu'on se débarrasse de la forme normale?
	// others.proto

	if (isLimit(node)) {
		n = nSum([[coefOne(), createBase(node)]])
		d = nSumOne()
	} else if (isTime(node)) {
		const children = node.children.map((c) => c.normal)
		e = children.pop() as Normal
		while (children.length) {
			e = e.add(children.pop() as Normal)
		}
	} else if (isBoolean(node)) {
		n = nSum([[coefOne(), createBase(node)]])
		d = nSumOne()
	} else if (isNumber(node)) {
		if (node.isInt()) {
			n = nSum([[simpleCoef(number(node.value)), baseOne()]])
			d = nSumOne()
		} else {
			// on convertit le float en fraction
			e = math(fraction(node).toString()).normal
		}
	} else if (isPower(node)) {
		e = node.first.normal.pow(node.last.normal)
	} else if (isRadical(node)) {
		e = node.first.normal.pow(number(0.5).normal)
	} else if (isCos(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (childNormal.equalsTo(0) || childNormal.equalsTo('2pi')) {
			e = math(1).normal
		} else if (childNormal.equalsTo('pi') || childNormal.equalsTo('-pi')) {
			e = math(-1).normal
		} else if (childNormal.equalsTo('pi/2') || childNormal.equalsTo('-pi/2')) {
			e = math(0).normal
		} else if (childNormal.equalsTo('pi/3') || childNormal.equalsTo('-pi/3')) {
			e = math(0.5).normal
		} else if (
			childNormal.equalsTo('2pi/3') ||
			childNormal.equalsTo('-2pi/3')
		) {
			e = math(-0.5).normal
		} else if (childNormal.equalsTo('pi/4') || childNormal.equalsTo('-pi/4')) {
			e = math('sqrt(2)/2').normal
		} else if (
			childNormal.equalsTo('3pi/4') ||
			childNormal.equalsTo('-3pi/4')
		) {
			e = math('-sqrt(2)/2').normal
		} else if (childNormal.equalsTo('pi/6') || childNormal.equalsTo('-pi/6')) {
			e = math('sqrt(3)/2').normal
		} else if (
			childNormal.equalsTo('5pi/6') ||
			childNormal.equalsTo('-5pi/6')
		) {
			e = math('-sqrt(3)/2').normal
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isSin(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (
			childNormal.equalsTo(0) ||
			childNormal.equalsTo('2pi') ||
			childNormal.equalsTo('pi') ||
			childNormal.equalsTo('-pi')
		) {
			e = math(0).normal
		} else if (childNormal.equalsTo('pi/2')) {
			e = math(1).normal
		} else if (childNormal.equalsTo('-pi/2')) {
			e = math(-1).normal
		} else if (childNormal.equalsTo('pi/6') || childNormal.equalsTo('5pi/6')) {
			e = math(0.5).normal
		} else if (
			childNormal.equalsTo('-pi/6') ||
			childNormal.equalsTo('-5pi/6')
		) {
			e = math(-0.5).normal
		} else if (childNormal.equalsTo('pi/4') || childNormal.equalsTo('3pi/4')) {
			e = math('sqrt(2)/2').normal
		} else if (
			childNormal.equalsTo('-pi/4') ||
			childNormal.equalsTo('-3pi/4')
		) {
			e = math('-sqrt(2)/2').normal
		} else if (childNormal.equalsTo('pi/3') || childNormal.equalsTo('2pi/3')) {
			e = math('sqrt(3)/2').normal
		} else if (
			childNormal.equalsTo('-pi/3') ||
			childNormal.equalsTo('-2pi/3')
		) {
			e = math('-sqrt(3)/2').normal
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isTan(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (childNormal.equalsTo(0)) {
			e = math(0).normal
		} else if (childNormal.equalsTo('pi/6')) {
			e = math('1/sqrt(3)').normal
		} else if (childNormal.equalsTo('-pi/6')) {
			e = math('-1/sqrt(3)').normal
		} else if (childNormal.equalsTo('pi/4')) {
			e = math(1).normal
		} else if (childNormal.equalsTo('-pi/4')) {
			e = math('-1').normal
		} else if (childNormal.equalsTo('pi/3')) {
			e = math('sqrt(3)').normal
		} else if (childNormal.equalsTo('-pi/3')) {
			e = math('-sqrt(3)').normal
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isLn(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (isExp(child)) {
			e = child.first.normal
		} else if (isPower(child)) {
			e = child.last.mult(child.first.ln()).normal
		} else if (childNormal.equalsTo(1)) {
			e = math(0).normal
		} else if (childNormal.equalsTo('e')) {
			e = math(1).normal
		} else if (isInt(child)) {
			const N = child.value.toNumber()
			const factors = primeFactors(N)
			if (factors.length === 1 && factors[0][1] === 1) {
				const base = node.copy([child])
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			} else {
				e = math(0).normal
				e = e.add(number(0).normal)
				factors.forEach((factor) => {
					const [a, k] = factor
					const term = math(`${k}*ln(${a})`).normal
					e = (e as Normal).add(term)
				})
			}
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isExp(node)) {
		const child = node.first
		const childNormal = child.normal

		if (isProduct(child) && (isLn(child.first) || isLn(child.last))) {
			if (isLn(child.first)) {
				e = child.first.first.pow(child.last).normal
			} else {
				e = (child.last as LogN).first.pow(child.first).normal
			}
		} else if (isLn(child)) {
			e = child.first.normal
		} else if (childNormal.equalsTo(0)) {
			e = math(1).normal
		} else {
			const base = node.copy([childNormal.node])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isAbs(node)) {
		const child = node.first
		const childNormal = child.normal
		if (child.isNumeric()) {
			if (child.isLowerThan(0)) {
				e = childNormal.mult(-1)
			} else {
				e = childNormal
			}
		} else {
			const base = node.copy([child])
			d = nSumOne()
			n = nSum([[coefOne(), createBase(base)]])
		}
	} else if (isLog(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (isPower(child)) {
			e = child.last.mult(child.first.log()).normal
		} else if (childNormal.equalsTo(1)) {
			e = math(0).normal
		} else if (childNormal.equalsTo(10)) {
			e = math(1).normal
		} else if (isInt(child)) {
			const N = child.value.toNumber()
			const factors = primeFactors(N)
			if (factors.length === 1 && factors[0][1] === 1) {
				const base = node.copy([child])
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			} else {
				e = math(0).normal
				factors.forEach((factor) => {
					const [a, k] = factor
					const term = math(`${k}*log(${a})`).normal
					e = (e as Normal).add(term)
				})
			}
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isFloor(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node
		if (child.isNumeric()) {
			e = number((child.eval({ decimal: true }) as Numbr).value.floor()).normal
		} else {
			const base = node.copy([child])
			d = nSumOne()
			n = nSum([[coefOne(), createBase(base)]])
		}
	} else if (isPGCD(node)) {
		const children = node.children.map((c) => c.normal.node)
		let a = children[0]
		let b = children[1]
		if (node.isNumeric()) {
			if (isOpposite(a) && a.first.isInt()) {
				a = a.first
			}
			if (isOpposite(b) && b.first.isInt()) {
				b = b.first
			}
			if (isInt(a) && isInt(b)) {
				e = number(gcd(a.value.toNumber(), b.value.toNumber())).normal
			} else {
				const base = node.copy(children)
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			}
		} else {
			const base = node.copy(children)
			n = nSum([[coefOne(), createBase(base)]])
			d = nSumOne()
		}
	} else if (isMod(node)) {
		const children = node.children.map((c) => c.normal.node)
		const a = children[0]
		const b = children[1]
		if (node.isNumeric()) {
			if (
				(isInt(a) || (isOpposite(a) && a.first.isInt())) &&
				(isInt(b) || (isOpposite(b) && b.first.isInt()))
			) {
				e = number(new Decimal(a.string).mod(new Decimal(b.string))).normal
			} else {
				const base = node.copy(children)
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			}
		} else {
			const base = node.copy(children)
			n = nSum([[coefOne(), createBase(base)]])
			d = nSumOne()
		}
	} else if (isMin(node) || isMinP(node)) {
		const children = node.children.map((c) => c.normal.node)
		const a = children[0]
		const b = children[1]
		if (node.isNumeric()) {
			e = a.isLowerThan(b) ? a.normal : b.normal
		} else {
			const base = node.copy(children)
			n = nSum([[coefOne(), createBase(base)]])
			d = nSumOne()
		}
	} else if (isMax(node) || isMaxP(node)) {
		const children = node.children.map((c) => c.normal.node)
		const a = children[0]
		const b = children[1]

		if (node.isNumeric()) {
			e = a.isGreaterThan(b) ? a.normal : b.normal
		} else {
			const base = node.copy(children)
			n = nSum([[coefOne(), createBase(base)]])
			d = nSumOne()
		}
	} else if (isPercentage(node)) {
		e = node.first.div(number(100)).normal
	} else if (isHole(node)) {
		n = nSum([[coefOne(), createBase(node)]])
		d = nSumOne()
	} else if (isIdentifier(node)) {
		n = nSum([[coefOne(), createBase(node)]])
		d = nSumOne()
	} else if (isSymbol(node)) {
		n = nSum([
			[coefOne(), createBase(symbol(node.toString({ displayUnit: false })))],
		])
		d = nSumOne()
	} else if (isBracket(node) || isPositive(node)) {
		e = normalize(node.first)
	} else if (isOpposite(node)) {
		e = node.first.normal
		if (!e.node.isZero()) e = e.oppose() // pour ne pas avoir un -0
	} else if (isSum(node)) {
		e = node.children[0].normal
		for (let i = 1; i < node.children.length; i++) {
			e = e.add(node.children[i].normal)
		}
	} else if (
		isProduct(node) ||
		isProductImplicit(node) ||
		isProductPoint(node)
	) {
		e = number(1).normal
		for (let i = 0; i < node.children.length; i++) {
			e = e.mult(node.children[i].normal)
		}
	} else if (isDifference(node)) {
		e = node.first.normal.sub(node.last.normal)
	} else if (isDivision(node) || isQuotient(node)) {
		e = node.first.normal.div(node.last.normal)
	} else if (isRelations(node)) {
		let bool = true
		// console.log('node', node)
		node.ops.forEach((op, i) => {
			const test = math(node.children[i].string + op + node.children[i + 1])
			bool = bool && (test.eval() as Bool).boolvalue
		})
		e = boolean(bool).normal
	} else if (isUnequality(node)) {
		e = boolean(!node.first.eval().equals(node.last.eval())).normal
	} else if (isEquality(node)) {
		e = boolean(node.first.eval().equals(node.last.eval())).normal
	} else if (isInequalityLess(node)) {
		e = boolean(node.first.eval().isLowerThan(node.last.eval())).normal
	} else if (isInequalityMore(node)) {
		e = boolean(node.first.eval().isGreaterThan(node.last.eval())).normal
	} else if (isInequalityLessOrEqual(node)) {
		e = boolean(node.first.eval().isLowerOrEqual(node.last.eval())).normal
	} else if (isInequalityMoreOrEQual(node)) {
		e = boolean(node.first.eval().isGreaterOrEqual(node.last.eval())).normal
	}

	// TODO: et les TEMPLATES?
	else {
		throw new Error('!!!normalizing default !!! ' + node.string)
	}

	// si e n'a pas été initialisé correctement
	if (!e) {
		e = normal(n, d)
	}
	if (node.unit) {
		// TODO : et quand les opérandes ont aussi une unité ?
		// console.log('node', node)
		// console.log('node.unit', node.unit)

		let u = node.unit.normal()
		//  on récupère le coefficeient de l'unité et on l'applique à la forme normale
		const coefN = nSum([[u.n.first[0], baseOne()]])
		const coefD = nSum([[u.d.first[0], baseOne()]])
		const coef = normal(coefN, coefD)
		const uN = nSum([[simpleCoef(number(1)), u.n.first[1]]])
		const uD = nSum([[simpleCoef(number(1)), u.d.first[1]]])
		u = normal(uN, uD)
		e = e.mult(coef)
		//  TODO: Pourquoi comparer à 1 ?
		if (u.string !== '1') {
			e.unit = u
		}
	}

	return e
}

function convertToNormal(exp: Normal | string | number | Decimal) {
	let e: Normal
	if (
		typeof exp === 'string' ||
		typeof exp === 'number' ||
		Decimal.isDecimal(exp)
	) {
		e = math(exp).normal
	} else {
		e = exp
	}
	return e
}

function shallowClone(obj: object) {
	return Object.create(
		Object.getPrototypeOf(obj),
		Object.getOwnPropertyDescriptors(obj),
	)
}
