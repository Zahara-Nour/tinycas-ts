import { math } from '../src/math/math'
import { unit } from '../src/math/node'

describe('Stringing  unit', () => {
	const t = [
		['1 m', 'm'],
		['1 m^2', 'm^2'],
		['1 m^3', 'm^3'],
		['1 m^{-3}', 'm^{-3}'],
		['1 L', 'L'],
	]

	test.each(t)('Stringing %s %s', (e, u) => {
		expect(math(e).unit?.string).toBe(u)
	})
})

describe('Stringing  expression withunit', () => {
	const t = [
		'0 m',
		'1 m',
		'1/2 m',
		'1/2200 m^2',
		'1 mm',
		'1 m.m',
		'1 km^2',
		'1 km^{-2}',
		'1 m^2.m^2',
		'1 m^4.m^(-2)',
		'1 m^(-1).m^(-1)',
		'1 kg.km^(-2)',
	]

	test.each(t)('Stringing %s', (e) => {
		expect(math(e).string).toBe(e)
	})
})

describe('Testing duration units', () => {
	const t = [
		['1 ans', true],
		['1 mois', true],
		['1 semaines', true],
		['1 jours', true],
		['1 h', true],
		['1 min', true],
		['1 s', true],
		['1 ms', true],
		['1 m', false],
		['1 g', false],
		['0 s', true],
		['1', false],
	]

	test.each(t)('Testing if %s is a duration or not', (e, b) => {
		expect(math(e as string).isDuration()).toBe(b)
	})
})

describe('Testing quantity types', () => {
	const t = [
		['1', '1', true],
		['1 ans', '1 s', true],
		['1 h 1 min', '1 s', true],
		['1', '1 s', false],
		['1g', '1 s', false],
	]

	test.each(t)('Testing if %s ans %s are same quantity type', (e, f, b) => {
		expect(math(e as string).isSameQuantityType(math(f as string))).toBe(b)
	})
})

describe('Testing equality with units', () => {
	const t = [['1 m', '10 dm']]

	test.each(t)('Testing equality between %s and %s', (e, f) => {
		expect(math(e).equals(math(f))).toBeTruthy()
	})
})

describe('Testing normalizing unit', () => {
	const t = [
		['0 m', '0 m'],
		['1 m', '1 m'],
		['1 km', '1000 m'],
		['1 mm', '{1/1000} m'],
		['1 km', '1000 m'],
		['2 km', '2000 m'],
		['0.001 km', '1 m'],
		['1 mm', '{1/1000} m'],
		['{1/2} mm', '{1/2000} m'],
		['1 m.m', '1 m^2'],
		['1 m^2.m^2', '1 m^4'],
		['1 m^4.m^{-2}', '1 m^2'],
		['1 m^2.m^{-2}', '1'],
		['1 m^{-1}.m^{-1}', '1 m^{-2}'],
		['1 km^2', '1000000 m^2'],
		['1 km^{-2}', '{1/1000000} m^{-2}'],
		['1 kg.km^{-2}', '{1/1000} g.m^{-2}'],
		['1 k€', '1000 €'],
		['1 Qr', '1 Qr'],
		['1 hL', '100 L'],
	]

	test.each(t)('normalizing %s', (e, expected) => {
		// console.log('normal', math(e).normal.node)
		expect(math(e).normal.string).toBe(expected)
	})
})

describe('Testing unit isVolume', () => {
	const t = [
		// ['mm^3'],
		// ['cm^3'],
		// ['dm^3'],
		// ['m^3'],
		// ['dam^3'],
		// ['hm^3'],
		// ['km^3'],
		['mL'],
		['cL'],
		['dL'],
		['L'],
		['daL'],
		['hL'],
		['kL'],
	]

	test.each(t)('Is %s a volume ?', (u) => {
		expect(unit(u).isVolume()).toBeTruthy()
	})

	const t2 = [['mm'], ['g'], ['h']]

	test.each(t2)('Is %s a volume ?', (u) => {
		expect(unit(u).isVolume()).toBeFalsy()
	})
})

describe('Testing expression isVolume', () => {
	const t = [
		['1 mm^3'],
		['1 cm^3'],
		['1 dm^3'],
		['1 m^3'],
		['1 dam^3'],
		['1 hm^3'],
		['1 km^3'],
	]

	test.each(t)('Is %s a volume ?', (e) => {
		expect(math(e).isVolume()).toBeTruthy()
	})

	const t2 = [['1 mm'], ['1 g'], ['1 h']]

	test.each(t2)('Is %s a volume ?', (e) => {
		expect(math(e).isVolume()).toBeFalsy()
	})
})

describe('Testing isSameQuantityType', () => {
	const t = [
		['1 mm^3', '1L'],
		['1 cm^3', '1L'],
		['1 dm^3', '1L'],
		['1 m^3', '1L'],
		['1 dam^3', '1L'],
		['1 hm^3', '1L'],
		['1 km^3', '1L'],
	]

	test.each(t)('Are %s ans %s the same quantity type ?', (e, f) => {
		expect(math(e).isSameQuantityType(math(f))).toBeTruthy()
	})

	const t2 = [
		['1 mm^2', '1L'],
		['1 cm', '1L'],
		['1 g', '1L'],
		['1 h', '1L'],
	]

	test.each(t2)('Are %s ans %s the same quantity type ?', (e, f) => {
		expect(math(e).isSameQuantityType(math(f))).toBeFalsy()
	})
})

describe('Testing convertible units', () => {
	const t = [
		['km', 'km'],
		['km', 'm'],
		// ['km^3', 'm^3'],
	]

	test.each(t)('Is %s convertible to %s ?', (u1, u2) => {
		expect(unit(u1).isConvertibleTo(unit(u2))).toBeTruthy()
	})

	const tests2 = [['km', 'g']]

	test.each(tests2)('Is %s convertible to %s ?', (u1, u2) => {
		expect(unit(u1).isConvertibleTo(unit(u2))).toBeFalsy()
	})
})

describe('Testing units conversions', () => {
	const t = [
		['1 km', 'm', '1000 m'],
		['3 km', 'cm', '300000 cm'],
		['4 m', 'hm', '0.04 hm'],
		['40000 m^{-2}', 'cm^{-2}', '4 cm^{-2}'],
		['4 kg.m^{-2}', 'g.m^{-2}', '4000 g.m^{-2}'],
		['4 kg.m^{-2}', 'g.dam^{-2}', '400000 g.dam^{-2}'],
		['1h', 'min', '60 min'],
		['3h30min', 'h', '3.5 h'],
		['3,5h', 'HMS', '3 h 30 min'],
		['1 an 1 jour 1 h 1 min 1s 1ms', 's', '31626061.001 s'],
		['31626061.001 s', 'HMS', '1 ans 1 jours 1 h 1 min 1 s 1 ms'],
		['1 km.s^(-2)', 'km.s^{-2}', '1 km.s^{-2}'],
		['1 km.s^{-2}', 'km.s^{-2}', '1 km.s^{-2}'],
		['1 L', 'dm^3', '1 dm^3'],
		['1 dm^3', 'L', '1 L'],
		['1 m^3', 'L', '1000 L'],
		['1 L', 'm^3', '0.001 m^3'],
	]

	test.each(t)('converting %s in %s :', (e, u, expected) => {
		expect(math(e).eval({ unit: u, decimal: true }).string).toBe(expected)
	})
})

describe('Testing evaluation of litteral expressions with units', () => {
	const t = [
		['a cm +b cm', 'a', 'b', 'b', '2', '0.04 m'],
		['(a + b ) cm', 'a', 'b', 'b', '2', '0.04 m'],
	]

	test.each(t)(
		'evaluating %s with %s as %s and %s as %s',
		(e, symbol1, value1, symbol2, value2, expected) => {
			expect(
				math(e).eval({
					values: { [symbol1]: value1, [symbol2]: value2 },
					decimal: true,
				}).string,
			).toBe(expected)
		},
	)
})

describe('Test relations evaluation with units', () => {
	const t = [
		['1 cm = 1 cm', 'true'],
		['1 cm = 2 cm', 'false'],
		['1 cm = 1 m', 'false'],
		['100 cm = 1 m', 'true'],
		['1 cm + 1 dm = 0.11 m', 'true'],
	]
	test.each(t)('is %s %s', (e1, e2) => {
		// console.log('eval', math(e1).eval().string)
		expect(math(e1).eval().string).toEqual(e2)
	})
})

describe('Testing evaluation of numerical expression with unit conversion', () => {
	const t = [
		['0 km', 'm', '0 m'],
		['1 km', 'dam', '100 dam'],
		['(1) km', 'dam', '100 dam'],
		['-1 km', 'dam', '-100 dam'],
		['-(1 km)', 'dam', '-100 dam'],
		['+1 km', 'dam', '100 dam'],
		['+(1 km)', 'dam', '100 dam'],
		['1 km- 1km', 'dam', '0 dam'],
		['1 km+ 1hm', 'dam', '110 dam'],
		['(1+1) km', 'dam', '200 dam'],
		['2 km * 3 km', 'dam^2', '60000 dam^2'],
		['2 km * 3', 'dam', '600 dam'],
		['2 km^2', 'm^2', '2000000 m^2'],
		['2000000 km^(-2)', 'm^(-2)', '2 m^(-2)'],
		['2000000 km^(-2)', 'm^(-2)', '2 m^(-2)'],
		['1 h 1 min 1 s + 1 h 1 min 1 s', 'HMS', '2 h 2 min 2 s'],
		['2*(1 h 1 min 1 s)', 'HMS', '2 h 2 min 2 s'],
		['2*(1 h 6 min)', 'h', '2.2 h'],
	]

	test.each(t)('evaluating %s in %s :', (e, u, expected) => {
		expect(math(e).eval({ unit: u, decimal: true }).string).toBe(expected)
	})
})

describe('Testing calculus with units', () => {
	const t = [
		['1 cm + 1 cm', '0.02 m'],
		['1 cm + 1 cm + 1cm', '0.03 m'],
		['2 km + 3 km', '5000 m'],
		['1 km + 1 cm', '1000.01 m'],
		['1 km * 1 cm', '10 m^2'],
		['3 * 2 cm', '0.06 m'],
		['3 cm * 2 cm', '0.0006 m^2'],
		['3 cm^2 * 2 cm^{-2}', '6'],
		['10 cm - 5 mm', '0.095 m'],
		['10 m^2 - 5 m^2', '5 m^2'],
		['10 m^(-2) - 5 m^(-2)', '5 m^{-2}'],
		['10 m^{-2} - 5 m^{-2}', '5 m^{-2}'],
		['10 m.m', '10 m^2'],
		['10 kg.m - 5 kg.m', '5000 g.m'],
		['10 kg.m^(-2) - 5 kg.m^(-2)', '5000 g.m^{-2}'],
		['10 kg.m^{-2} - 5 kg.m^{-2}', '5000 g.m^{-2}'],
		['1 h + 1 min + 1 s', '3661000 ms'],
		['1 h 1 min + 1 s', '3661000 ms'],
		['1 h 1 min 1 s', '3661000 ms'],
		['1 h 1 min 1 s + 1 h 1 min 1 s', '7322000 ms'],

		// '10 km : 100 cm': '100'
	]

	// TODO: division par 0
	test.each(t)('calculating %s', (e, expected) => {
		expect(math(e).eval({ decimal: true }).string).toBe(expected)
	})
})
