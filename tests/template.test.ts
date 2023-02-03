import { math } from '../src/math/math'

describe('Testing matching against Templates', () => {
	const t = [
		['2', '2', true],
		['2', '3', false],
		['2', '?', false],
		['2', 'a', false],
		['2', '-2', false],
		['2', '2+3', false],
		['2', '2-3', false],
		['2', '2*3', false],
		['2', '2:3', false],
		['2', '2/3', false],
		['2', '2^3', false],

		['a', 'a', true],
		['a', 'b', false],
		['a', '?', false],
		['a', 'é', false],
		['a', '-a', false],
		['a', 'a+3', false],
		['a', 'a-3', false],
		['a', 'a*3', false],
		['a', 'a:3', false],
		['a', 'a/3', false],
		['a', 'a^3', false],

		['?', '?', true],
		['?', '3', false],
		['?', 'a', false],
		['?', '-?', false],
		['?', '?+3', false],
		['?', '?-3', false],
		['?', '?*3', false],
		['?', '?:3', false],
		['?', '?/3', false],
		['?', '?^3', false],

		['-2', '-2', true],
		['-2', '2', false],
		['-2', '?', false],
		['-2', 'a', false],
		['-2', '-2+3', false],
		['-2', '-2-3', false],
		['-2', '-2*3', false],
		['-2', '-2:3', false],
		['-2', '-2/3', false],
		['-2', '-2^3', false],

		['2+3', '2+3', true],
		['2-3', '2-3', true],
		['2*3', '2*3', true],
		['2/3', '2/3', true],
		['2:3', '2:3', true],
		['2^3', '2^3', true],

		['2', '$e', true],
		['2.2', '$e', false],
		['2', '$er', true],
		['-2', '$er', true],
		['-2.2', '$er', false],
		['2.2', '$er', false],
		['0', '$e', true],
		['0', '$er', true],
		['2', '$ep', true],
		['3', '$ep', false],
		['2', '$ei', false],
		['3', '$ei', true],
		['2', '$epr', true],
		['3', '$epr', false],
		['2', '$eir', false],
		['3', '$eir', true],
		['-2', '$epr', true],
		['-3', '$epr', false],
		['-2', '$eir', false],
		['-3', '$eir', true],

		['0', '$e{0}', true],
		['0', '$e{0;0}', true],
		['0', '$e{1}', true],
		['0', '$e{0;1}', true],
		['0', '$e{1;1}', false],
		['2', '$e{1}', true],
		['2', '$e{1;1}', true],
		['2', '$e{0;1}', true],
		['2', '$er{1}', true],
		['2', '$epr{1}', true],
		['2', '$eir{1}', false],
		['2', '$er{1;1}', true],
		['-2', '$er{1}', true],
		['-2', '$er{1;1}', true],
		['-2', '$epr{1;1}', true],
		['-2', '$eir{1;1}', false],
		['24', '$e{1}', false],
		['24', '$e{1;1}', false],

		['2', '$e[2;2]', true],
		['2', '$e[2;3]', true],
		['2', '$e[1;2]', true],
		['4', '$e[2;3]', false],
		['1', '$e[2;3]', false],

		['123.1', '$d{3;1}', true],
		['123.12', '$d{3;1}', false],
		['12.1', '$d{3;1}', false],
		['123.0', '$d{3;1}', false],
		['120.1', '$d{3;1}', true],
		['0123.1', '$d{3;1}', true],
		['123.1', '$d{3;2}', false],
		['123.10', '$d{3;2}', false],
	]

	test.each(t)('is %s matching %s', (e, f, expected) => {
		expect(math(e as string).matchTemplate(math(f as string))).toBe(expected)
	})
})
