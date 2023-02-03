import { symbol, number } from './node'
import {
	conversionTable,
	Expression,
	Normal,
	Unit,
	TYPE_PRODUCT_POINT,
} from './types'

const TYPE_UNIT = 'type unit'

// une unité simple ou composée

const PUnit = {
	mult(u: Unit) {
		return unit(
			this.u.mult(u.u, TYPE_PRODUCT_POINT),
			this.normal.mult(u.normal),
		)
	},

	div(u: Unit) {
		return unit(this.u.div(u.u), this.normal.div(u.normal))
	},
	pow(n: Expression) {
		//  n doit être un entier relatif
		return unit(this.u.pow(n), this.normal.pow(n.normal))
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
		return this.normal.isConvertibleTo(expectedUnit.normal)
		// on compare les bases de la forme normale
	},

	getCoefTo(u: Unit): Expression {
		return this.normal.getCoefTo(u.normal).node
	},

	equalsTo(u: Unit): boolean {
		return this.normal.equalsTo(u.normal)
	},
}

/* 
ne doit être appelée à l'extérieur que pour créer une unité simple. Les unités composées sont créées par multiplication, division ou exponentiation.
*/
function unit(u: string, normal?: Normal) {
	if (!normal) {
		// c'est une unité simple
		const coef = number(baseUnits[u][0])
		const base = symbol(baseUnits[u][1])
		normal = coef.mult(base).normal
	}

	const e: Unit = Object.create(PUnit)
	Object.assign(e, {
		type: TYPE_UNIT,
		u: typeof u === 'string' ? symbol(u) : u,
		normal,
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
