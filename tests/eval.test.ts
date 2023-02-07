import { math } from '../src/math/math'

describe('Testing evaluation of numerical expression ', () => {
	const t = [
		['0', '0'],
		['1', '1'],
		['0.5', '1/2'],
		['3', '3'],
		['3+2', '5'],
		['8-3', '5'],
		['3-8', '-5'],
		['5*2', '10'],
		['15:3', '5'],
		['3^3', '27'],
		['-0', '0'],
		['-2', '-2'],
		['-(-2)', '2'],
		['3+(-2)', '1'],
		['(-3)+(-2)', '-5'],
		['(-3)+2', '-1'],
		['(-8)-3', '-11'],
		['(-8)-(-3)', '-5'],
		['(-5)*2', '-10'],
		['(-5)*(-2)', '10'],
		['5*(-2)', '-10'],
		['(-15):(-3)', '5'],
		['15:(-3)', '-5'],
		['(-15):3', '-5'],
		['(-3)^3', '-27'],
		['3/5', '3/5'],
		['-(3/5)', '-3/5'],
		['-3/5', '-3/5'],
		['(-3)/5', '-3/5'],
		['{-3}/5', '-3/5'],
		['3/(-5)', '-3/5'],
		['3/{-5}', '-3/5'],
		['(-3)/(-5)', '3/5'],
		['{-3}/{-5}', '3/5'],
		['42/70', '3/5'],
		['-(42/70)', '-3/5'],
		['-42/70', '-3/5'],
		['(-42)/70', '-3/5'],
		['{-42}/70', '-3/5'],
		['42/(-70)', '-3/5'],
		['42/{-70}', '-3/5'],
		['(-42)/(-70)', '3/5'],
		['{-42}/{-70}', '3/5'],
		['2/7+3/7', '5/7'],
		['5/7-3/7', '2/7'],
		['(5/7)*(3/7)', '15/49'],
		['(5/7):(3/7)', '5/3'],
		['(5/7)/(3/7)', '5/3'],
		['3/10+15/8', '87/40'],
		['3/10-15/8', '-63/40'],
		['(2/10)*(15/8)', '3/8'],
		['(2/10):(15/8)', '8/75'],
		['(2/10)/(15/8)', '8/75'],
	]

	test.each(t)('evaluating %s', (e, expected) => {
		expect(math(e).eval().string).toBe(expected)
	})
})

describe('Testing evaluation of litteral expression', () => {
	const t = [['3*4^n', '3*4^n']]

	test.each(t)('evaluating %s', (e, expected) => {
		expect(math(e).eval().string).toBe(expected)
	})
})

describe('Testing evaluation of numerical expression with decimal result', () => {
	const t = [
		['1.0', '1'],
		['0.1', '0.1'],
		['0.100', '0.1'],
		['0.0000001', '0.0000001'], // check precision
		['0.1+0.1', '0.2'],
		['0.1+0.2', '0.3'],
		['3.5-2.3', '1.2'],
		['(3.5)*2', '7'],
		['5:2', '2.5'],
		['7.5:2.5', '3'],
		['1.5^3', '3.375'],
		['-(-1.4)', '1.4'],
		['3/5', '0.6'],
		['-3/5', '-0.6'],
		['(-3)/5', '-0.6'],
		['{-3}/5', '-0.6'],
		['3/(-5)', '-0.6'],
		['3/{-5}', '-0.6'],
		['(-3)/(-5)', '0.6'],
		['{-3}/{-5}', '0.6'],
		['42/70', '0.6'],
		['-42/70', '-0.6'],
		['(-42)/70', '-0.6'],
		['{-42}/70', '-0.6'],
		['42/(-70)', '-0.6'],
		['42/{-70}', '-0.6'],
		['(-42)/(-70)', '0.6'],
		['{-42}/{-70}', '0.6'],
		['3/10+15/8', '2.175'],
		['3/10-15/8', '-1.575'],
		['(2/10)*(15/8)', '0.375'],
		// ['(2/10):(15/8)', '8/75'],
		// ['(2/10)/(15/8)', '8/75'],
	]

	test.each(t)('evaluating %s', (e, expected) => {
		expect(math(e).eval({ decimal: true }).string).toBe(expected)
	})
})

describe('Testing evaluation of numerical expression with decimal rounded result', () => {
	const t = [
		['1.123', 2, '1.12'],
		['1.1254', 2, '1.13'],
		['1.125', 2, '1.13'],
	]

	test.each(t)('rounding %s', (e, precision, expected) => {
		expect(
			math(e).eval({ decimal: true, precision: precision as number }).string,
		).toBe(expected)
	})
})

describe('Testing evaluation of litteral expressions', () => {
	const t = [
		['a+b', 'a', '1', 'b', '2', '3'],
		['a+b', 'a', 'b', 'b', '2', '4'],
	]

	test.each(t)(
		'evaluating %s with %s as %s and %s as %s',
		(e, symbol1, value1, symbol2, value2, expected) => {
			expect(
				math(e).eval({ values: { [symbol1]: value1, [symbol2]: value2 } })
					.string,
			).toBe(expected)
		},
	)
})

describe('Testing constants', () => {
	const t = [
		['a+pi', 'a', '1', '4.14'],
		['a+e', 'a', '1', '3.7'],
	]

	test.each(t)(
		'evaluating %s with %s as %s and %s as a constant',
		(e, symbol, value, expected) => {
			expect(
				math(e).eval({ values: { [symbol]: value }, decimal: true }).string,
			).toBe(expected)
		},
	)
})

describe('Test functions evaluation', () => {
	test('Function pgcd', () => {
		const e = math('pgcd(12;18)')
		expect(e.eval().string).toEqual('6')
	})

	let t = [
		['mini(8;5)', '5'],
		['mini(5;8)', '5'],
		['mini(2;2)', '2'],
		['mini(10-3;2+3)', '5'],
		['mini(2+3;10-3)', '5'],
		['mini(1;2)', '1'],
		['mini(1.2;2)', '6/5'],
		['mini(sqrt(2);5)', 'sqrt(2)'],
		['mini(a;5)', 'mini(a;5)'],
		['mini(5;a)', 'mini(5;a)'],
		['mini(a;b)', 'mini(a;b)'],
	]

	test.each(t)('mini %s %s', (e1, e2) => {
		expect(math(e1).eval().string).toEqual(e2)
	})

	t = [
		['minip(8;5)', '5'],
		['minip(5;8)', '5'],
		['minip(2;2)', '2'],
		['minip(10-3;2+3)', '2+3'],
		['minip(2+3;10-3)', '2+3'],
		['minip(1;2)', '1'],
		['minip(1.2;2)', '1.2'],
		['minip(sqrt(2);5)', 'sqrt(2)'],
		['minip(a;5)', 'minip(a;5)'],
		['minip(5;a)', 'minip(5;a)'],
		['minip(a;b)', 'minip(a;b)'],
	]

	test.each(t)('minip %s %s', (e1, e2) => {
		expect(math(e1).eval().string).toEqual(e2)
	})

	t = [
		['maxi(8;5)', '8'],
		['maxi(5;8)', '8'],
		['maxi(2;2)', '2'],
		['maxi(10-3;2+3)', '7'],
		['maxi(2+3;10-3)', '7'],
		['maxi(1;2)', '2'],
		['maxi(1.2;2)', '2'],
		['maxi(sqrt(2);5)', '5'],
		['maxi(a;5)', 'maxi(a;5)'],
		['maxi(5;a)', 'maxi(5;a)'],
		['maxi(a;b)', 'maxi(a;b)'],
	]

	test.each(t)('maxi %s %s', (e1, e2) => {
		expect(math(e1).eval().string).toEqual(e2)
	})

	t = [
		['maxip(8;5)', '8'],
		['maxip(5;8)', '8'],
		['maxip(2;2)', '2'],
		['maxip(10-3;2+3)', '10-3'],
		['maxip(2+3;10-3)', '10-3'],
		['maxip(1;2)', '2'],
		['maxip(1.2;2)', '2'],
		['maxip(sqrt(2);5)', '5'],
		['maxip(a;5)', 'maxip(a;5)'],
		['maxip(5;a)', 'maxip(5;a)'],
		['maxip(a;b)', 'maxip(a;b)'],
	]

	test.each(t)('maxip %s %s', (e1, e2) => {
		expect(math(e1).eval().string).toEqual(e2)
	})

	test('Function mod', () => {
		const e = math('mod(15;4)')
		expect(e.eval().string).toEqual('3')
	})

	test('Function floor', () => {
		const e = math('floor(5.2)')
		expect(e.eval().string).toEqual('5')
	})
	test('Function abs', () => {
		const e = math('abs(5)')
		expect(e.eval().string).toEqual('5')
	})
	test('Function abs', () => {
		const e = math('abs(-5)')
		expect(e.eval().string).toEqual('5')
	})

	test('Function sqrt', () => {
		let e = math('sqrt(16)')
		expect(e.eval().string).toEqual('4')

		e = math('1/sqrt(16)')
		expect(e.eval().string).toEqual('1/4')

		e = math('sqrt(1/16)')
		expect(e.eval().string).toEqual('1/4')

		e = math('sqrt(25/16)')
		expect(e.eval().string).toEqual('5/4')
	})
})

describe('Test powers', () => {
	test('powers', () => {
		let e = math('16^2,3')
		expect(e.eval().string).toEqual('16^{23/10}')
		e = math('1/{16^2,3}')
		expect(e.eval().string).toEqual('1/16^{23/10}')

		e = math('1/sqrt(25/16)')
		expect(e.eval().string).toEqual('4/5')

		e = math('16^{1/2}')
		expect(e.eval().string).toEqual('4')
		e = math('16^(1/2)')
		expect(e.eval().string).toEqual('4')

		e = math('16^(-1/2)')
		expect(e.eval().string).toEqual('1/4')
		e = math('16^{-1/2}')
		expect(e.eval().string).toEqual('1/4')

		e = math('(1/16)^(1/2)')
		expect(e.eval().string).toEqual('1/4')
		e = math('{1/16}^{1/2}')
		expect(e.eval().string).toEqual('1/4')

		e = math('(25/16)^(1/2)')
		expect(e.eval().string).toEqual('5/4')
		e = math('{25/16}^{1/2}')
		expect(e.eval().string).toEqual('5/4')

		e = math('(25/16)^(-1/2)')
		expect(e.eval().string).toEqual('4/5')
		e = math('{25/16}^{-1/2}')
		expect(e.eval().string).toEqual('4/5')
	})
})

describe('Test relations evaluation', () => {
	const t = [
		['1=1', 'true'],
		['1=2', 'false'],
		['1.0=1', 'true'],
		['1.1=1', 'false'],
		['1/2=0.5', 'true'],
		['cos(5)=cos(5)', 'true'],
		['cos(10:2)=cos(5)', 'true'],
		['sin(5)=cos(5)', 'false'],
		['mod(16;2)=0', 'true'],
		['mod(3;2)=1', 'true'],

		['1<2', 'true'],
		['1<1', 'false'],
		['2<1', 'false'],

		['1>2', 'false'],
		['1>1', 'false'],
		['2>1', 'true'],

		['1<=2', 'true'],
		['1<=1', 'true'],
		['2<=1', 'false'],

		['1>=2', 'false'],
		['1>=1', 'true'],
		['2>=1', 'true'],
		['3.73 > -8.4', 'true'],
		['3,73 > -8,4', 'true'],

		['pgcd(6;10)=2', 'true'],
		['1!=1', 'false'],
		['1!=2', 'true'],

		['1/2<3/2', 'true'],
		['5+1/10<5+2/10', 'true'],
		['5+23/10^3<5+124/10^3', 'true'],
		['4+261/10^3<4+75/10^2 ', 'true'],
		['4+861/10^3<4+75/10^2 ', 'false'],

		['abs(4-2)>1', 'true'],
		['abs(4-3)>1', 'false'],
		['abs(4-3)>1', 'false'],
		['1<2<3', 'true'],
		['1<2>3', 'false'],
		['1>2>3', 'false'],
		['1>2<3', 'false'],
		['3>2>1', 'true'],
	]
	test.each(t)('is %s %s', (e1, e2) => {
		expect(math(e1).eval().string).toEqual(e2)
	})
})
