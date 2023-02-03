import evaluate from './evaluate'
import fraction from './fraction'
import normalize from './normal'
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
	derivate,
	compose,
} from './transform'
import Decimal from 'decimal.js'
import { math } from './math'
import { unit } from './unit'
import {
	EvalArg,
	Expression,
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
	Unit,
} from './types'

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

const pNode = {
	[Symbol.iterator](this: Expression): IterableIterator<Expression> {
		return this.children ? this.children[Symbol.iterator]() : null
	},

	derivate(this: Expression, variable = 'x'): Expression {
		return derivate(this, variable)
	},

	compose(this: Expression, g: Expression, variable = 'x'): Expression {
		return compose(this, g, variable)
	},

	//  simplifier une fraction numérique
	reduce(this: Expression): Expression {
		// la fraction est déj
		// on simplifie les signes.
		const b = this.removeSigns()

		const negative = b.isOpposite()
		const frac = fraction(negative ? b.first.string : b.string).reduce()

		let result: Expression

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
			if (result.isOpposite()) {
				result = result.first
			} else {
				result = opposite([result])
			}
		}

		return result
	},

	develop(this: Expression): Expression {
		return this
	},
	simplify(this: Expression): Expression {
		return this
	},
	isCorrect(this: Expression) {
		return this.type !== TYPE_ERROR
	},
	isIncorrect(this: Expression) {
		return this.type === TYPE_ERROR
	},
	isRelations(this: Expression) {
		return this.type === TYPE_RELATIONS
	},
	isEquality(this: Expression) {
		return this.type === TYPE_EQUALITY
	},
	isUnequality(this: Expression) {
		return this.type === TYPE_UNEQUALITY
	},
	isInequality(this: Expression) {
		return (
			this.type === TYPE_INEQUALITY_LESS ||
			this.type === TYPE_INEQUALITY_LESSOREQUAL ||
			this.type === TYPE_INEQUALITY_MORE ||
			this.type === TYPE_INEQUALITY_MOREOREQUAL
		)
	},

	isBoolean(this: Expression) {
		return this.type === TYPE_BOOLEAN
	},

	isTrue(this: Expression) {
		return this.isBoolean() && !!this.value
	},

	isFalse(this: Expression) {
		return this.isBoolean() && !this.value
	},

	isSum(this: Expression) {
		return this.type === TYPE_SUM
	},
	isDifference(this: Expression) {
		return this.type === TYPE_DIFFERENCE
	},
	isOpposite(this: Expression) {
		return this.type === TYPE_OPPOSITE
	},
	isPositive(this: Expression) {
		return this.type === TYPE_POSITIVE
	},
	isProduct(this: Expression) {
		return (
			this.type === TYPE_PRODUCT ||
			this.type === TYPE_PRODUCT_IMPLICIT ||
			this.type === TYPE_PRODUCT_POINT
		)
	},
	isDivision(this: Expression) {
		return this.type === TYPE_DIVISION
	},
	isQuotient(this: Expression) {
		return this.type === TYPE_QUOTIENT
	},
	isPower(this: Expression) {
		return this.type === TYPE_POWER
	},
	isRadical(this: Expression) {
		return this.type === TYPE_RADICAL
	},
	isPGCD(this: Expression) {
		return this.type === TYPE_GCD
	},
	isMax(this: Expression) {
		return this.type === TYPE_MAX
	},
	isMaxP(this: Expression) {
		return this.type === TYPE_MAXP
	},
	isMin(this: Expression) {
		return this.type === TYPE_MIN
	},
	isMinP(this: Expression) {
		return this.type === TYPE_MINP
	},
	isMod(this: Expression) {
		return this.type === TYPE_MOD
	},
	isCos(this: Expression) {
		return this.type === TYPE_COS
	},
	isSin(this: Expression) {
		return this.type === TYPE_SIN
	},
	isTan(this: Expression) {
		return this.type === TYPE_TAN
	},
	isLn(this: Expression) {
		return this.type === TYPE_LN
	},
	isLog(this: Expression) {
		return this.type === TYPE_LOG
	},
	isExp(this: Expression) {
		return this.type === TYPE_EXP
	},
	isFloor(this: Expression) {
		return this.type === TYPE_FLOOR
	},
	isAbs(this: Expression) {
		return this.type === TYPE_ABS
	},
	isNumber(this: Expression) {
		return this.type === TYPE_NUMBER
	},
	isBracket(this: Expression) {
		return this.type === TYPE_BRACKET
	},
	isSymbol(this: Expression) {
		return this.type === TYPE_SYMBOL
	},
	isSegmentLength(this: Expression) {
		return this.type === TYPE_SEGMENT_LENGTH
	},
	isTemplate(this: Expression) {
		return this.type === TYPE_TEMPLATE
	},
	isHole(this: Expression) {
		return this.type === TYPE_HOLE
	},
	isTime(this: Expression) {
		return this.type === TYPE_TIME
	},
	isLimit(this: Expression) {
		return this.type === TYPE_LIMIT
	},
	isChild(this: Expression) {
		return !!this.parent
	},
	isIdentifier(this: Expression) {
		return this.type === TYPE_IDENTIFIER
	},

	isFirst(this: Expression) {
		return this.parent && this.parent.children.indexOf(this) === 0
	},

	isLast(this: Expression) {
		return this.parent && this.parent.children.indexOf(this) === 1
	},

	isFunction(this: Expression) {
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

	isDuration(this: Expression) {
		return (
			this.isTime() || (!!this.unit && this.unit.isConvertibleTo(unit('s')))
		)
	},

	isLength(this: Expression) {
		return !!this.unit && this.unit.isConvertibleTo(unit('m'))
	},

	isMass(this: Expression) {
		return !!this.unit && this.unit.isConvertibleTo(unit('g'))
	},

	isVolume(this: Expression) {
		return (
			!!this.unit &&
			(this.unit.isConvertibleTo(unit('m').mult(unit('m')).mult(unit('m'))) ||
				this.unit.isConvertibleTo(unit('L')))
		)
	},

	compareTo(this: Expression, e: Expression) {
		return compare(this, e)
	},

	isLowerThan(this: Expression, e: Expression | string | number) {
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

	isLowerOrEqual(this: Expression, e: Expression | string | number) {
		if (typeof e === 'string' || typeof e === 'number') {
			e = math(e)
		}
		return this.isLowerThan(e) || this.equals(e)
	},

	isGreaterThan(this: Expression, e: Expression | string | number) {
		if (typeof e === 'string' || typeof e === 'number') {
			e = math(e)
		}
		return e.isLowerThan(this)
	},

	isGreaterOrEqual(this: Expression, e: Expression | string | number) {
		if (typeof e === 'string' || typeof e === 'number') {
			e = math(e)
		}
		return this.isGreaterThan(e) || this.equals(e)
	},

	isOne(this: Expression) {
		return this.toString({ displayUnit: false }) === '1'
	},

	isMinusOne(this: Expression) {
		return this.string === '-1'
	},

	isZero(this: Expression) {
		return this.toString({ displayUnit: false }) === '0'
	},

	equalsZero(this: Expression) {
		return this.eval().isZero()
	},

	strictlyEquals(this: Expression, e: Expression) {
		return this.string === e.string
	},

	equals(this: Expression, e: Expression) {
		if (typeof e === 'string' || typeof e === 'number') {
			e = math(e)
		}
		switch (this.type) {
			case TYPE_EQUALITY:
				return (
					e.type === TYPE_EQUALITY &&
					((this.first.equals(e.first) && this.last.equals(e.last)) ||
						(this.first.equals(e.last) && this.last.equals(e.first)))
				)

			case TYPE_INEQUALITY_LESS:
				return (
					(e.type === TYPE_INEQUALITY_LESS &&
						this.first.equals(e.first) &&
						this.last.equals(e.last)) ||
					(e.type === TYPE_INEQUALITY_MORE &&
						this.first.equals(e.last) &&
						this.last.equals(e.first))
				)

			case TYPE_INEQUALITY_LESSOREQUAL:
				return (
					(e.type === TYPE_INEQUALITY_LESSOREQUAL &&
						this.first.equals(e.first) &&
						this.last.equals(e.last)) ||
					(e.type === TYPE_INEQUALITY_MOREOREQUAL &&
						this.first.equals(e.last) &&
						this.last.equals(e.first))
				)

			case TYPE_INEQUALITY_MORE:
				return (
					(e.type === TYPE_INEQUALITY_MORE &&
						this.first.equals(e.first) &&
						this.last.equals(e.last)) ||
					(e.type === TYPE_INEQUALITY_LESS &&
						this.first.equals(e.last) &&
						this.last.equals(e.first))
				)

			case TYPE_INEQUALITY_MOREOREQUAL:
				return (
					(e.type === TYPE_INEQUALITY_MOREOREQUAL &&
						this.first.equals(e.first) &&
						this.last.equals(e.last)) ||
					(e.type === TYPE_INEQUALITY_LESSOREQUAL &&
						this.first.equals(e.last) &&
						this.last.equals(e.first))
				)

			default:
				return this.normal.string === e.normal.string
		}
	},

	isSameQuantityType(this: Expression, e: Expression) {
		return (!this.unit && !e.unit) || this.normal.isSameQuantityType(e.normal)
	},

	// recusirvly gets sum terms (with signs)
	get terms() {
		let left, right

		if (this.isSum()) {
			if (this.first.isPositive()) {
				left = [{ op: '+', term: this.first.first }]
			} else if (this.first.isOpposite()) {
				left = [{ op: '-', term: this.first.first }]
			} else {
				left = this.first.terms
			}

			right = [{ op: '+', term: this.last }]
			return left.concat(right)
		} else if (this.isDifference()) {
			if (this.first.isPositive()) {
				left = [{ op: '+', term: this.first.first }]
			} else if (this.first.isOpposite()) {
				left = [{ op: '-', term: this.first.first }]
			} else {
				left = this.first.terms
			}

			right = [{ op: '-', term: this.last }]
			return left.concat(right)
		} else {
			return [{ op: '+', term: this }]
		}
	},

	// recusirvly gets product factors
	get factors() {
		if (this.isProduct()) {
			const left = this.first.factors
			const right = this.last.factors
			return left.concat(right)
		} else {
			return [this]
		}
	},

	get pos() {
		return this.parent ? this.parent.children.indexOf(this) : 0
	},

	get first() {
		return this.children ? this.children[0] : null
	},

	get last() {
		return this.children ? this.children[this.children.length - 1] : null
	},

	get length() {
		return this.children ? this.children.length : null
	},

	toString(this: Expression, params: ToStringArg) {
		return text(this, { ...toStringDefaults, ...(params || {}) })
	},

	get string() {
		return this.toString()
	},

	toLatex(this: Expression, params: ToLatexArg) {
		return latex(this, { ...toLatexDefaults, ...(params || {}) })
	},

	get latex() {
		return this.toLatex()
	},

	toTexmacs(this: Expression, params: ToTexmacsArg) {
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

	isInt(this: Expression) {
		// trick pour tester si un nombre est un entier
		// return this.isNumber() && (this.value | 0) === this.value
		return this.isNumber() && this.value.isInt()
	},

	isEven(this: Expression) {
		return this.isInt() && this.value.mod(2).equals(0)
	},

	isOdd(this: Expression) {
		return this.isInt() && this.value.mod(2).equals(1)
	},

	isNumeric(this: Expression) {
		return (
			this.isNumber() ||
			(!!this.children && this.children.every((child) => child.isNumeric()))
		)
	},

	add(this: Expression, e: Expression) {
		if (typeof e === 'string' || typeof e === 'number') {
			e = math(e)
		}
		return sum([this, e])
	},

	sub(this: Expression, e: Expression) {
		return difference([this, e])
	},

	mult(this: Expression, e: Expression | string | number, type = TYPE_PRODUCT) {
		if (typeof e === 'string' || typeof e === 'number') {
			e = math(e)
		}
		return product([this, e], type)
	},

	div(this: Expression, e: Expression) {
		return division([this, e])
	},

	frac(this: Expression, e: Expression) {
		return quotient([this, e])
	},

	oppose(this: Expression) {
		return opposite([this])
	},

	inverse(this: Expression) {
		return quotient([number(1), this])
	},

	radical(this: Expression) {
		return radical([this])
	},

	positive(this: Expression) {
		return positive([this])
	},

	bracket(this: Expression) {
		return bracket([this])
	},

	pow(this: Expression, e: Expression) {
		return power([this, e])
	},

	floor(this: Expression) {
		return floor([this])
	},

	mod(this: Expression, e: Expression) {
		return mod([this, e])
	},

	abs(this: Expression) {
		return abs([this])
	},

	exp(this: Expression) {
		return exp([this])
	},

	ln(this: Expression) {
		return ln([this])
	},

	log(this: Expression) {
		return log([this])
	},

	sin(this: Expression) {
		return sin([this])
	},

	cos(this: Expression) {
		return cos([this])
	},

	shallowShuffleTerms(this: Expression) {
		if (this.isSum() || this.isDifference()) {
			return shallowShuffleTerms(this)
		} else {
			return this
		}
	},

	shallowShuffleFactors(this: Expression) {
		if (this.isProduct()) {
			return shallowShuffleFactors(this)
		} else {
			return this
		}
	},

	shuffleTerms(this: Expression) {
		return shuffleTerms(this)
	},

	shuffleFactors(this: Expression) {
		return shuffleFactors(this)
	},

	shuffleTermsAndFactors(this: Expression) {
		return shuffleTermsAndFactors(this)
	},

	sortTerms(this: Expression) {
		return sortTerms(this)
	},

	shallowSortTerms(this: Expression) {
		return shallowSortTerms(this)
	},

	sortFactors(this: Expression) {
		return sortFactors(this)
	},

	shallowSortFactors(this: Expression) {
		return shallowSortFactors(this)
	},

	sortTermsAndFactors(this: Expression) {
		return sortTermsAndFactors(this)
	},

	reduceFractions(this: Expression) {
		return reduceFractions(this)
	},

	removeMultOperator(this: Expression) {
		return removeMultOperator(this)
	},

	removeUnecessaryBrackets(this: Expression, allowFirstNegativeTerm = false) {
		return removeUnecessaryBrackets(this, allowFirstNegativeTerm)
	},

	removeZerosAndSpaces(this: Expression) {
		return removeZerosAndSpaces(this)
	},

	removeSigns(this: Expression) {
		return removeSigns(this)
	},

	removeNullTerms(this: Expression) {
		return removeNullTerms(this)
	},

	removeFactorsOne(this: Expression) {
		return removeFactorsOne(this)
	},

	simplifyNullProducts(this: Expression) {
		return simplifyNullProducts(this)
	},

	searchUnecessaryZeros(this: Expression) {
		if (this.isNumber()) {
			const regexs = [/^0\d+/, /[.,]\d*0$/]
			return regexs.some((regex) => this.input.replace(/ /g, '').match(regex))
		} else if (this.children) {
			return this.children.some((child) => child.searchUnecessaryZeros())
		} else {
			return false
		}
	},

	searchMisplacedSpaces(this: Expression) {
		if (this.isNumber()) {
			const [int, dec] = this.input.replace(',', '.').split('.')
			let regexs = [/\d{4}/, /\s$/, /\s\d{2}$/, /\s\d{2}\s/, /\s\d$/, /\s\d\s/]
			if (regexs.some((regex) => int.match(regex))) return true

			if (dec) {
				regexs = [/\d{4}/, /^\s/, /^\d{2}\s/, /\s\d{2}\s/, /^\d\s/, /\s\d\s/]
				if (regexs.some((regex) => dec.match(regex))) return true
			}
			return false
		} else if (this.children) {
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

	eval(this: Expression, params?: EvalArg) {
		// par défaut on veut une évaluation exacte (entier, fraction, racine,...)
		params = { ...evalDefaults, ...params }
		// on substitue récursivement car un symbole peut en introduire un autre. Exemple : a = 2 pi
		let e = this.substitute(params.values)
		if (this.ops && !e.ops) {
			console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
		}
		let unit: Unit | 'HMS'
		if (params.unit) {
			if (typeof params.unit === 'string' && params.unit !== 'HMS') {
				unit = math('1 ' + params.unit).unit
			} else if (params.unit === 'HMS') {
				unit = 'HMS'
			} else {
				unit = params.unit
			}
		}

		//  Cas particuliers : fonctions minip et maxip
		// ces fonctions doivent retourner la forme initiale d'une des deux expressions
		// et non la forme normale
		if (this.isNumeric() && (this.isMaxP() || this.isMinP())) {
			// TODO: et l'unité ?
			if (this.isMinP()) {
				e = this.first.isLowerThan(this.last) ? this.first : this.last
			} else {
				e = this.first.isGreaterThan(this.last) ? this.first : this.last
			}
		} else {
			// on passe par la forme normale car elle nous donne la valeur exacte et gère les unités
			let n = e.normal

			// si l'unité du résultat est imposée
			if (unit) {
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
					const coef = n.unit.getCoefTo(unit.normal)
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
	generate(this: Expression) {
		// tableau contenant les valeurs générées pour  $1, $2, ....
		this.root.generated = []
		return generate(this)
	},

	shallow(this: Expression) {
		return {
			nature: this.type,
			children: this.children ? this.children.map((e) => e.type) : null,
			unit: this.unit ? this.unit.string : '',
		}
	},

	// renvoie la forme normale dans le format interne
	//  pour avoir la forme normale dans le même format que les autres expressions,
	//  il faut utiliser l'attribut .node
	get normal() {
		if (!this._normal) this._normal = normalize(this)
		return this._normal
	},

	// substituee les symboles
	// certains symboles (pi, ..) sont résevés à des constantes
	substitute(this: Expression, values: Record<string, string> = {}) {
		this.root.substitutionMap = { ...this.root.substitutionMap, ...values }
		return substitute(this, values)
	},

	matchTemplate(this: Expression, t: Expression) {
		let n: number
		let integerPart: number
		let decimalPart: number

		function checkChildren(e, t) {
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

		function checkLimits(n, min, max) {
			return n >= min && n <= max
		}

		switch (t.type) {
			case TYPE_NUMBER:
				return this.isNumber() && this.value.equals(t.value)

			case TYPE_HOLE:
				return this.isHole()

			case TYPE_SYMBOL:
				return this.isSymbol() && this.letter === t.letter

			case TYPE_TEMPLATE:
				switch (t.nature) {
					case '$e':
					case '$ep':
					case '$ei':
						if (
							(t.signed && (this.isOpposite() || this.isPositive())) ||
							(t.relative && this.isOpposite())
						)
							return this.first.matchTemplate(
								template({ nature: t.nature, children: t.children }),
							)
						if (
							!t.children[1].isHole() &&
							!checkDigitsNumber(
								this.value.toNumber(),
								!t.children[0].isHole() ? t.children[0].value.toNumber() : 0,
								t.children[1].value.toNumber(),
							)
						) {
							return false
						}
						if (
							!t.children[2].isHole() &&
							!checkLimits(
								this.value.toNumber(),
								t.children[2].value.toNumber(),
								t.children[3].value.toNumber(),
							)
						) {
							return false
						}
						if (t.nature === '$e') return this.isInt()
						if (t.nature === '$ep') return this.isEven()
						if (t.nature === '$ei') return this.isOdd()
						break

					case '$d':
						if (t.relative && this.isOpposite())
							return this.first.matchTemplate(t)
						if (!this.isNumber()) return false

						if (this.isInt()) {
							// TODO: A quoi sert intgerPart si on retourne false ?
							// integerPart = this.value.trunc()
							return false
						} else {
							const [integerPartString, decimalPartString] = this.value
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
									t.children[0].value.toNumber(),
									t.children[0].value.toNumber(),
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
									t.children[1].value.toNumber(),
									t.children[1].value.toNumber(),
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
				break
			default:
				return (
					t.type === this.type &&
					t.length === this.length &&
					checkChildren(this, t)
				)
		}
	},

	addParent(this: Expression, e: Expression) {
		const node: Expression = Object.create(pNode)
		Object.assign(node, { ...this, parent: e })
		if (node.children) {
			node.children.forEach((child) => {
				child.parent = node
			})
		}
		return node
	},
}

/* 
Création de la représentation intermédiaire de l'expresssion mathématique (AST)
La forme normale utilise une forme propre.
 */

export function createNode(params) {
	const node: Expression = Object.create(pNode)
	Object.assign(node, params)

	//  on associe le père à chaque fils
	if (node.children) {
		node.children = node.children.map((c) => c.addParent(node))
	}

	if (node.exclude) {
		for (const e of node.exclude) {
			e.parent = node
		}
	}

	if (node.excludeCommonDividersWith) {
		for (const e of node.excludeCommonDividersWith) {
			e.parent = node
		}
	}

	return node
}

// export const one = number(1)
// export const zero = number(0)

export function sum(children: Expression[]) {
	return createNode({ type: TYPE_SUM, children })
}
export function difference(children: Expression[]) {
	return createNode({ type: TYPE_DIFFERENCE, children })
}
export function division(children: Expression[]) {
	return createNode({ type: TYPE_DIVISION, children })
}
export function product(children: Expression[], type = TYPE_PRODUCT) {
	return createNode({ type, children })
}
export function quotient(children: Expression[]) {
	return createNode({ type: TYPE_QUOTIENT, children })
}
export function power(children: Expression[]) {
	return createNode({ type: TYPE_POWER, children })
}
export function opposite(children: Expression[]) {
	return createNode({ type: TYPE_OPPOSITE, children })
}
export function positive(children: Expression[]) {
	return createNode({ type: TYPE_POSITIVE, children })
}
export function bracket(children: Expression[]) {
	return createNode({ type: TYPE_BRACKET, children })
}
export function radical(children: Expression[]) {
	return createNode({ type: TYPE_RADICAL, children })
}

export function cos(children: Expression[]) {
	return createNode({ type: TYPE_COS, children })
}

export function sin(children: Expression[]) {
	return createNode({ type: TYPE_SIN, children })
}

export function tan(children: Expression[]) {
	return createNode({ type: TYPE_TAN, children })
}

export function ln(children: Expression[]) {
	return createNode({ type: TYPE_LN, children })
}

export function log(children: Expression[]) {
	return createNode({ type: TYPE_LOG, children })
}

export function exp(children: Expression[]) {
	return createNode({ type: TYPE_EXP, children })
}

export function pgcd(children: Expression[]) {
	return createNode({ type: TYPE_GCD, children })
}

export function mod(children: Expression[]) {
	return createNode({ type: TYPE_MOD, children })
}

export function floor(children: Expression[]) {
	return createNode({ type: TYPE_FLOOR, children })
}

export function abs(children: Expression[]) {
	return createNode({ type: TYPE_ABS, children })
}

export function min(children: Expression[]) {
	return createNode({ type: TYPE_MIN, children })
}

export function minPreserve(children: Expression[]) {
	return createNode({ type: TYPE_MINP, children })
}

export function max(children: Expression[]) {
	return createNode({ type: TYPE_MAX, children })
}

export function maxPreserve(children: Expression[]) {
	return createNode({ type: TYPE_MAXP, children })
}

export function percentage(children: Expression[]) {
	return createNode({ type: TYPE_PERCENTAGE, children })
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
	})
}
export function boolean(value: boolean) {
	return createNode({
		type: TYPE_BOOLEAN,
		boolvalue: value,
		value: value ? 1 : 0,
	})
}
export function symbol(letter: string) {
	return createNode({ type: TYPE_SYMBOL, letter })
}
export function segmentLength(begin: string, end: string) {
	return createNode({ type: TYPE_SEGMENT_LENGTH, begin, end })
}
export function notdefined(error: string, message: string, input: string) {
	return createNode({ type: TYPE_ERROR, error, message, input })
}
export function hole() {
	return createNode({ type: TYPE_HOLE })
}

export function template(params) {
	return createNode({ type: TYPE_TEMPLATE, ...params })
}

export function relations(ops: string[], children: Expression[]) {
	return createNode({ type: TYPE_RELATIONS, ops, children })
}
export function equality(children: Expression[]) {
	return createNode({ type: TYPE_EQUALITY, children })
}

export function unequality(children: Expression[]) {
	return createNode({ type: TYPE_UNEQUALITY, children })
}

export function inequality(children: Expression[], relation) {
	return createNode({ type: relation, children })
}

export function time(children: Expression[]) {
	return createNode({ type: TYPE_TIME, children })
}

export function identifier(name: string) {
	return createNode({ type: TYPE_IDENTIFIER, name })
}

export function limit(sign: string, children: Expression[]) {
	return createNode({ type: TYPE_LIMIT, sign, children })
}
