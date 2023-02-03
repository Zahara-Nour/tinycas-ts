import { math } from '../src/math/math'

describe('Testing substitutions', () => {
	const t = [
		['a', '1', 'a', '1'],
		['a', '1/2', 'a', '1/2'],
		['a', '0.2', 'a', '0.2'],
		['a', '1', 'a+a', '1+1'],
		['a', '1', 'a-a', '1-1'],
		['a', '1', 'a*a', '1*1'],
		['a', '1', 'a:a', '1:1'],
		['a', '1', 'a/a', '1/1'],
		['a', '1', 'a^a', '1^1'],
		['a', '1', '(a)', '(1)'],
		['a', '1', 'a+a', '1+1'],
	]

	test.each(t)(
		'substitution of %s by %s in %s',
		(symbol, value, e, expected) => {
			expect(math(e).substitute({ [symbol]: value }).string).toBe(expected)
		},
	)

	const t2 = [
		['a', '1', 'b', '2', 'a+b', '1+2'],
		['a', 'b', 'b', '2', 'a', '2'],
	]

	test.each(t2)(
		'substitution of %s by %s and %s by %s in %s',
		(symbol1, value1, symbol2, value2, e, expected) => {
			expect(
				math(e).substitute({ [symbol1]: value1, [symbol2]: value2 }).string,
			).toBe(expected)
		},
	)
})

describe('Testing template $', () => {
	const t = [['${1/3}', '1/3']]

	test.each(t)(' %s ', (e, expected) => {
		const f = math(e)

		const g = f.generate().string

		expect(f.generate().string).toBe(expected)
	})
})

//  TODO : est-ce bien utile comme template ?
describe('Testing template $$', () => {
	const t = [['$$2{1/3}', '0.33']]

	test.each(t)(' %s ', (e, expected) => {
		const f = math(e)

		const g = f.generate().string

		expect(f.generate().string).toBe(expected)
	})
})

describe('Testing templates generations', () => {
	const t = [
		'$e{3}',
		'$e[15;19]',

		'$e{2;3}',
		'$er{3}',
		'-$e{3}',
		'$e{1}+$e{3}',
		'$e{1;1}*$e{3}+3:?-a',
		'$e{1}+$1',
		'$e{1}+$e{2}+$1+$2',
		'$e{1}*$e{3}+$1*$e{3}',
		'$e{1;1}+$e{1;1}',
		'$e{1;1}=$e{1;1}',

		// TODO : ne marche pas
		// '$e{1}+$e{$1+1;$1+1}',
		// '$e{1}+$e{$1;$1}',

		'$d{3;1}',
		'$d{$e[2;5];$e[7;9]}',
		'$d{0;3}',

		// '$dr{2:2;4:4}',

		'$e{3}\\{1;2;3}',
		'$e[3;6]\\{4;5}',
		'$e[3;6]\\[4;5]',
		'$l{2;3;5;7}\\[5;7]',
		'$l{2;3;5}\\{5-3;3}',
		'$l{10;15;3}\\{m5}', // 5 multiples
		'$l{2;3;5}\\{d6}', // 6 dividers
		'$l{10;15;3}\\{m(2+3)}', // 5 multiples
		'$l{2;3;5}\\{d(2+4)}', // 6 dividers
		'$e[2;4]\\{m2}', // 5 multiples
		'$e[2;4]\\{d6}', // 6 dividers
		'$e[2;4]\\{m(1+1)}', // 5 multiples
		'$e[2;4]\\{d(2+4)}', // 6 dividers
		'$e[2;6]\\{cd(6)}', // 6 dividers
		'$er[2;6]\\{cd(6)}', // 6 dividers

		'$l{a;b;c}\\{a;b}',
		'$ers[1;2]}', // avec le signe + ou -
	]
	// console.log('$e[2;9] km : ', math('$e[2;9] km').generate().string)
	// console.log('$l{3 km; 2m} : ', math('$l{3 km; 2m}').generate().string)
	// console.log('$l{$e[2;9] km; $e[2;9] m} : ', math('$l{$e[2;9] km ; $e[2;9] m}').generate().string)

	// console.log('$l{km; m} : ', math('$l{km ; m}').generate().string)
	test.each(t)('is %s generation matching initial template', (e) => {
		// const f = math(e).generate()

		const f = math(e)
		const g = f.generate()

		// console.log(f.string, g.string)
		// for (let i=0; i<100 ; i++) {
		expect(g.matchTemplate(f)).toBeTruthy()
		// }
	})
	// let e

	// for (let i = 0; i < 30; i++) {
	//   e = math(t[9])

	//   // console.log(e.string)

	//   console.log(e.generate().string)
	// }
})

describe('Testing templates generations 2', () => {
	const t = ['1']

	test.each(t)('is %s generation matching initial template', (e) => {
		// const f = math(e).generate()

		const f = math('${' + e + '}')
		const g = math(e)
		// console.log(f.string)
		// console.log(f.generate().string)
		expect(f.generate().string).toBe(g.string)
	})
	// let e

	// for (let i = 0; i < 30; i++) {
	//   e = math(t[9])

	//   // console.log(e.string)

	//   console.log(e.generate().string)
	// }
})

describe('Testing sorting terms and factors', () => {
	const t = [
		['4+3', '3+4'],
		['a+3', '3+a'],
		['-1+3', '3-1'],
		['+1+3', '1+3'],
		['-5+3+a', '3+a-5'],
		['+5+3+a', '3+5+a'],

		['4-3', '4-3'],
		['a-3', 'a-3'],
		['-1-3', '-1-3'],
		['+1-3', '1-3'],
		['-5-3-a', '-3-5-a'],
		['+5-3-a', '5-3-a'],
		['1-a+2-b+3-c', '1+2+3-a-b-c'],

		['4*3', '3*4'],
		['a*3', '3*a'],
		['(-1)*3', '3*(-1)'],
		['-4*3', '-3*4'],
		['(+1)*3', '3*(+1)'],
		['+1*3', '+1*3'],

		['3+5*4', '3+4*5'],
		['a+b*4+3*2*1', 'a+4*b+1*2*3'],

		['-z^2-2z', '-2*z-z^2'],
		['-2z-z^2', '-2*z-z^2'],
	]

	test.each(t)('%s and %s', (e, expected) => {
		expect(math(e).sortTermsAndFactors().string).toBe(expected)
	})
})

describe('Testing removing unecessary brackets', () => {
	let t = [
		['(3)', '3'],
		['(3+4)', '3+4'],
		['((3+4))', '3+4'],
		['3*((3+4))', '3*(3+4)'],

		['(-1)+4', '-1+4'],
		['4+(-9)', '4+(-9)'],
		['2+(-1)+4', '2+(-1)+4'],
		['2*((-1)+4)', '2*(-1+4)'],
		['(+1)+4', '+1+4'],
		['2+(+1)+4', '2+(+1)+4'],
		['2*((+1)+4)', '2*(+1+4)'],

		['3+(2)', '3+2'],
		['3+(a)', '3+a'],
		['3+(?)', '3+?'],
		['3+(2)', '3+2'],
		['3+(cos(5))', '3+cos(5)'],
		['cos((5))', 'cos(5)'],

		['2+(2a)', '2+2a'],
		['-(3*4)', '-3*4'],
		['-(3a)', '-3a'],
		['-(3:a)', '-3:a'],
		['-(3/a)', '-3/a'],

		['3+(4+5)', '3+4+5'],
		['(3+4)+5', '3+4+5'],
		['3+(4-5)', '3+4-5'],
		['(3-4)+5', '3-4+5'],
		['3+(4*5)', '3+4*5'],
		['(3*4)+5', '3*4+5'],
		['3+(4:5)', '3+4:5'],
		['(3:4)+5', '3:4+5'],
		['3+(4/5)', '3+4/5'],
		['(3/4)+5', '3/4+5'],
		['3+(4^5)', '3+4^5'],
		['(3^4)+5', '3^4+5'],

		['3-(4+5)', '3-(4+5)'],
		['(3+4)-5', '3+4-5'],
		['3-(4-5)', '3-(4-5)'],
		['(3-4)-5', '3-4-5'],
		['3-(4*5)', '3-4*5'],
		['(3*4)-5', '3*4-5'],
		['3-(4:5)', '3-4:5'],
		['(3:4)-5', '3:4-5'],
		['3-(4/5)', '3-4/5'],
		['(3/4)-5', '3/4-5'],
		['3-(4^5)', '3-4^5'],
		['(3^4)-5', '3^4-5'],

		['3*(4+5)', '3*(4+5)'],
		['(3+4)*5', '(3+4)*5'],
		['3*(4-5)', '3*(4-5)'],
		['(3-4)*5', '(3-4)*5'],
		['3*(4*5)', '3*4*5'],
		['(3*4)*5', '3*4*5'],
		['3*(4:5)', '3*4:5'],
		['(3:4)*5', '3:4*5'],
		['3*(4/5)', '3*4/5'],
		['(3/4)*5', '3/4*5'],
		['3*(4^5)', '3*4^5'],
		['(3^4)*5', '3^4*5'],

		['3:(4+5)', '3:(4+5)'],
		['(3+4):5', '(3+4):5'],
		['3:(4-5)', '3:(4-5)'],
		['(3-4):5', '(3-4):5'],
		['3:(4*5)', '3:(4*5)'],
		['(3*4):5', '3*4:5'],
		['3:(4:5)', '3:(4:5)'],
		['(3:4):5', '3:4:5'],
		['3:(4/5)', '3:(4/5)'],
		['(3/4):5', '3/4:5'],
		['3:(4^5)', '3:4^5'],
		['(3^4):5', '3^4:5'],

		['(3)/(4)', '3/4'],
		['(-3)/(4)', '{-3}/4'],
		['{-3}/{-4}', '{-3}/{-4}'],
		['(-3)/(-4)', '{-3}/{-4}'],
		['3/{4+5}', '3/{4+5}'],
		['3/(4+5)', '3/{4+5}'],
		['(3+4)/5', '{3+4}/5'],
		['3/(4-5)', '3/{4-5}'],
		['(3-4)/5', '{3-4}/5'],
		['3/(4*5)', '3/{4*5}'],
		['(3*4)/5', '3*4/5'],
		['3/(4:5)', '3/{4:5}'],
		['(3:4)/5', '3:4/5'],
		['3/(4/5)', '3/{4/5}'],
		['(3/4)/5', '3/4/5'],
		['3/(4^5)', '3/4^5'],
		['(3^4)/5', '3^4/5'],

		['3^(4+5)', '3^{4+5}'],
		['(3+4)^5', '(3+4)^5'],
		['3^(4-5)', '3^{4-5}'],
		['(3-4)^5', '(3-4)^5'],
		['3^(4*5)', '3^{4*5}'],
		['(3*4)^5', '(3*4)^5'],
		['3^(4:5)', '3^{4:5}'],
		['(3:4)^5', '(3:4)^5'],
		['3^(4/5)', '3^{4/5}'],
		['(3/4)^5', '(3/4)^5'],
		['3^(4^5)', '3^{4^5}'],
		['(3^4)^5', '3^4^5'],

		['(1)=1', '1=1'],
		['1=(1)', '1=1'],
		['(1)!=1', '1!=1'],
		['1!=(1)', '1!=1'],
		['(1)<1', '1<1'],
		['1<=(1)', '1<=1'],
		['(1)>1', '1>1'],
		['1>(1)', '1>1'],
		['(1)>=1', '1>=1'],
		['1>=(1)', '1>=1'],
	]

	test.each(t)('%s and %s', (e, expected) => {
		expect(math(e).removeUnecessaryBrackets().string).toBe(expected)
	})

	t = [
		['(-1)+4', '(-1)+4'],
		['(+1)+4', '(+1)+4'],
	]

	test.each(t)('%s and %s', (e, expected) => {
		expect(math(e).removeUnecessaryBrackets(true).string).toBe(expected)
	})
})

describe('Testing reducing fractions', () => {
	const t = [
		['2', '2'],
		['8/4', '2'],
		['4/6', '2/3'],
		['-4/6', '-2/3'],
		['4/6+6/15', '2/3+2/5'],
		['4/6-6/15', '2/3-2/5'],
		['(4/6)*(6/15)', '(2/3)*(2/5)'],

		['(-4)/6', '-2/3'],
		['4/(-6)', '-2/3'],
		['a+2/4', 'a+1/2'],
	]

	test.each(t)('%s and %s', (e, expected) => {
		expect(math(e).reduceFractions().string).toBe(expected)
	})
})

describe('Testing removing unecessary Mult operator', () => {
	const t = [
		['3*x', '3x'],
		['x*x', 'xx'],
		['3*4', '3*4'],
		['x*3', 'x*3'],
		['3*(2+5)', '3(2+5)'],
		['(2+5)*3', '(2+5)*3'],
		['3*a^2', '3a^2'],
	]

	test.each(t)('%s and %s', (e, expected) => {
		expect(math(e).removeMultOperator().string).toBe(expected)
	})
})

describe('Simplify null product', () => {
	const t = [
		['0*a', '0'],
		['a*0', '0'],
		['a*0*b', '0'],
		['0*0', '0'],
		['0*a+1', '0+1'],
		['0*a+0*b', '0+0'],
	]

	test.each(t)('%s and %s', (e, expected) => {
		expect(math(e).simplifyNullProducts().string).toBe(expected)
	})
})

describe('Testing removing unecessary signs', () => {
	const t = [
		['+3', '3'],
		['(+3)', '3'],
		['+(+3)', '3'],
		['+(+3)+4', '3+4'],
		['+(-3)', '-3'],
		['+(-3)+4', '-3+4'],
		['-(+3)', '-3'],
		['-(+3)+4', '-3+4'],
		['-(-3)', '3'],
		['-(-3)+4', '3+4'],
		['1+(-3)', '1-3'],
		['1-(-3)', '1+3'],
		['1-(+3)', '1-3'],
		['1+(+3)', '1+3'],
		['(+3)+(-(-6))', '3+6'],
		['(+3)+(+(+6))', '3+6'],
		['(+3)-(-(-6)-4)', '3-(6-4)'],
		['(+3)-(-(-6):(-4))', '3+6:4'],
		['(+3)^2', '3^2'],
		['-2+3', '-2+3'],
		['(-2)+3', '(-2)+3'],

		['1*(+3)', '1*3'],
		['1*(-3)', '-1*3'],
		['(-2)*3', '-2*3'],
		['(-6)*b', '-6*b'],
		['5*(-2)*3', '-5*2*3'],
		['5*(-2)*(-3)', '5*2*3'],
		['(-5)*2*(-3)', '5*2*3'],
		['(-5)*(-2)*3', '5*2*3'],
		['(-5)*(-2)*(-3)', '-5*2*3'],
		['5*(+2)*3', '5*2*3'],
		['5*(+2)*(+3)', '5*2*3'],
		['(+5)*2*(+3)', '5*2*3'],
		['(+5)*(+2)*3', '5*2*3'],
		['(+5)*(+2)*(+3)', '5*2*3'],
		['(+3)*(-(-6))', '3*6'],
		['-(+3)*(-(-6))', '-3*6'],
		['+(+3)*(-(-6))', '3*6'],
		['(+3)*(-(-6)-(-4))', '3*(6+4)'],

		['1:(+3)', '1:3'],
		['1:(-3)', '-1:3'],
		['(-2):3', '-2:3'],
		['5:(-2):3', '-5:2:3'],
		['5:(-2):(-3)', '5:2:3'],
		['(-5):2:(-3)', '5:2:3'],
		['(-5):(-2):3', '5:2:3'],
		['(-5):(-2):(-3)', '-5:2:3'],
		['5:(+2):3', '5:2:3'],
		['5:(+2):(+3)', '5:2:3'],
		['(+5):2:(+3)', '5:2:3'],
		['(+5):(+2):3', '5:2:3'],
		['(+5):(+2):(+3)', '5:2:3'],
		['5:(-2):3', '-5:2:3'],
		['5:((-2):(-3))', '5:(2:3)'],
		['(-5):(2:(-3))', '5:(2:3)'],
		['(-5):((-2):3)', '5:(2:3)'],
		['(-5):((-2):(-3))', '-5:(2:3)'],
		['5:((+2):3)', '5:(2:3)'],
		['5:((+2):(+3))', '5:(2:3)'],
		['(+5):(2:(+3))', '5:(2:3)'],
		['(+5):((+2):3)', '5:(2:3)'],
		['(+5):((+2):(+3))', '5:(2:3)'],

		['1/(+3)', '1/3'],
		['1/{+3}', '1/3'],
		['1/(-3)', '-1/3'],
		['1/{-3}', '-1/3'],
		['(-2)/3', '-2/3'],
		['{-2}/3', '-2/3'],
		['5/(-2)/3', '-5/2/3'],
		['5/{-2}/3', '-5/2/3'],
		['5/(-2)/(-3)', '5/2/3'],
		['5/{-2}/{-3}', '5/2/3'],
		['(-5)/2/(-3)', '5/2/3'],
		['{-5}/2/{-3}', '5/2/3'],
		['(-5)/(-2)/3', '5/2/3'],
		['{-5}/{-2}/3', '5/2/3'],
		['(-5)/(-2)/(-3)', '-5/2/3'],
		['{-5}/{-2}/{-3}', '-5/2/3'],
		['5/(+2)/3', '5/2/3'],
		['5/{+2}/3', '5/2/3'],
		['5/(+2)/(+3)', '5/2/3'],
		['5/{+2}/{+3}', '5/2/3'],
		['(+5)/2/(+3)', '5/2/3'],
		['{+5}/2/{+3}', '5/2/3'],
		['(+5)/(+2)/3', '5/2/3'],
		['{+5}/{+2}/3', '5/2/3'],
		['(+5)/(+2)/(+3)', '5/2/3'],
		['{+5}/{+2}/{+3}', '5/2/3'],
		['5/(-2)/3', '-5/2/3'],
		['5/{-2}/3', '-5/2/3'],
		['5/((-2)/(-3))', '5/(2/3)'],
		['5/{{-2}/{-3}}', '5/{2/3}'],
		['(-5)/(2/(-3))', '5/(2/3)'],
		['{-5}/{2/{-3}}', '5/{2/3}'],
		['(-5)/((-2)/3)', '5/(2/3)'],
		['{-5}/{{-2}/3}', '5/{2/3}'],
		['(-5)/((-2)/(-3))', '-5/(2/3)'],
		['{-5}/{{-2}/{-3}}', '-5/{2/3}'],
		['5/((+2)/3)', '5/(2/3)'],
		['5/{{+2}/3}', '5/{2/3}'],
		['5/((+2)/(+3))', '5/(2/3)'],
		['5/{{+2}/{+3}}', '5/{2/3}'],
		['(+5)/(2/(+3))', '5/(2/3)'],
		['{+5}/{2/{+3}}', '5/{2/3}'],
		['(+5)/((+2)/3)', '5/(2/3)'],
		['{+5}/{{+2}/3}', '5/{2/3}'],
		['(+5)/((+2)/(+3))', '5/(2/3)'],
		['{+5}/{{+2}/{+3}}', '5/{2/3}'],

		['6a', '6a'],
		['6a-9', '6a-9'],
		['-6a-9', '-6a-9'],
		['c:d*a', 'c:d*a'],
		['c:a', 'c:a'],
		['da', 'da'],
		// test qui ne passe pas
		// ['c:da', 'c:da'],
	]

	test.each(t)('%s and %s', (e, expected) => {
		expect(math(e).removeSigns().string).toBe(expected)
	})
})

describe('Testing removing null terms', () => {
	const t = [
		['0', '0'],
		['1', '1'],
		['1+0', '1'],
		['0+1', '1'],
		['0+0', '0'],
		['1+0+3', '1+3'],
		['1+2+0', '1+2'],
		['0+1+2', '1+2'],
		['1+0*2+3', '1+3'],
		['1-0', '1'],
		['0-1', '-1'],
		['0-0', '0'],
		['1-0-3', '1-3'],
		['1-2-0', '1-2'],
		['0-1-2', '-1-2'],
		['1-0*2-3', '1-3'],
	]

	test.each(t)('%s and %s', (e, expected) => {
		expect(math(e).removeNullTerms().string).toBe(expected)
	})
})

describe('Testing removing factors one', () => {
	const t = [
		['0', '0'],
		['1', '1'],
		['2', '2'],
		['1*2', '2'],
		['2*1', '2'],
		['1*1', '1'],
		['2*1*3', '2*3'],
		['1*2*3', '2*3'],
		['2*3*1', '2*3'],
		['1+2*1*3', '1+2*3'],
		['5(4+1*a)', '5(4+a)'],
		['5*(4-3)', '5*(4-3)'],
		['1*(4-3)', '4-3'],
		['(4-3)*2', '(4-3)*2'],
		['(4-3)*1', '4-3'],
	]

	test.each(t)('%s and %s', (e, expected) => {
		expect(math(e).removeFactorsOne().string).toBe(expected)
	})
})

describe('Testing composing functions', () => {
	const t = [
		['x+1', 'x^2', 'x^2+1'],
		['x^2', 'x+1', '(x+1)^2'],
		['exp(x)', '2x', 'exp(2x)'],
		['ln(x)', '2x', 'ln(2x)'],
		['cos(x)', '2x', 'cos(2x)'],
		['sin(x)', '2x', 'sin(2x)'],
		['sqrt(x)', '2x', 'sqrt(2x)'],
	]

	test.each(t)('composing %s with %s', (f, g, expected) => {
		expect(math(f).compose(math(g)).string).toBe(expected)
	})
})

describe('Testing derivating functions', () => {
	const t = [
		['1', '0'],
		['x', '1'],
		['-x', '-1'],
		['1/x', '-1/x^2'],
		['a', '0'],
		['exp(x)', 'exp(x)'],
		['exp(2x)', '2exp(2x)'],
		['2exp(x)', '2exp(x)'],
		['exp(y)', '0'],
		['ln(x)', '1/x'],
		['2ln(x)', '2/x'],
		['ln(2x)', '1/x'],
		['exp(ln(x))', '1'],
		['exp(2*ln(x))', '2x'],
		['cos(x)', '-sin(x)'],
		['sin(x)', 'cos(x)'],
		['ln(cos(x))', '-sin(x)/cos(x)'],
		['ln(exp(x))', '1'],
		['x*x', '2x'],
		['x*ln(x)', '1+ln(x)'],
		['x/ln(x)', '(ln(x)-1)/(ln(x)^2)'],
		['x^2', '2x'],
		['x^3', '3x^2'],
		['x^3', '3x^2'],
		['6x^3-5x^2+10x-7', '18x^2-10x+10'],
		['sqrt(x)', '1/(2*sqrt(x))'],
		['x^{1/2}', '1/(2*sqrt(x))'],
	]

	test.each(t)('%s', (e, expected) => {
		expect(math(e).derivate().equals(math(expected))).toBeTruthy()
		// expect(math(e).derivate().string).toBe("a")
	})
})
