import parser from '../src/math/parser'

describe('Parser interface', () => {
	const p = parser()

	test('Parser has a "parse" method', () => {
		expect(p).toHaveProperty('parse')
		expect(typeof p.parse).toBe('function')
	})
})

describe('Parsing', () => {
	const p = parser()

	test('Parser parses identifiers', () => {
		let e = p.parse('&1')
		expect(e.toString()).toEqual('&1')
		expect(e.isIdentifier()).toBeTruthy()

		e = p.parse('&23')
		expect(e.toString()).toEqual('&23')
		expect(e.isIdentifier()).toBeTruthy()

		e = p.parse('1+&23')
		expect(e.toString()).toEqual('1+&23')

		e = p.parse('&ans')
		expect(e.toString()).toEqual('&ans')
		expect(e.isIdentifier()).toBeTruthy()

		e = p.parse('&ans1')
		expect(e.toString()).toEqual('&ans1')
		expect(e.isIdentifier()).toBeTruthy()

		e = p.parse('1+&ans1')
		expect(e.toString()).toEqual('1+&ans1')
	})

	test('Parser parses a hole', () => {
		const e = p.parse('?')
		expect(e.toString()).toEqual('?')
		expect(e.isHole()).toBeTruthy()
	})

	test('Parser parses an integer', () => {
		const e = p.parse('123')
		expect(e.string).toEqual('123')
		expect(e.input).toEqual('123')
		expect(e.isInt()).toBeTruthy()
	})

	test('Parser parses a number whith coma', () => {
		const e = p.parse('123,45')
		expect(e.string).toEqual('123.45')
		expect(e.input).toEqual('123.45')
		expect(e.isNumber()).toBeTruthy()
	})

	test('Parser parses a number whith point', () => {
		const e = p.parse('123.45')
		expect(e.string).toEqual('123.45')
		expect(e.input).toEqual('123.45')
		expect(e.isNumber()).toBeTruthy()
	})

	test('Parser parses an integer whith leading 0', () => {
		const e = p.parse('00123')
		expect(e.string).toEqual('00123')
		expect(e.input).toEqual('00123')
		expect(e.isNumber()).toBeTruthy()
	})

	test('Parser parses a decimal whith leading 0', () => {
		const e = p.parse('00123,445')
		expect(e.string).toEqual('00123.445')
		expect(e.input).toEqual('00123.445')
		expect(e.isNumber()).toBeTruthy()
	})

	test('Parser parses a decimal whith trailing 0', () => {
		const e = p.parse('123,44500')
		expect(e.input).toEqual('123.44500')
		expect(e.string).toEqual('123.44500')
		expect(e.isNumber()).toBeTruthy()
	})

	test('Parser parses a decimal number with "," and output the comma', () => {
		const e = p.parse('123,45')
		expect(e.toString({ comma: true })).toEqual('123,45')
		expect(e.isNumber()).toBeTruthy()
	})

	test('Parser parses number with heading space', () => {
		const e = p.parse(' 3')
		expect(e.string).toEqual('3')
		expect(e.input).toEqual('3')
	})

	test('Parser parses number with trailing space', () => {
		const e = p.parse('3 ')
		expect(e.string).toEqual('3')
		expect(e.input).toEqual('3')
	})

	test('Parser parses number with spaces', () => {
		const e = p.parse('3 9 8 9')
		expect(e.string).toEqual('3 9 8 9')
		expect(e.input).toEqual('3 9 8 9')
	})

	test('Parser parses number with spaces (2)', () => {
		const e = p.parse('3  9   8    9')
		expect(e.string).toEqual('3  9   8    9')
		expect(e.input).toEqual('3  9   8    9')
	})

	test('Parser parses number with trailing comma', () => {
		const e = p.parse('1,')
		expect(e.isIncorrect()).toBeTruthy()
	})

	test('Parser parses expressions with spaces', () => {
		const e = p.parse('3 + 7')
		expect(e.string).toEqual('3+7')
		// expect(e.input).toEqual('3 + 7')
	})

	test('Parser parses a decimal whith spaces', () => {
		const e = p.parse('  1 23  ,4 45 0 0 ')
		expect(e.input).toEqual('1 23  .4 45 0 0')
		expect(e.string).toEqual('1 23  .4 45 0 0')
		expect(e.isNumber()).toBeTruthy()
	})

	test('Parser parses a segment length', () => {
		const e = p.parse('AB')
		expect(e.toString()).toEqual('AB')
		expect(e.isSegmentLength()).toBeTruthy()
	})

	test('Parser parses a symbol', () => {
		const e = p.parse('a')
		expect(e.toString()).toEqual('a')
		expect(e.isSymbol()).toBeTruthy()
	})

	test('Parser parses a symbol with indice', () => {
		let e = p.parse('u_1')
		expect(e.toString()).toEqual('u_1')
		expect(e.isSymbol()).toBeTruthy()
		e = p.parse('u_12')
		expect(e.toString()).toEqual('u_12')
		expect(e.isSymbol()).toBeTruthy()
		e = p.parse('u_i')
		expect(e.toString()).toEqual('u_i')
		expect(e.isSymbol()).toBeTruthy()
		e = p.parse('u_j')
		expect(e.toString()).toEqual('u_j')
		expect(e.isSymbol()).toBeTruthy()
		e = p.parse('u_k')
		expect(e.toString()).toEqual('u_k')
		expect(e.isSymbol()).toBeTruthy()
		e = p.parse('u_m')
		expect(e.toString()).toEqual('u_m')
		expect(e.isSymbol()).toBeTruthy()
		e = p.parse('u_n')
		expect(e.toString()).toEqual('u_n')
		expect(e.isSymbol()).toBeTruthy()
		e = p.parse('u_p')
		expect(e.toString()).toEqual('u_p')
		expect(e.isSymbol()).toBeTruthy()
	})

	test('Parser parses a limit', () => {
		let e = p.parse('infplus')
		expect(e.isLimit()).toBeTruthy()
		expect(e.toString()).toEqual('infplus')

		e = p.parse('infmoins')
		expect(e.toString()).toEqual('infmoins')
		expect(e.isLimit()).toBeTruthy()
		e = p.parse('0plus')
		expect(e.toString()).toEqual('0plus')
		expect(e.isLimit()).toBeTruthy()
		e = p.parse('0moins')
		expect(e.toString()).toEqual('0moins')
		expect(e.isLimit()).toBeTruthy()
		e = p.parse('3/0moins')
		expect(e.isCorrect()).toBeTruthy()
		expect(e.toString()).toEqual('3/0moins')
		e = p.parse('infmoins/0moins')
		expect(e.isCorrect()).toBeTruthy()
	})

	test('Parser parses a negative number', () => {
		const e = p.parse('-1')
		expect(e.toString()).toEqual('-1')
		expect(e.isOpposite()).toBeTruthy()
	})

	test('Parser parses a positive number', () => {
		const e = p.parse('+1')
		expect(e.toString()).toEqual('+1')
		expect(e.isPositive()).toBeTruthy()
	})

	// test('Parser parses multiple signs', () => {
	//   const e = p.parse('+-++-----1')
	//   expect(e.toString()).toEqual('+-++-----1')
	//   expect(e.isPositive()).toBeTruthy()
	// })

	test('Parser parses a bracket', () => {
		const e = p.parse('(3)')
		expect(e.toString()).toEqual('(3)')
		expect(e.isBracket()).toBeTruthy()
	})

	test('Parser parses a radical', () => {
		const e = p.parse('sqrt(25)')
		expect(e.toString()).toEqual('sqrt(25)')
		expect(e.isRadical()).toBeTruthy()
	})

	test('Parser parses an addition', () => {
		const e = p.parse('1+1')
		expect(e.toString()).toEqual('1+1')
		expect(e.isSum()).toBeTruthy()
	})

	// test('Parser parses an addition', () => {
	//   const e = p.parse('1+-1')
	//   expect(e.toString()).toEqual('1+-1')
	//   expect(e.isSum()).toBeTruthy()
	// })

	test('Parser parses a difference', () => {
		const e = p.parse('1-1')
		expect(e.toString()).toEqual('1-1')
		expect(e.isDifference()).toBeTruthy()
	})
	// test('Parser parses a difference', () => {
	//   const e = p.parse('+1-+1')
	//   expect(e.toString()).toEqual('+1-+1')
	//   expect(e.isDifference()).toBeTruthy()
	// })

	test('Parser parses a product', () => {
		const e = p.parse('1*1')
		expect(e.toString()).toEqual('1*1')
		expect(e.isProduct()).toBeTruthy()
	})

	// test('Parser parses a product', () => {
	//   const e = p.parse('-1*+1')
	//   expect(e.toString()).toEqual('-1*+1')
	//   expect(e.isProduct()).toBeTruthy()
	// })

	test('Parser parses a division', () => {
		const e = p.parse('1:1')
		expect(e.toString()).toEqual('1:1')
		expect(e.isDivision()).toBeTruthy()
	})

	// test('Parser parses a division', () => {
	//   const e = p.parse('-1:+1')
	//   expect(e.toString()).toEqual('-1:+1')
	//   expect(e.isDivision()).toBeTruthy()
	// })

	test('Parser parses a quotient', () => {
		const e = p.parse('1/1')
		expect(e.toString()).toEqual('1/1')
		expect(e.isQuotient()).toBeTruthy()
	})
	// test('Parser parses a quotient', () => {
	//   const e = p.parse('-1/+1')
	//   expect(e.toString()).toEqual('-1/+1')
	//   expect(e.isQuotient()).toBeTruthy()
	// })

	test('Parser parses a power', () => {
		const e = p.parse('1^1')
		expect(e.toString()).toEqual('1^1')
		expect(e.isPower()).toBeTruthy()
	})

	test('Parser parses ...', () => {
		const e = p.parse('1/2^3')
		expect(e.toString()).toEqual('1/2^3')
		expect(e.isQuotient()).toBeTruthy()
	})

	test('Parser parses a complex expression', () => {
		const e = p.parse('-(((+3.4+4/3)*2:(-4-5^2)))')
		expect(e.toString()).toEqual('-(((+3.4+4/3)*2:(-4-5^2)))')
	})

	test('Parser parses an equality', () => {
		const e = p.parse('1=1')
		expect(e.toString()).toEqual('1=1')
		expect(e.isEquality()).toBeTruthy()
	})

	test('Parser parses an unequality', () => {
		const e = p.parse('1!=1')
		expect(e.toString()).toEqual('1!=1')
		expect(e.isUnequality()).toBeTruthy()
	})

	test('Parser parses an inequality', () => {
		let e = p.parse('1<1')
		expect(e.toString()).toEqual('1<1')
		expect(e.isInequality()).toBeTruthy()

		e = p.parse('1<=1')
		expect(e.toString()).toEqual('1<=1')
		expect(e.isInequality()).toBeTruthy()

		e = p.parse('1>1')
		expect(e.toString()).toEqual('1>1')
		expect(e.isInequality()).toBeTruthy()

		e = p.parse('1>=1')
		expect(e.toString()).toEqual('1>=1')
		expect(e.isInequality()).toBeTruthy()
	})

	test('Parser parses a relations', () => {
		let e = p.parse('1<2<3')
		// console.log('e', e)
		expect(e.toString()).toEqual('1<2<3')
		// expect(e.isInequaliqty()).toBeTruthy()

		e = p.parse('1<2<=3>4>=5=6')
		// console.log('e', e)
		expect(e.toString()).toEqual('1<2<=3>4>=5=6')
	})

	test('Parser parses functions', () => {
		let e = p.parse('pgcd(12;18)')
		expect(e.string).toEqual('pgcd(12;18)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('mod(15;4)')
		expect(e.string).toEqual('mod(15;4)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('cos(5)')
		expect(e.string).toEqual('cos(5)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('sin(5)')
		expect(e.string).toEqual('sin(5)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('tan(5)')
		expect(e.string).toEqual('tan(5)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('ln(5)')
		expect(e.string).toEqual('ln(5)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('log(5)')
		expect(e.string).toEqual('log(5)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('exp(5)')
		expect(e.string).toEqual('exp(5)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('floor(5.2)')
		expect(e.string).toEqual('floor(5.2)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('abs(-5)')
		expect(e.string).toEqual('abs(-5)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('ln(x)')
		expect(e.string).toEqual('ln(x)')
		expect(e.isFunction()).toBeTruthy()

		e = p.parse('ln(x^2)')
		expect(e.string).toEqual('ln(x^2)')
		expect(e.isFunction()).toBeTruthy()
	})

	test('problem with n', () => {
		const e = p.parse('8-4n')
		expect(e.toString()).toEqual('8-4n')
	})

	test('problem with (-4)^2', () => {
		const e = p.parse('(-4)^2')
		expect(e.toString()).toEqual('(-4)^2')
	})

	test('problem with (-4)^n', () => {
		const e = p.parse('(-4)^n')
		expect(e.toString()).toEqual('(-4)^n')
	})

	test('problem with -3*(-4)^n', () => {
		const e = p.parse('-3*(-4)^n')
		expect(e.toString()).toEqual('-3*(-4)^n')
	})

	test('Parser parses booleans', () => {
		let e = p.parse('true')
		expect(e.string).toEqual('true')
		expect(e.isBoolean()).toBeTruthy()
		expect(e.isTrue()).toBeTruthy()

		e = p.parse('false')
		expect(e.string).toEqual('false')
		expect(e.isBoolean()).toBeTruthy()
		expect(e.isFalse()).toBeTruthy()
	})

	test('Parser parses templates', () => {
		const exps = [
			// '$e',
			// '$er',
			// '$en',
			// '$d',
			// '$dr',

			'$e{2}',
			'$ep{2}',
			'$ei{2}',
			'$er{2}',
			'$epr{2}',
			'$eir{2}',
			'$e{2;4}',
			'$ep{2;4}',
			'$ei{2;4}',
			'$er{2;4}',
			'$epr{2;4}',
			'$eir{2;4}',
			'$e[2;4]',
			'$er[2;4]',
			'$ep[2;4]',
			'$epr[2;4]',
			'$ei[2;4]',
			'$eir[2;4]',

			'$e[2;4]\\{3}',

			// '$d{2;3}',
			// '$d{2:4;3:5}',

			'${1}',
			'$l{1;2}',
			'$l{1;2}\\{2;3}',
		]
		for (const tested of exps) {
			const e = p.parse(tested)
			expect(e.isTemplate()).toBeTruthy()
			expect(e.string).toBe(tested)
		}
	})

	// {nature:, children:}
	test('Parser creates AST', () => {
		const exps = {
			'1+1+1': { children: ['+', 'number'], nature: '+', unit: '' },
			'1+(1+1)': { children: ['number', 'bracket'], nature: '+', unit: '' },
			'(1+1)+1': { children: ['bracket', 'number'], nature: '+', unit: '' },
			'1-(1+1)': { children: ['number', 'bracket'], nature: '-', unit: '' },
			'1+1-1': { children: ['+', 'number'], nature: '-', unit: '' },
			'(1+1)-1': { children: ['bracket', 'number'], nature: '-', unit: '' },
			'1+1*1': { children: ['number', '*'], nature: '+', unit: '' },
			'1+(1*1)': { children: ['number', 'bracket'], nature: '+', unit: '' },
			'1*1+1': { children: ['*', 'number'], nature: '+', unit: '' },
			'(1*1)+1': { children: ['bracket', 'number'], nature: '+', unit: '' },
			'1+1:1': { children: ['number', ':'], nature: '+', unit: '' },
			'1+(1:1)': { children: ['number', 'bracket'], nature: '+', unit: '' },
			'1:1+1': { children: [':', 'number'], nature: '+', unit: '' },
			'(1:1)+1': { children: ['bracket', 'number'], nature: '+', unit: '' },
			'1+1/1': { children: ['number', '/'], nature: '+', unit: '' },
			'1+(1/1)': { children: ['number', 'bracket'], nature: '+', unit: '' },
			'1/1+1': { children: ['/', 'number'], nature: '+', unit: '' },
			'(1/1)+1': { children: ['bracket', 'number'], nature: '+', unit: '' },
			'1^1+1': { children: ['^', 'number'], nature: '+', unit: '' },
			'(1^1)+1': { children: ['bracket', 'number'], nature: '+', unit: '' },
			'1+1^1': { children: ['number', '^'], nature: '+', unit: '' },
			'1+(1^1)': { children: ['number', 'bracket'], nature: '+', unit: '' },

			// '1-(1+1)':'1-(1+1)', duplicate
			// '1+1-1':'1+1-1', duplicate
			'1-(1-1)': { children: ['number', 'bracket'], nature: '-', unit: '' },
			'1-1-1': { children: ['-', 'number'], nature: '-', unit: '' },
			'(1-1)-1': { children: ['bracket', 'number'], nature: '-', unit: '' },
			'1*1-1': { children: ['*', 'number'], nature: '-', unit: '' },
			'(1*1)-1': { children: ['bracket', 'number'], nature: '-', unit: '' },
			'1-1*1': { children: ['number', '*'], nature: '-', unit: '' },
			'1-(1*1)': { children: ['number', 'bracket'], nature: '-', unit: '' },
			'1-1:1': { children: ['number', ':'], nature: '-', unit: '' },
			'1-(1:1)': { children: ['number', 'bracket'], nature: '-', unit: '' },
			'1:1-1': { children: [':', 'number'], nature: '-', unit: '' },
			'(1:1)-1': { children: ['bracket', 'number'], nature: '-', unit: '' },
			'1-1/1': { children: ['number', '/'], nature: '-', unit: '' },
			'1-(1/1)': { children: ['number', 'bracket'], nature: '-', unit: '' },
			'1/1-1': { children: ['/', 'number'], nature: '-', unit: '' },
			'(1/1)-1': { children: ['bracket', 'number'], nature: '-', unit: '' },
			'1^1-1': { children: ['^', 'number'], nature: '-', unit: '' },
			'(1^1)-1': { children: ['bracket', 'number'], nature: '-', unit: '' },
			'1-1^1': { children: ['number', '^'], nature: '-', unit: '' },
			'1-(1^1)': { children: ['number', 'bracket'], nature: '-', unit: '' },

			'1*(1+1)': { children: ['number', 'bracket'], nature: '*', unit: '' },
			'(1+1)*1': { children: ['bracket', 'number'], nature: '*', unit: '' },
			'1*(1-1)': { children: ['number', 'bracket'], nature: '*', unit: '' },
			'(1-1)*1': { children: ['bracket', 'number'], nature: '*', unit: '' },
			'1*1*1': { children: ['*', 'number'], nature: '*', unit: '' },
			'1*(1*1)': { children: ['number', 'bracket'], nature: '*', unit: '' },
			'(1*1)*1': { children: ['bracket', 'number'], nature: '*', unit: '' },
			'1:1*1': { children: [':', 'number'], nature: '*', unit: '' },
			'(1:1)*1': { children: ['bracket', 'number'], nature: '*', unit: '' },
			'1*(1:1)': { children: ['number', 'bracket'], nature: '*', unit: '' },
			'1*1/1': { children: ['*', 'number'], nature: '/', unit: '' },
			'1*(1/1)': { children: ['number', 'bracket'], nature: '*', unit: '' },
			'1/1*1': { children: ['/', 'number'], nature: '*', unit: '' },
			'(1/1)*1': { children: ['bracket', 'number'], nature: '*', unit: '' },
			'1^1*1': { children: ['^', 'number'], nature: '*', unit: '' },
			'(1^1)*1': { children: ['bracket', 'number'], nature: '*', unit: '' },
			'1*1^1': { children: ['number', '^'], nature: '*', unit: '' },
			'1*(1^1)': { children: ['number', 'bracket'], nature: '*', unit: '' },

			'1:(1+1)': { children: ['number', 'bracket'], nature: ':', unit: '' },
			'(1+1):1': { children: ['bracket', 'number'], nature: ':', unit: '' },
			'1:(1-1)': { children: ['number', 'bracket'], nature: ':', unit: '' },
			'(1-1):1': { children: ['bracket', 'number'], nature: ':', unit: '' },
			'1:(1*1)': { children: ['number', 'bracket'], nature: ':', unit: '' },
			'1*1:1': { children: ['*', 'number'], nature: ':', unit: '' },
			'(1*1):1': { children: ['bracket', 'number'], nature: ':', unit: '' },
			'1:1:1': { children: [':', 'number'], nature: ':', unit: '' },
			'1:(1:1)': { children: ['number', 'bracket'], nature: ':', unit: '' },
			'(1:1):1': { children: ['bracket', 'number'], nature: ':', unit: '' },
			'1:(1/1)': { children: ['number', 'bracket'], nature: ':', unit: '' },
			'1:1/1': { children: [':', 'number'], nature: '/', unit: '' },
			'1/1:1': { children: ['/', 'number'], nature: ':', unit: '' },
			'(1/1):1': { children: ['bracket', 'number'], nature: ':', unit: '' },
			'1^1:1': { children: ['^', 'number'], nature: ':', unit: '' },
			'(1^1):1': { children: ['bracket', 'number'], nature: ':', unit: '' },
			'1:1^1': { children: ['number', '^'], nature: ':', unit: '' },
			'1:(1^1)': { children: ['number', 'bracket'], nature: ':', unit: '' },

			'1/(1+1)': { children: ['number', 'bracket'], nature: '/', unit: '' },
			'(1+1)/1': { children: ['bracket', 'number'], nature: '/', unit: '' },
			'1/(1-1)': { children: ['number', 'bracket'], nature: '/', unit: '' },
			'(1-1)/1': { children: ['bracket', 'number'], nature: '/', unit: '' },
			'1/(1*1)': { children: ['number', 'bracket'], nature: '/', unit: '' },
			'(1*1)/1': { children: ['bracket', 'number'], nature: '/', unit: '' },
			'1/(1:1)': { children: ['number', 'bracket'], nature: '/', unit: '' },
			'(1:1)/1': { children: ['bracket', 'number'], nature: '/', unit: '' },
			'1/(1/1)': { children: ['number', 'bracket'], nature: '/', unit: '' },
			'1/1/1': { children: ['/', 'number'], nature: '/', unit: '' },
			'(1/1)/1': { children: ['bracket', 'number'], nature: '/', unit: '' },
			'1^1/1': { children: ['^', 'number'], nature: '/', unit: '' },
			'(1^1)/1': { children: ['bracket', 'number'], nature: '/', unit: '' },
			'1/1^1': { children: ['number', '^'], nature: '/', unit: '' },
			'1/(1^1)': { children: ['number', 'bracket'], nature: '/', unit: '' },

			'1^(1+1)': { children: ['number', 'bracket'], nature: '^', unit: '' },
			'(1+1)^1': { children: ['bracket', 'number'], nature: '^', unit: '' },
			'1^(1-1)': { children: ['number', 'bracket'], nature: '^', unit: '' },
			'(1-1)^1': { children: ['bracket', 'number'], nature: '^', unit: '' },
			'1^(1*1)': { children: ['number', 'bracket'], nature: '^', unit: '' },
			'(1*1)^1': { children: ['bracket', 'number'], nature: '^', unit: '' },
			'1^(1:1)': { children: ['number', 'bracket'], nature: '^', unit: '' },
			'(1:1)^1': { children: ['bracket', 'number'], nature: '^', unit: '' },
			'1^(1/1)': { children: ['number', 'bracket'], nature: '^', unit: '' },
			'1^1^1': { children: ['^', 'number'], nature: '^', unit: '' },
			'1^(1^1)': { children: ['number', 'bracket'], nature: '^', unit: '' },
			'(1^1)^1': { children: ['bracket', 'number'], nature: '^', unit: '' },

			'-1+2': { children: ['opposite', 'number'], nature: '+', unit: '' },
			'(-1)+2': { children: ['bracket', 'number'], nature: '+', unit: '' },
			'-(1+2)': { children: ['bracket'], nature: 'opposite', unit: '' },
			// '1+-2': { children: ['number', 'opposite'], nature: '+' },
			'1+(-2)': { children: ['number', 'bracket'], nature: '+', unit: '' },

			'-1-2': { children: ['opposite', 'number'], nature: '-', unit: '' },
			'(-1)-2': { children: ['bracket', 'number'], nature: '-', unit: '' },
			'-(1-2)': { children: ['bracket'], nature: 'opposite', unit: '' },
			// '1--2': { children: ['number', 'opposite'], nature: '-' },
			'1-(-2)': { children: ['number', 'bracket'], nature: '-', unit: '' },

			'-1*2': { children: ['*'], nature: 'opposite', unit: '' },
			'+1*2': { children: ['*'], nature: 'positive', unit: '' },
			'(-1)*2': { children: ['bracket', 'number'], nature: '*', unit: '' },
			'-(1*2)': { children: ['bracket'], nature: 'opposite', unit: '' },
			// '1*-2': { children: ['number', 'opposite'], nature: '*' },
			'1*(-2)': { children: ['number', 'bracket'], nature: '*', unit: '' },

			'-1:2': { children: [':'], nature: 'opposite', unit: '' },
			'+1:2': { children: [':'], nature: 'positive', unit: '' },
			'(-1):2': { children: ['bracket', 'number'], nature: ':', unit: '' },
			'-(1:2)': { children: ['bracket'], nature: 'opposite', unit: '' },
			// '1:-2': { children: ['number', 'opposite'], nature: ':' },
			'1:(-2)': { children: ['number', 'bracket'], nature: ':', unit: '' },

			'-1/2': { children: ['/'], nature: 'opposite', unit: '' },
			'+1/2': { children: ['/'], nature: 'positive', unit: '' },
			'(-1)/2': { children: ['bracket', 'number'], nature: '/', unit: '' },
			'-(1/2)': { children: ['bracket'], nature: 'opposite', unit: '' },
			// '1/-2': { children: ['number', 'opposite'], nature: '/' },
			'1/(-2)': { children: ['number', 'bracket'], nature: '/', unit: '' },

			abc: { children: ['', 'symbol'], nature: '', unit: '' },
			'ab:c': { children: ['', 'symbol'], nature: ':', unit: '' },
			'ab/c': { children: ['', 'symbol'], nature: '/', unit: '' },
			'ab:c*d': { children: [':', 'symbol'], nature: '*', unit: '' },
			'ab/c*d': { children: ['/', 'symbol'], nature: '*', unit: '' },
			'ab+cd': { children: ['', ''], nature: '+', unit: '' },
			'x^yz': { children: ['^', 'symbol'], nature: '', unit: '' },
			'ax^y': { children: ['symbol', '^'], nature: '', unit: '' },
			'ax^yz': { children: ['', 'symbol'], nature: '', unit: '' },

			'1 cm': { children: null, nature: 'number', unit: 'cm' },
			'{1/2} cm': { children: ['number', 'number'], nature: '/', unit: 'cm' },
		}
		for (const [tested, expected] of Object.entries(exps)) {
			// console.log('tested', tested)
			const e = p.parse(tested)
			expect(e.shallow()).toEqual(expected)
		}
	})

	// a Tester quand la fonction de simplification de fonction sera réécrite
	test.skip('Parser puts brackets where it is needed', () => {
		const exps = {
			'1+1+1': '1+1+1',
			'1+(1+1)': '1+1+1',
			'(1+1)+1': '1+1+1',
			'1-(1+1)': '1-(1+1)',
			'1+1-1': '1+1-1',
			'(1+1)-1': '1+1-1',
			'1+1*1': '1+1*1',
			'1+(1*1)': '1+1*1',
			'1*1+1': '1*1+1',
			'(1*1)+1': '1*1+1',
			'1+1:1': '1+1:1',
			'1+(1:1)': '1+1:1',
			'1:1+1': '1:1+1',
			'(1:1)+1': '1:1+1',
			'1+1/1': '1+1/1',
			'1+(1/1)': '1+1/1',
			'1/1+1': '1/1+1',
			'(1/1)+1': '1/1+1',
			'1^1+1': '1^1+1',
			'(1^1)+1': '1^1+1',
			'1+1^1': '1+1^1',
			'1+(1^1)': '1+1^1',

			// '1-(1+1)':'1-(1+1)', duplicate
			// '1+1-1':'1+1-1', duplicate
			'1-(1-1)': '1-(1-1)',
			'1-1-1': '1-1-1',
			'(1-1)-1': '1-1-1',
			'1*1-1': '1*1-1',
			'(1*1)-1': '1*1-1',
			'1-1*1': '1-1*1',
			'1-(1*1)': '1-1*1',
			'1-1:1': '1-1:1',
			'1-(1:1)': '1-1:1',
			'1:1-1': '1:1-1',
			'(1:1)-1': '1:1-1',
			'1-1/1': '1-1/1',
			'1-(1/1)': '1-1/1',
			'1/1-1': '1/1-1',
			'(1/1)-1': '1/1-1',
			'1^1-1': '1^1-1',
			'(1^1)-1': '1^1-1',
			'1-1^1': '1-1^1',
			'1-(1^1)': '1-1^1',

			'1*(1+1)': '1*(1+1)',
			'(1+1)*1': '(1+1)*1',
			'1*(1-1)': '1*(1-1)',
			'(1-1)*1': '(1-1)*1',
			'1*1*1': '1*1*1',
			'1*(1*1)': '1*1*1',
			'(1*1)*1': '1*1*1',
			'1:1*1': '1:1*1',
			'(1:1)*1': '1:1*1',
			'1*(1:1)': '1*1:1',
			'1*1/1': '1*1/1',
			'1*(1/1)': '1*1/1',
			'1/1*1': '1/1*1',
			'(1/1)*1': '1/1*1',
			'1^1*1': '1^1*1',
			'(1^1)*1': '1^1*1',
			'1*1^1': '1*1^1',
			'1*(1^1)': '1*1^1',

			'1:(1+1)': '1:(1+1)',
			'(1+1):1': '(1+1):1',
			'1:(1-1)': '1:(1-1)',
			'(1-1):1': '(1-1):1',
			'1:(1*1)': '1:(1*1)',
			'1*1:1': '1*1:1',
			'(1*1):1': '1*1:1',
			'1:1:1': '1:1:1',
			'1:(1:1)': '1:(1:1)',
			'(1:1):1': '1:1:1',
			'1:(1/1)': '1:1/1',
			'1:1/1': '1:1/1',
			'1/1:1': '1/1:1',
			'(1/1):1': '1/1:1',
			'1^1:1': '1^1:1',
			'(1^1):1': '1^1:1',
			'1:1^1': '1:1^1',
			'1:(1^1)': '1:1^1',

			'1/(1+1)': '1/(1+1)',
			'(1+1)/1': '(1+1)/1',
			'1/(1-1)': '1/(1-1)',
			'(1-1)/1': '(1-1)/1',
			'1/(1*1)': '1/(1*1)',
			'(1*1)/1': '(1*1)/1',
			'1/(1:1)': '1/(1:1)',
			'(1:1)/1': '(1:1)/1',
			'1/(1/1)': '1/(1/1)',
			'1/1/1': '1/1/1',
			'(1/1)/1': '1/1/1',
			'1^1/1': '1^1/1',
			'(1^1)/1': '1^1/1',
			'1/1^1': '1/1^1',
			'1/(1^1)': '1/1^1',

			'1^(1+1)': '1^(1+1)',
			'(1+1)^1': '(1+1)^1',
			'1^(1-1)': '1^(1-1)',
			'(1-1)^1': '(1-1)^1',
			'1^(1*1)': '1^(1*1)',
			'(1*1)^1': '(1*1)^1',
			'1^(1:1)': '1^(1:1)',
			'(1:1)^1': '(1:1)^1',
			'1^(1/1)': '1^(1/1)',
			'1^1^1': '1^1^1',
			'1^(1^1)': '1^(1^1)',
			'(1^1)^1': '1^1^1',
		}
		for (const [tested, expected] of Object.entries(exps)) {
			const e = p.parse(tested)
			expect(e.toString()).toEqual(expected)
		}
	})
})

describe('Implicit products', () => {
	const p = parser()

	test('Parser recognises a simple implicit product', () => {
		const e = p.parse('2abc')
		// const structure = { children: ['number', 'symbol', 'symbol'], nature: '*' }
		expect(e.isProduct()).toBeTruthy()
		expect(e.toString()).toEqual('2abc')
		// expect(e.showShallowStructure()).toEqual(structure)
	})

	test('Parser recognises a simple implicit product with *', () => {
		const e = p.parse('2ab*cab')
		// const structure = { children: ['number', 'symbol', 'symbol'], nature: '*' }
		expect(e.isProduct()).toBeTruthy()
		expect(e.toString()).toEqual('2ab*cab')
		// expect(e.showShallowStructure()).toEqual(structure)
	})

	test('Parser recognises a simple implicit product with +', () => {
		const e = p.parse('2ab+cab')
		// const structure = { children: ['number', 'symbol', 'symbol'], nature: '*' }
		expect(e.isSum()).toBeTruthy()
		expect(e.toString()).toEqual('2ab+cab')
		// expect(e.showShallowStructure()).toEqual(structure)
	})

	test('Parser recognises a simple implicit product with -', () => {
		const e = p.parse('2ab-cab')
		// const structure = { children: ['number', 'symbol', 'symbol'], nature: '*' }
		expect(e.isDifference()).toBeTruthy()
		expect(e.toString()).toEqual('2ab-cab')
		// expect(e.showShallowStructure()).toEqual(structure)
	})

	test('Parser recognises an implicit product with :', () => {
		const e = p.parse('ab:b*cad')
		// const structure = { children: ['*', '*'], nature: ':' }
		expect(e.isProduct()).toBeTruthy()
		expect(e.toString()).toEqual('ab:b*cad')
		// expect(e.showShallowStructure()).toEqual(structure)
	})

	test('Parser recognises an implicit product with /', () => {
		const e = p.parse('ab/b*c')
		// const structure = { children: ['*', '*'], nature: '/' }
		expect(e.isProduct()).toBeTruthy()
		expect(e.toString()).toEqual('ab/b*c')
		// expect(e.showShallowStructure()).toEqual(structure)
	})

	test('Parser recognises an implicit product with all', () => {
		const e = p.parse('ab/b*c:f*ra')
		// const structure = { children: ['*', '*'], nature: '/' }
		expect(e.isProduct()).toBeTruthy()
		expect(e.toString()).toEqual('ab/b*c:f*ra')
		// expect(e.showShallowStructure()).toEqual(structure)
	})

	test('Parser recognises an implicit product with ^', () => {
		const e = p.parse('2x^3y')
		// const structure = { children: ['number', '^', 'symbol'], nature: '*' }
		expect(e.isProduct()).toBeTruthy()
		expect(e.toString()).toEqual('2x^3y')
		// expect(e.showShallowStructure()).toEqual(structure)
	})
})

describe('Testing parsing units', () => {
	const p = parser()
	const exps = {
		'1 Qr': '1 Qr',
		'1 €': '1 €',
		'1 k€': '1 k€',
		'1 mL': '1 mL',
		'1 cL': '1 cL',
		'1 dL': '1 dL',
		'1 L': '1 L',
		'1 daL': '1 daL',
		'1 hL': '1 hL',
		'1 kL': '1 kL',
		'0 mm': '0 mm',
		'1 mm': '1 mm',
		'1 cm': '1 cm',
		'1 dm': '1 dm',
		'1 m': '1 m',
		'1 dam': '1 dam',
		'1 hm': '1 hm',
		'1 km': '1 km',
		'1 mg': '1 mg',
		'1 cg': '1 cg',
		'1 dg': '1 dg',
		'1 g': '1 g',
		'1 dag': '1 dag',
		'1 hg': '1 hg',
		'1 kg': '1 kg',
		'1 q': '1 q',
		'1 t': '1 t',
		'1 an 2 mois 3 semaines 4 jours 5 h 6 min 7 s 8 ms':
			'1 ans 2 mois 3 semaines 4 jours 5 h 6 min 7 s 8 ms',
		'1 an 1 mois 1 semaine 1 jour 1 h 1 min 1 s 1 ms':
			'1 ans 1 mois 1 semaines 1 jours 1 h 1 min 1 s 1 ms',
		'2 an 2 mois 2 semaine 2 jour 2 h 2 min 2 s 2 ms':
			'2 ans 2 mois 2 semaines 2 jours 2 h 2 min 2 s 2 ms',
		'2 h 3 min 4 s': '2 h 3 min 4 s',
		'0 s': '0 s',
		'1 ms': '1 ms',
		'1 s': '1 s',
		'1 min': '1 min',
		'1 h': '1 h',
		'1 jour': '1 jours',
		'1 semaine': '1 semaines',
		'1 an': '1 ans',
		'1 °': '1 °',
		'1 cm + 1 cm': '1 cm+1 cm',
		'1 cm + 1 cm + 1 cm': '1 cm+1 cm+1 cm',
		'3 cm + 5 cm ': '3 cm+5 cm',
		'1 km + 1 cm ': '1 km+1 cm',
		'1 km - 1 cm ': '1 km-1 cm',
		'1 km * 1 cm ': '1 km*1 cm',
		'1 km : 1 cm ': '1 km:1 cm',
		'1 km / 1 cm ': '1 km/1 cm',
		'1 cm.cm': '1 cm.cm',
		'1 cm^2': '1 cm^2',
		'1 cm^(-2)': '1 cm^(-2)',
		'1 cm^2.cm': '1 cm^2.cm',
		'1 cm^2.cm^2': '1 cm^2.cm^2',
		'1 cm^2.cm^(-2)': '1 cm^2.cm^(-2)',
		'1 t.cm^(-2)': '1 t.cm^(-2)',
		'1 cm.t^(-2)': '1 cm.t^(-2)',
		'1 kg.m^(-2)': '1 kg.m^(-2)',
		'1 km.ms^(-1)': '1 km.ms^(-1)',
		'1 km.h^(-1)': '1 km.h^(-1)',
		'1 km.h^{-1}': '1 km.h^{-1}',
		'1 km.ans^(-1)': '1 km.ans^(-1)',
		'1 km.min^(-1)': '1 km.min^(-1)',
		'1 km.s^(-1)': '1 km.s^(-1)',
		'(1+2) cm': '(1+2) cm',
		'(1*2) cm': '(1*2) cm',
		'1*2 cm': '1*2 cm',
		'1*(2 cm)': '1*(2 cm)',
		'1 cm * 2': '1 cm*2',
		'(1 cm) * 2': '(1 cm)*2',
		'(1-2) cm': '(1-2) cm',
		'(1:2) cm': '(1:2) cm',
		'1:2 cm': '1:2 cm',
		'1:(2 cm)': '1:(2 cm)',
		'1 cm:2': '1 cm:2',
		'(1/2) cm': '(1/2) cm',
		'1/2 cm': '1/2 cm',
		'a cm': 'a cm',
		'1 km = 1000 m': '1 km=1000 m',
		'$e[2;9] km': '$e[2;9] km',
	}

	// TODO : division par 0
	for (const [tested, expected] of Object.entries(exps)) {
		test(`parsing ${tested}`, () => {
			const e = p.parse(tested)
			expect(e.isCorrect()).toBe(true)
			expect(p.parse(tested).string).toBe(expected)
		})
	}
})

describe('Testing incorrect expressions ', () => {
	const p = parser()
	const exps = [
		'1 cm + 1',
		'1L + 1m',
		'1 cm cm',
		// '(2cm + 5 cm) cm',
		'1++1',
		'1--1',
		'1+-1',
		'1**1',
		'a2',
		'1 cm a',
	]

	for (const tested of exps) {
		test(`parsing ${tested}`, () => {
			const e = p.parse(tested)
			expect(e.isCorrect()).toBe(false)
		})
	}
})
