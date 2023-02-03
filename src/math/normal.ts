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
	TYPE_SUM,
	TYPE_SYMBOL,
	TYPE_PERCENTAGE,
	TYPE_COS,
	TYPE_SIN,
	TYPE_TAN,
	TYPE_LN,
	TYPE_LOG,
	TYPE_EXP,
	TYPE_GCD,
	TYPE_EQUALITY,
	TYPE_INEQUALITY_MOREOREQUAL,
	TYPE_INEQUALITY_MORE,
	TYPE_INEQUALITY_LESS,
	TYPE_INEQUALITY_LESSOREQUAL,
	TYPE_UNEQUALITY,
	TYPE_MOD,
	TYPE_FLOOR,
	TYPE_ABS,
	TYPE_RADICAL,
	TYPE_BOOLEAN,
	TYPE_MIN,
	TYPE_MAX,
	TYPE_TIME,
	TYPE_MINP,
	TYPE_MAXP,
	TYPE_RELATIONS,
	TYPE_IDENTIFIER,
	TYPE_LIMIT,
	Expression,
	Nlist,
	NlistElements,
	Normal,
	ToNodeArg,
	isNlist,
	TYPE_NSUM,
	NlistElement,
	TYPE_NORMAL,
	TYPE_NPRODUCT,
	ToStringArg,
} from './types'

import { boolean, radical, createNode, number, symbol } from './node'

import fraction from './fraction'
import { math } from './math'
import {
	binarySearchCmp,
	gcd,
	pgcd,
	primeFactors,
	RadicalReduction,
} from '../utils/utils'
import compare from './compare'
import { unit } from './unit'
import Decimal from 'decimal.js'

/* 
Les formes normales servent à déterminer si deux expressions sont équivalentes.
Les formes normales sont vues comme des fractions rationnelles.
Le numérateur et le dénominateur doivent être développées et réduits. Les fractions et racines doivent être simplifiées.
Les fonctions numériques doivent être évaluées à une forme exacte.
Les unités sont converties à l'unité de base.
*/

const defaultsToNode: ToNodeArg = { isUnit: false, formatTime: false }

const pNormal = {
	isZero(this: Normal) {
		return this.n.isZero()
	},

	isInt(this: Normal) {
		return this.node.isInt()
	},

	isOne(this: Normal) {
		return this.node.isOne()
	},

	isProduct(this: Normal) {
		return this.node.isProduct()
	},

	isPower(this: Normal) {
		return this.node.isPower()
	},

	isDivision(this: Normal) {
		return this.node.isDivision()
	},

	isQuotient(this: Normal) {
		return this.node.isQuotient()
	},

	isOpposite(this: Normal) {
		return this.node.isOpposite()
	},

	isMinusOne(this: Normal) {
		return this.node.isMinusOne()
	},

	isNumeric(this: Normal) {
		return this.node.isNumeric()
	},

	isDuration(this: Normal) {
		return !!this.unit && this.unit.isConvertibleTo(unit('s').normal)
	},
	isLength(this: Normal) {
		return !!this.unit && this.unit.isConvertibleTo(unit('m').normal)
	},
	isMass(this: Normal) {
		return !!this.unit && this.unit.isConvertibleTo(unit('g').normal)
	},

	// test if two units are the same type
	isConvertibleTo(this: Normal, u: Normal) {
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

	isSameQuantityType(this: Normal, e: Normal) {
		return (
			(!this.unit && !e.unit) ||
			(!!this.unit && !!e.unit && this.unit.isConvertibleTo(e.unit))
		)
	},

	getCoefTo(this: Normal, u: Normal) {
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
		function lookForPGCDinSum(s: Nlist) {
			let n: Decimal

			s.children.forEach((term) => {
				const coef = term[0]
				let p: Decimal
				if (isNlist(coef)) {
					p = lookForPGCDinSum(coef)
				} else {
					p = coef.isOpposite() ? coef.first.value : coef.value
				}
				n = n ? pgcd([n, p]) : p
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
					elmt = coef.isOpposite()
						? [number(coef.first.value.div(p)).oppose(), base]
						: [number(coef.value.div(p)), base]

					// return coef.div(number(p)).eval()
				}
				return elmt
			})
			return nSum(terms)
		}

		const n_pgcd = lookForPGCDinSum(this.n)
		const d_pgcd = lookForPGCDinSum(this.d)

		const p = pgcd([n_pgcd, d_pgcd])
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

	add(this: Normal, e: Normal) {
		if (!this.isSameQuantityType(e)) {
			throw new Error("Erreur d'unité")
		}

		return normal(
			this.n.mult(e.d).add(e.n.mult(this.d)),
			this.d.mult(e.d),
			this.unit,
		).reduce()
	},

	sub(this: Normal, e: Normal) {
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

	mult(this: Normal, e: Normal) {
		let unit: Normal
		if (this.unit && e.unit) unit = this.unit.mult(e.unit)
		else if (this.unit) unit = this.unit
		else unit = e.unit

		if (unit && unit.string === '1') unit = null
		return normal(this.n.mult(e.n), e.d.mult(this.d), unit).reduce()
	},

	div(this: Normal, e: Normal) {
		// TODO: prendre en compte le cas de la division par 0
		return this.mult(e.invert())
	},

	pow(this: Normal, e: Normal) {
		if (e.isZero()) return normOne(this.unit)
		if (e.isOne()) return this
		if (this.isZero()) return this
		if (this.isOne()) return this

		let result: Normal
		if (e.isInt()) {
			for (let i = 1; i < e.node.value.toNumber(); i++) {
				result = (i === 1 ? this : result).mult(this)
			}
		} else if (e.isMinusOne()) {
			result = this.invert()
		} else if (e.isOpposite() && e.node.first.isInt()) {
			const n = e.node.first.value.toNumber()
			for (let i = 1; i < n; i++) {
				result = (i === 1 ? this : result).mult(this)
			}
			result = result.invert()
		} else if (this.isProduct()) {
			const factors = this.node.factors.map((factor) => factor.normal)
			result = factors.shift().pow(e)
			factors.forEach((factor) => {
				result = result.mult(factor.pow(e))
			})
		} else if (this.isQuotient() || this.isDivision()) {
			result = this.n.node.normal.pow(e).div(this.d.node.normal.pow(e))
		} else if (this.isPower()) {
			// const exp= fraction(this.node.last.string)
			const exp = this.node.last.mult(e.node).eval()
			result = this.node.first.normal.pow(exp.normal)
		} else if (e.equalsTo(number(0.5).normal) && this.node.isInt()) {
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
			e.isOpposite() &&
			e.node.first.equals(number(0.5)) &&
			this.node.isInt() &&
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

	oppose(this: Normal) {
		return normal(this.n.oppose(), this.d, this.unit)
	},

	invert(this: Normal) {
		const unit = this.unit ? this.unit.invert() : null
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

	compareTo(this: Normal, e: Normal) {
		return compare(this, e)
	},

	get node() {
		return (this as Normal).toNode()
	},

	//  si la forme représente une fraction numérique, celle-ci a été simplifiée et le signe
	// est au numérateur
	toNode(this: Normal, { isUnit, formatTime }: ToNodeArg = defaultsToNode) {
		let e: Expression
		let n = this.n.node
		const d = this.d.node

		if (d.isOne()) {
			e = n
		} else {
			let positive = true
			if (n.isOpposite()) {
				positive = false
				n = n.first
			}

			e = n.frac(d)
			if (!positive) e = e.oppose()
		}

		if (this.unit) {
			if (formatTime) {
				let s = ''
				let ms = e.value.toNumber()
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
		return this.node.string
	},

	equalsTo(this: Normal, e: Normal) {
		if (typeof e === 'string' || typeof e === 'number') e = math(e).normal
		return this.n.mult(e.d).equalsTo(this.d.mult(e.n))
	},
}

function normal(n: Nlist, d: Nlist, unit?: Normal): Normal {
	const o = Object.create(pNormal)
	if (!d) d = nSumOne()
	Object.assign(o, {
		n,
		d,
		unit,
		type: TYPE_NORMAL,
	})
	return o
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
 * one et zero sont des expressions représentant les nombres 1 et 0
 *
 * nSum([ [ nSum([[zero, one]]), nProduct() ] ])
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

const pNlist = {
	[Symbol.iterator]() {
		return this.children[Symbol.iterator]()
	},

	// on compare deux listes de même type (NSum NProduct)
	compareTo(this: Nlist, l: Nlist) {
		return compare(this, l)
	},

	// TODO: c'est pour des listes ou des formes normales ?
	// TODO: A revoir
	equalsTo(this: Nlist, e) {
		if (typeof e === 'string') e = math(e).normal
		// avec ou sans l'unité ?
		return this.string === e.string
	},

	// fusionne deux listes de même type
	merge(this: Nlist, l: Nlist) {
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
								return e.compareTo(f as Expression)
							}
					  })
					: ~0
			if (pos < 0) {
				// il n'y a pas de base identique
				result.splice(~pos, 0, child)
			} else {
				// on doit fusionner les deux éléments qui ont la même base
				const coef1 = result[pos][0]

				let coef: Nlist | Expression
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
			e: [Nlist | Expression, Nlist | Expression],
		): [Nlist | Expression, Nlist | Expression] {
			const coef = e[0]
			const base = e[1]
			let newcoef: Nlist | Expression
			if (coef.isZero()) return e
			if (isNlist(coef)) {
				newcoef = coef.oppose()
			} else {
				newcoef = coef.isOpposite() ? coef.first : coef.oppose()
			}
			return [newcoef, base]
		}

		return this.createList(this.type, this.children.map(f))
	},

	get string() {
		return (this as Nlist).toString()
	},

	toString(params?: ToStringArg) {
		return this.node.toString(params)
	},

	isOne(this: Nlist) {
		return this.node.isOne()
	},
	isZero(this: Nlist) {
		return this.node.isZero()
	},
	isMinusOne(this: Nlist) {
		return this.node.isMinusOne()
	},
	isInt(this: Nlist) {
		return this.node.isInt()
	},
	isOpposite(this: Nlist) {
		return this.node.isOpposite()
	},
	get first() {
		return (this as Nlist).children[0]
	},
	get last() {
		return (this as Nlist).children[this.children.length - 1]
	},
	get length() {
		return (this as Nlist).children.length
	},
	get node() {
		return (this as Nlist).toNode()
	},

	toNode(this: Nlist) {
		const nProductElementToNode = function ([coef, base]: [
			Expression,
			Expression,
		]) {
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

		let e: Expression
		if (this.type === TYPE_NPRODUCT) {
			for (let i = 0; i < this.children.length; i++) {
				const coef = this.children[i][0]
				const base = this.children[i][1]
				let factor = nProductElementToNode([
					coef as Expression,
					base as Expression,
				])

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
			for (let i = 0; i < this.children.length; i++) {
				const child = this.children[i]
				let coef = isNlist(child[0]) ? child[0].node : child[0]
				const base = (child[1] as Nlist).node
				let term: Expression
				let minus = false
				if (base.isOne()) {
					term = coef
				} else if (coef.isOne()) {
					term = base
				} else if (coef.isMinusOne()) {
					minus = true
					term = base
				} else if (coef.isOpposite()) {
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

	mult(this: Nlist, l: Nlist) {
		let t: NlistElements = []
		if (this.type === TYPE_NPRODUCT) {
			t = [].concat(this.merge(l).children)
			t = t.filter((e) => !e[1].isOne())
			return nProduct(t)
		}
		//  NSum
		else {
			// on boucle d'abord sur les termes des deux sommes que l'on doit multiplier deux à deux
			for (const term1 of this) {
				for (const term2 of l) {
					const coefs: [Expression, Nlist][] = []
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
							let coef = number(Math.abs(newcoefvalue))
							let base = (basecoef1 as Nlist).mult(basecoef2 as Nlist)
							if (base.node.isNumber() && !base.node.isOne()) {
								coef = number(coef.value.mul(base.node.value))
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

	add(this: Nlist, l: Nlist) {
		return this.merge(l)
	},

	sub(this: Nlist, l: Nlist) {
		return this.merge(l.oppose())
	},

	oppose(this: Nlist) {
		return this.symmetrize()
	},

	invert(this: Nlist) {
		return this.symmetrize()
	},

	div(this: Nlist, l: Nlist) {
		return this.frac(l)
	},

	frac(this: Nlist, denom: Nlist) {
		return this.mult(denom.invert())
	},
}

/**
 * Constantes utilisées
 */
const baseOne = () => nProduct([[number(1), number(1)]])

function simpleCoef(coef: Expression) {
	return nSum([[coef, baseOne()]])
}

const coefOne = () => simpleCoef(number(1))

const coefZero = () => simpleCoef(number(0))

const nSumOne = () => nSum([[coefOne(), baseOne()]])

const nSumZero = () => nSum([[coefZero(), baseOne()]])

// forme normale du nombre 1 - singleton
const normOne = (unit: Normal) => normal(nSumOne(), nSumOne(), unit)

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

function createBase(b: Expression, e?: Expression) {
	return nProduct([[e || number(1), b]])
}

export default function normalize(node: Expression) {
	let d: Nlist // dénominateur de la partie normale
	let n: Nlist // numérateur de la partie normale
	let e: Normal // forme normale retournée

	// pose des problèmes de prototypes
	// const { unit, ...others } = node // ? est-ce qu'on se débarrasse de la forme normale?
	// others.proto

	switch (node.type) {
		case TYPE_LIMIT:
			n = nSum([[coefOne(), createBase(node)]])
			d = nSumOne()
			break
		case TYPE_TIME: {
			const children = node.children.map((c) => c.normal)

			e = children.pop()
			while (children.length) {
				e = e.add(children.pop())
			}
			break
		}

		case TYPE_BOOLEAN:
			n = nSum([[coefOne(), createBase(node)]])
			d = nSumOne()
			break

		case TYPE_NUMBER:
			if (node.isInt()) {
				n = nSum([[simpleCoef(number(node.value)), baseOne()]])
				d = nSumOne()
			} else {
				// on convertit le float en fraction
				e = math(fraction(node).toString()).normal
			}

			break

		case TYPE_POWER:
			e = node.first.normal.pow(node.last.normal)
			break

		case TYPE_RADICAL: {
			e = node.first.normal.pow(number(0.5).normal)
			break
		}
		case TYPE_COS: {
			const childNormal = node.children[0].normal
			const child = childNormal.node

			if (childNormal.equalsTo(0) || childNormal.equalsTo('2pi')) {
				e = math(1).normal
			} else if (childNormal.equalsTo('pi') || childNormal.equalsTo('-pi')) {
				e = math(-1).normal
			} else if (
				childNormal.equalsTo('pi/2') ||
				childNormal.equalsTo('-pi/2')
			) {
				e = math(0).normal
			} else if (
				childNormal.equalsTo('pi/3') ||
				childNormal.equalsTo('-pi/3')
			) {
				e = math(0.5).normal
			} else if (
				childNormal.equalsTo('2pi/3') ||
				childNormal.equalsTo('-2pi/3')
			) {
				e = math(-0.5).normal
			} else if (
				childNormal.equalsTo('pi/4') ||
				childNormal.equalsTo('-pi/4')
			) {
				e = math('sqrt(2)/2').normal
			} else if (
				childNormal.equalsTo('3pi/4') ||
				childNormal.equalsTo('-3pi/4')
			) {
				e = math('-sqrt(2)/2').normal
			} else if (
				childNormal.equalsTo('pi/6') ||
				childNormal.equalsTo('-pi/6')
			) {
				e = math('sqrt(3)/2').normal
			} else if (
				childNormal.equalsTo('5pi/6') ||
				childNormal.equalsTo('-5pi/6')
			) {
				e = math('-sqrt(3)/2').normal
			} else {
				const base = createNode({ type: node.type, children: [child] })
				d = nSumOne()
				if (child.isNumeric()) {
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
				} else {
					n = nSum([[coefOne(), createBase(base)]])
				}
			}

			break
		}

		case TYPE_SIN: {
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
			} else if (
				childNormal.equalsTo('pi/6') ||
				childNormal.equalsTo('5pi/6')
			) {
				e = math(0.5).normal
			} else if (
				childNormal.equalsTo('-pi/6') ||
				childNormal.equalsTo('-5pi/6')
			) {
				e = math(-0.5).normal
			} else if (
				childNormal.equalsTo('pi/4') ||
				childNormal.equalsTo('3pi/4')
			) {
				e = math('sqrt(2)/2').normal
			} else if (
				childNormal.equalsTo('-pi/4') ||
				childNormal.equalsTo('-3pi/4')
			) {
				e = math('-sqrt(2)/2').normal
			} else if (
				childNormal.equalsTo('pi/3') ||
				childNormal.equalsTo('2pi/3')
			) {
				e = math('sqrt(3)/2').normal
			} else if (
				childNormal.equalsTo('-pi/3') ||
				childNormal.equalsTo('-2pi/3')
			) {
				e = math('-sqrt(3)/2').normal
			} else {
				const base = createNode({ type: node.type, children: [child] })
				d = nSumOne()
				if (child.isNumeric()) {
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
				} else {
					n = nSum([[coefOne(), createBase(base)]])
				}
			}

			break
		}
		case TYPE_TAN: {
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
				const base = createNode({ type: node.type, children: [child] })
				d = nSumOne()
				if (child.isNumeric()) {
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
				} else {
					n = nSum([[coefOne(), createBase(base)]])
				}
			}
			break
		}

		case TYPE_LN: {
			const childNormal = node.children[0].normal
			const child = childNormal.node

			if (child.type === TYPE_EXP) {
				e = child.first.normal
			} else if (child.type === TYPE_POWER) {
				e = child.last.mult(child.first.ln()).normal
			} else if (childNormal.equalsTo(1)) {
				e = math(0).normal
			} else if (childNormal.equalsTo('e')) {
				e = math(1).normal
			} else if (child.isInt()) {
				const N = child.value.toNumber()
				const factors = primeFactors(N)
				if (factors.length === 1 && factors[0][1] === 1) {
					const base = createNode({
						type: node.type,
						children: [child],
					})
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
					d = nSumOne()
				} else {
					e = math(0).normal
					factors.forEach((factor) => {
						const [a, k] = factor
						const term = math(`${k}*ln(${a})`).normal
						e = e.add(term)
					})
				}
			} else {
				const base = createNode({ type: node.type, children: [child] })
				d = nSumOne()
				if (child.isNumeric()) {
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
				} else {
					n = nSum([[coefOne(), createBase(base)]])
				}
			}
			break
		}
		case TYPE_EXP: {
			const childNormal = node.children[0].normal
			const child = childNormal.node

			if (child.isProduct() && child.children.some((c) => c.isLn())) {
				if (child.first.isLn()) {
					e = child.first.first.pow(child.last).normal
				} else {
					e = child.last.first.pow(child.first).normal
				}
			} else if (child.isLn()) {
				e = child.first.normal
			} else if (childNormal.equalsTo(0)) {
				e = math(1).normal
			} else {
				const base = createNode({ type: node.type, children: [child] })
				d = nSumOne()
				if (child.isNumeric()) {
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
				} else {
					n = nSum([[coefOne(), createBase(base)]])
				}
			}
			break
		}
		case TYPE_ABS: {
			const childNormal = node.children[0].normal
			const child = childNormal.node
			if (child.isNumeric()) {
				if (child.isLowerThan(0)) {
					e = child.mult(-1).normal
				} else {
					e = childNormal
				}
			} else {
				const base = createNode({ type: node.type, children: [child] })
				d = nSumOne()
				n = nSum([[coefOne(), createBase(base)]])
			}
			break
		}
		case TYPE_LOG: {
			const childNormal = node.children[0].normal
			const child = childNormal.node

			if (child.type === TYPE_POWER) {
				e = child.last.mult(child.first.log()).normal
			} else if (childNormal.equalsTo(1)) {
				e = math(0).normal
			} else if (childNormal.equalsTo(10)) {
				e = math(1).normal
			} else if (child.isInt()) {
				const N = child.value.toNumber()
				const factors = primeFactors(N)
				if (factors.length === 1 && factors[0][1] === 1) {
					const base = createNode({
						type: node.type,
						children: [child],
					})
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
					d = nSumOne()
				} else {
					e = math(0).normal
					factors.forEach((factor) => {
						const [a, k] = factor
						const term = math(`${k}*log(${a})`).normal
						e = e.add(term)
					})
				}
			} else {
				const base = createNode({ type: node.type, children: [child] })
				d = nSumOne()
				if (child.isNumeric()) {
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
				} else {
					n = nSum([[coefOne(), createBase(base)]])
				}
			}
			break
		}
		case TYPE_FLOOR: {
			const childNormal = node.children[0].normal
			const child = childNormal.node
			if (child.isNumeric()) {
				e = number(child.eval({ decimal: true }).value.floor()).normal
			} else {
				const base = createNode({ type: node.type, children: [child] })
				d = nSumOne()
				n = nSum([[coefOne(), createBase(base)]])
			}
			break
		}

		case TYPE_GCD: {
			const children = node.children.map((c) => c.normal.node)
			let a = children[0]
			let b = children[1]
			if (node.isNumeric) {
				if (a.isOpposite() && a.first.isInt()) {
					a = a.first
				}
				if (b.isOpposite() && b.first.isInt()) {
					b = b.first
				}
				if (a.isInt() && b.isInt()) {
					e = number(gcd(a.value.toNumber(), b.value.toNumber())).normal
				} else {
					const base = createNode({ type: node.type, children })
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
					d = nSumOne()
				}
			} else {
				const base = createNode({ type: node.type, children })
				n = nSum([[coefOne(), createBase(base)]])
				d = nSumOne()
			}
			break
		}

		case TYPE_MOD: {
			const children = node.children.map((c) => c.normal.node)
			const a = children[0]
			const b = children[1]
			if (node.isNumeric()) {
				if (
					(a.isInt() || (a.isOpposite() && a.first.isInt())) &&
					(b.isInt() || (b.isOpposite() && b.first.isInt()))
				) {
					e = number(new Decimal(a.string).mod(new Decimal(b.string))).normal
				} else {
					const base = createNode({ type: node.type, children })
					const coef = nSum([[number(1), createBase(base)]])
					n = nSum([[coef, baseOne()]])
					d = nSumOne()
				}
			} else {
				const base = createNode({ type: node.type, children })
				n = nSum([[coefOne(), createBase(base)]])
				d = nSumOne()
			}
			break
		}

		case TYPE_MIN:
		case TYPE_MINP: {
			const children = node.children.map((c) => c.normal.node)
			const a = children[0]
			const b = children[1]
			if (node.isNumeric()) {
				e = a.isLowerThan(b) ? a.normal : b.normal
			} else {
				const base = createNode({ type: node.type, children })
				n = nSum([[coefOne(), createBase(base)]])
				d = nSumOne()
			}
			break
		}

		case TYPE_MAX:
		case TYPE_MAXP: {
			const children = node.children.map((c) => c.normal.node)
			const a = children[0]
			const b = children[1]

			if (node.isNumeric()) {
				e = a.isGreaterThan(b) ? a.normal : b.normal
			} else {
				const base = createNode({ type: node.type, children })
				n = nSum([[coefOne(), createBase(base)]])
				d = nSumOne()
			}
			break
		}

		case TYPE_PERCENTAGE:
			e = node.first.div(number(100)).normal
			break

		case TYPE_HOLE:
			n = nSum([[coefOne(), createBase(node)]])
			d = nSumOne()
			break

		case TYPE_IDENTIFIER:
			n = nSum([[coefOne(), createBase(node)]])
			d = nSumOne()
			break

		case TYPE_SYMBOL:
			n = nSum([
				[coefOne(), createBase(symbol(node.toString({ displayUnit: false })))],
			])
			d = nSumOne()
			break

		case TYPE_BRACKET:
		case TYPE_POSITIVE:
			e = normalize(node.first)
			break

		case TYPE_OPPOSITE:
			e = node.first.normal
			if (!e.node.isZero()) e = e.oppose() // pour ne pas avoir un -0
			break

		case TYPE_SUM:
			for (let i = 0; i < node.children.length; i++) {
				if (i === 0) {
					e = node.first.normal
				} else {
					e = e.add(node.children[i].normal)
				}
			}
			break

		case TYPE_PRODUCT:
		case TYPE_PRODUCT_IMPLICIT:
		case TYPE_PRODUCT_POINT:
			for (let i = 0; i < node.children.length; i++) {
				if (i === 0) {
					e = node.first.normal
				} else {
					e = e.mult(node.children[i].normal)
				}
			}
			break

		case TYPE_DIFFERENCE:
			e = node.first.normal.sub(node.last.normal)
			break

		case TYPE_DIVISION:
		case TYPE_QUOTIENT:
			e = node.first.normal.div(node.last.normal)
			break

		case TYPE_RELATIONS: {
			let bool = true
			// console.log('node', node)
			node.ops.forEach((op, i) => {
				const test = math(node.children[i].string + op + node.children[i + 1])
				bool = bool && test.eval().boolvalue
			})
			e = boolean(bool).normal
			break
		}

		case TYPE_UNEQUALITY:
			e = boolean(!node.first.eval().equals(node.last.eval())).normal
			break

		case TYPE_EQUALITY:
			e = boolean(node.first.eval().equals(node.last.eval())).normal
			break

		case TYPE_INEQUALITY_LESS:
			e = boolean(node.first.eval().isLowerThan(node.last.eval())).normal
			break

		case TYPE_INEQUALITY_MORE:
			e = boolean(node.first.eval().isGreaterThan(node.last.eval())).normal
			break

		case TYPE_INEQUALITY_LESSOREQUAL:
			e = boolean(node.first.eval().isLowerOrEqual(node.last.eval())).normal
			break

		case TYPE_INEQUALITY_MOREOREQUAL:
			e = boolean(node.first.eval().isGreaterOrEqual(node.last.eval())).normal
			break

		// TODO: et les TEMPLATES?

		default:
		// console.log('!!!normalizing default !!!', node, node.string)
	}

	if (!e) {
		e = normal(n, d)
	}
	if (node.unit) {
		// TODO : et quand les opérandes ont aussi une unité ?
		// console.log('node', node)
		// console.log('node.unit', node.unit)

		let u = node.unit.normal
		//  on récupère le coefficeient de l'unité et on l'applique à la forme normale
		const coefN = nSum([[u.n.first[0], baseOne()]])
		const coefD = nSum([[u.d.first[0], baseOne()]])
		const coef = normal(coefN, coefD)
		const uN = nSum([[simpleCoef(number(1)), u.n.first[1]]])
		const uD = nSum([[simpleCoef(number(1)), u.d.first[1]]])
		u = normal(uN, uD)
		e = e.mult(coef)
		if (u.string === '1') u = null

		e.unit = u
	}

	return e
}
