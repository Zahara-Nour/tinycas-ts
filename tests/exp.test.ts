import Decimal from 'decimal.js'
import { math } from '../src/math/math'

describe('Testing input value', () => {
	test('accepts number values', () => {
		const e = math(123)
		expect(e.isNumber()).toBeTruthy()
		expect(e.string).toBe('123')
	})

	test('accepts Decimaljs values', () => {
		const e = math(new Decimal(123))
		expect(e.isNumber()).toBeTruthy()
		expect(e.string).toBe('123')
	})
})

describe('Testing tree', () => {
	test('Root is set on children', () => {
		const e = math('2*3+4')
		expect(e.first.first.root).toBe(e)
	})

	test('Testing setParent is set on children', () => {
		let e = math('1+2')
		expect(e.first.string).toBe('1')
		expect(e.first.parent).toBe(e)
		expect(e.last.parent).toBe(e)

		e = math('1*2')
		expect(e.first.string).toBe('1')
		expect(e.last.string).toBe('2')
		expect(e.first.parent).toBe(e)
		expect(e.last.parent).toBe(e)

		e = math('1*2*3*4')
		expect(e.first.string).toBe('1*2*3')
		expect(e.first.parent).toBe(e)
		expect(e.first.root).toBe(e)
		expect(e.first.first.parent).toBe(e.first)
		expect(e.first.first.root).toBe(e)
		expect(e.first.last.parent).toBe(e.first)
		expect(e.first.last.root).toBe(e)

		expect(e.last.parent).toBe(e)

		e = math('1+2+3+4')
		expect(e.first.string).toBe('1+2+3')
		expect(e.first.parent).toBe(e)
		expect(e.last.parent).toBe(e)
	})
})

describe.skip('Testing formats', () => {
	const exps = {
		'3': '$e',
		'2': '$er',
		'-3': '$er',
		'4': '$d',
		'3.3': '$d',
		'5': '$dr',
		'-4': '$dr',
		'3.4': '$dr',
		'-3.4': '$dr',
		'3+4': '$e+$e',
		'3-4': '$e-$e',
		'3*4': '$e*$e',
		'3:4': '$e:$e',
		'3/4': '$e/$e',
		'3^4': '$p',
		'3.4*10^2': '$d*10^$er',
	}

	// TODO: division par 0
	// for (const [tested, expected] of Object.entries(exps)) {
	// 	test(`matching ${tested} against ${expected}`, () => {
	// 		expect(math(tested).match(math(expected))).toBeTruthy()
	// 	})
	// }
})

describe('Testing equality between two expressions', () => {
	const t = [
		['x+x', '2x'],
		['2*x', '2x'],
		['(-1)*x', '-x'],
		['0*x', '0'],
		['-(-x)', 'x'],
		['x*x', 'x^2'],
		['(-x)*(-x)', 'x^2'],
		['(-x)*x', '-x^2'],
		['x*(-x)', '-x^2'],
		['x+y', 'y+x'],
		['x+(-y)', 'x-y'],
		['x*y', 'y*x'],
		['x+(y+z)', '(x+y)+z'],
		['x*(y*z)', '(x*y)*z'],
		['x*(y+z)', 'x*y+x*z'],
		['-(x+y)', '-x-y'],
		['x*(y+z)', 'x*y+x*z'],
		['x*(y-z)', 'x*y-x*z'],
		['(y-z)*x', 'y*x-z*x'],
		[
			'(3x+4y)^7',
			'2187 x^7 + 20412 x^6 * y + 81648 x^5 * y^2 + 181440 x^4 * y^3 + 241920 x^3 * y^4 + 193536 x^2 * y^5 + 86016 x * y^6 + 16384 * y^7',
		],
		[
			'(3x-4y)^7',
			'2187 x^7 - 20412 x^6 y + 81648 x^5 y^2 - 181440 x^4 y^3 + 241920 x^3 y^4 - 193536 x^2 y^5 + 86016 x y^6 - 16384 y^7',
		],
		// ['(3x+4y)^12', '531441 x^12 + 8503056 x^11 y + 62355744 x^10 y^2 + 277136640 x^9 y^3 + 831409920 x^8 y^4 + 1773674496 x^7 y^5 + 2759049216 x^6 y^6 + 3153199104 x^5 y^7 + 2627665920 x^4 y^8 + 1557135360 x^3 y^9 + 622854144 x^2 y^10 + 150994944 x y^11 + 16777216 y^12']

		['1=1', '1=1'],
		['1=2', '2=1'],
		['x=2+3', 'x=2+3'],
		['x=2+3', 'x=3+2'],
		['x=2+3', '2+3=x'],
		['x=2+3', '3+2=x'],
		['x=2+3', '5=x'],

		['1<1', '1<1'],
		['1<2', '1<2'],
		['1<2', '2>1'],
		['x<3+2', 'x<2+3'],
		['x<3+2', '2+3>x'],

		['1>1', '1>1'],
		['1>2', '1>2'],
		['1>2', '2<1'],
		['x>3+2', 'x>2+3'],
		['x>3+2', '2+3<x'],

		['1<=1', '1<=1'],
		['1<=2', '1<=2'],
		['1<=2', '2>=1'],
		['x<=3+2', 'x<=2+3'],
		['x<=3+2', '2+3>=x'],

		['1>=1', '1>=1'],
		['1>=2', '1>=2'],
		['1>=2', '2<=1'],
		['x>=3+2', 'x>=2+3'],
		['x>=3+2', '2+3<=x'],

		['1 cm', '10 mm'],
		['1 h 1 min', '61 min'],

		['x/x', '1'],
		['exp(x)/exp(x)', '1'],
	]
	test.each(t)('%s is equivalent to %s', (e1, e2) => {
		expect(math(e1).equals(math(e2))).toBeTruthy()
	})

	const t2 = [
		['x-y', 'y-x'],
		['x/y', 'y/x'],
	]

	test.each(t2)('%s is not equivalent to %s', (e1, e2) => {
		expect(math(e1).equals(math(e2))).toBeFalsy()
	})
})

describe('Testing comparison between two numericals expressions', () => {
	const t = [
		['1', 2],
		['1', 2],
		['-5', -3],
		['-1', 0],
		['-1', 4],
		['1.5', 2.7],
		['3/2', '5/2'],
		['4^2', '5^3'],
		['sqrt(2)', 5],
		['cos(10)', 5],
		['sin(10)', 5],
		['ln(1)', 5],
		['exp(1)', 5],
	]
	test.each(t)('%s is lower than %s', (e1, e2) => {
		expect(math(e1).isLowerThan(e2)).toBeTruthy()
		expect(math(e1).isLowerOrEqual(e2)).toBeTruthy()
	})

	test.each(t)('%s is greater than %s', (e1, e2) => {
		expect(math(e2).isGreaterThan(e1)).toBeTruthy()
		expect(math(e2).isGreaterOrEqual(e1)).toBeTruthy()
	})
})

describe('Testing comparison between two numericals expressions (2)', () => {
	const t = [
		['sqrt(4)', 2],
		['cos(pi)', -1],
		['sin(pi)', 0],
		['ln(1)', 0],
		['ln(e)', 1],
		['exp(0)', 1],
		['cos(10)', 'cos(10)'],
		['sin(10)', 'sin(10)'],
		['ln(10)', 'ln(10)'],
	]

	test.each(t)('%s is lower than %s', (e1, e2) => {
		expect(math(e1).isLowerOrEqual(e2)).toBeTruthy()
	})

	test.each(t)('%s is greater than %s', (e1, e2) => {
		expect(math(e2).isGreaterOrEqual(e1)).toBeTruthy()
	})
})

describe('Testing strict equality between two expressions', () => {
	const t = [
		['x', 'x'],
		['2', '2'],
		['13', '13'],
	]
	test.each(t)('%s is equivalent to %s', (e1, e2) => {
		expect(math(e1).strictlyEquals(math(e2))).toBeTruthy()
	})

	const t2 = [
		['x+y', 'y+x'],
		['x*y', 'y*x'],
	]

	test.each(t2)('%s is not equivalent to %s', (e1, e2) => {
		expect(math(e1).strictlyEquals(math(e2))).toBeFalsy()
	})
})

describe('Testing isNumeric', () => {
	const t = [
		['1', true],
		['1,5', true],
		['-1', true],
		['-1,5', true],
		['1/2', true],
		['-1/2', true],
		['cos(2)', true],
		['-cos(2)', true],
		['cos(ln(2))', true],
		['1+2*3', true],
		['x', false],
		['1+x', false],
	]
	test.each(t)('%s is numeric ?', (e, expected) => {
		expect(math(e as string).isNumeric()).toBe(expected)
	})
})

describe.skip('Testing terms', () => {
	// const e = '1+2+3+4'
	// expect(math(e).terms.toString()).toEqual([1, 2, 3, 4].toString())
})

describe('Testing detection of unecessary zeros', () => {
	const t = [
		['0', false],
		['1', false],
		['10', false],
		['01', true],
		['0.0', true],
		['0,0', true],
		['1.0', true],
		['1,0', true],
		['0.1', false],
		['0,1', false],
		['0.10', true],
		['0,10', true],
		['101', false],
		['101', false],
		['1,01', false],
		['1.01', false],
		['3+1.01', false],
		['3+1.010', true],
		['0 1', true],
		['0  1', true],
	]
	test.each(t)('%s has unecessary Zeros', (e, expected) => {
		expect(math(e as string).searchUnecessaryZeros()).toBe(expected)
	})
})

describe('Testing detection of misplaced spaces', () => {
	const t = [
		['0', false],
		['0 ', false],
		['10', false],
		['1 0', true],
		['100', false],
		['1 00', true],
		['1000', true],
		['100 0', true],
		['10 00', true],
		['1 000', false],
		['10 000', false],
		['1 0000', true],

		['0.0', false],
		['0. 0', true],
		['0.1', false],
		['0.10', false],
		['0.1 0', true],
		['0.100', false],
		['0.10 0', true],
		['0.1 00', true],
		['0. 100', true],
		['0.1000', true],
		['0.100 0', false],
		['0.10 00', true],
		['0.1 000', true],
	]
	test.each(t)('%s has misplacedSpaces', (e, expected) => {
		expect(math(e as string).searchMisplacedSpaces()).toBe(expected)
	})
})
