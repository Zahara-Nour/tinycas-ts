// const regex = new RegExp('^(\\(?(-?\\d+)(\\.\\d+)?\\)?)(/(-?\\d+))?$')

import Decimal from 'decimal.js'
import { CreateFractionArg, Fraction, FractionArg } from './types'
import { pgcdDecimals } from '../utils/utils'

function gcd(a: Decimal, b: Decimal) {
	return pgcdDecimals([a, b])
}

const pFraction: Fraction = {
	s: 1,
	d: new Decimal(1),
	n: new Decimal(1),
	add(this: Fraction, f: Fraction) {
		let n = this.n.mul(f.d).mul(this.s).add(this.d.mul(f.s).mul(f.n))
		const d = this.d.mul(f.d)
		const s = n.s
		n = n.abs()
		return createFraction({ n, d, s }).reduce()
	},

	sub(this: Fraction, f: Fraction) {
		const a = this.n.mul(f.d).mul(this.s)
		const b = this.d.mul(f.s).mul(f.n)
		let n = a.sub(b)

		const d = this.d.mul(f.d)
		const s = n.s

		if (s !== -1 && s !== 1) {
			console.log('sub', s, this, f, a, b, n)
		}
		n = n.abs()
		return createFraction({ n, d, s }).reduce()
	},

	mult(this: Fraction, f: Fraction) {
		const n = this.n.mul(f.n)
		const d = this.d.mul(f.d)
		const s = f.s * this.s
		return createFraction({ n, d, s }).reduce()
	},

	div(this: Fraction, f: Fraction) {
		const n = this.n.mul(f.d)
		const d = this.d.mul(f.n)
		const s = f.s * this.s
		return createFraction({ n, d, s })
	},

	reduce(this: Fraction) {
		const d = gcd(this.n, this.d)
		return createFraction({
			n: this.n.div(d),
			d: this.d.div(d),
			s: this.s,
		})
	},

	isLowerThan(this: Fraction, f: Fraction) {
		const diff = this.sub(f)
		if (diff.n.equals(0)) return false
		if (diff.s !== -1 && diff.s !== 1) {
			console.log('!!!! erreur s!!!', this, f, diff)
		}
		return diff.s === -1
	},

	isGreaterThan(this: Fraction, f: Fraction) {
		if (this.sub(f).n.equals(0)) return false
		if (this.sub(f).s !== -1 && this.sub(f).s !== 1)
			console.log('!!!! erreur s!!!', this.sub(f).s)
		return this.sub(f).s === 1
	},

	toString() {
		let str = this.s < 0 ? '-' : ''
		str += this.d.equals(1)
			? this.n.toString()
			: this.n.toString() + '/' + this.d.toString()
		// if (this.s<0) str+=')'
		return str
	},
}

function createFraction({ n, d, s }: CreateFractionArg) {
	if (n.isNegative()) console.log('!!!negative !!!')

	const f: Fraction = Object.assign(Object.create(pFraction), { n, d, s })
	return f
}

function removeCommas(num: number, denom: number) {
	let n = new Decimal(num)
	let d = new Decimal(denom)
	const s = n.s * d.s
	n = n.abs()
	d = d.abs()

	while (!n.isInteger()) {
		n = n.mul(10)
		d = d.mul(10)
	}

	while (!d.isInteger()) {
		n = n.mul(10)
		d = d.mul(10)
	}
	return { n, d, s }
}

function fraction(arg: FractionArg): Fraction {
	// conversion décimal -> fraction
	if (typeof arg === 'number' || Decimal.isDecimal(arg)) {
		const fDecimal = new Decimal(arg).toFraction()
		let n = fDecimal[0]
		const d = fDecimal[1]
		const s = n.s
		n = n.abs()
		return createFraction({ n, d, s }).reduce()
	}
	// le paramètre est une string
	else if (typeof arg === 'string') {
		arg = arg.replace(/ /g, '')
		const regex = new RegExp(
			'^([\\(\\{]?(-?\\d+)(\\.\\d+)?[\\)\\}]?)(\\/[\\(\\{]?(-?\\d+)[\\]\\}]?)?$',
		)
		const result = regex.exec(arg)
		if (result) {
			const { n, d, s } = removeCommas(
				parseFloat(result[1]),
				result[5] ? parseFloat(result[5]) : 1,
			)
			return createFraction({ n, d, s })
		} else {
			// TODO: que faire dans ce cas ?
			// console.log('parse fraction', arg, typeof arg)
			// return null
			throw new Error('fraction not recognized')
		}
	} else {
		// console.log('arg ' + arg)
		return fraction(arg.toString({ displayUnit: false }))
	}
}

export default fraction
