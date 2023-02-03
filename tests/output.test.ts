// function formatNumber(num) {

import { math } from '../src/math/math'

//   ;let [int,dec] = num.toString().split('.')
//   int = int.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1\\,')
//   if (dec) dec = dec.replace(/\d{3}(?=\d)/g, '$&\\,')
//   // if (dec) dec = dec.replace(/(\d)(?<=(?<!\d)(\d{3})+)/g, '$1\\,')
//   return dec ? int+','+dec : int
// }

// console.log(formatNumber(123456789.123456789))

describe('Testing error output', () => {
	const t = [
		//   ['3/4', '\\frac{3}{4}'],
		['<', '<', '\\lt'],
		['>', '>', '\\gt'],
	]

	test.each(t)('exporting %s to asciimath', (e, expected, expected2) => {
		expect(math(e).isIncorrect()).toBeTruthy()
		expect(math(e).string).toBe(expected)
		expect(math(e).latex).toBe(expected2)
	})
})

describe('Testing asciimath export', () => {
	const t = [
		//   ['3/4', '\\frac{3}{4}'],
		['3%', '3%'],
		['3%+4%', '3%+4%'],
		['2x', '2x'],
		['2*x', '2*x'],
		['2:x', '2:x'],
		['2/x', '2/x'],
		['1/{2-3}', '1/{2-3}'],
		['{-1}/{-3}', '{-1}/{-3}'],
		['{2+3}/{2-3}', '{2+3}/{2-3}'],
		['{2/3}x', '{2/3}x'],
		['2^{-4}', '2^{-4}'],
		['2^{3+4}', '2^{3+4}'],
	]

	test.each(t)('exporting %s to asciimath', (e, expected) => {
		expect(math(e).string).toBe(expected)
	})
})

describe('Testing expression with indices', () => {
	const t = [
		//   ['3/4', '\\frac{3}{4}'],
		['u_n', 'u_n'],
		['u_n+3', 'u_n+3'],
		['4u_n+3', '4u_n+3'],
		['u_nv_n', 'u_nv_n'],
		['u_n/v_n', 'u_n/v_n'],
		['u_n=5', 'u_n=5'],
		['u_{n+1}=u_n+2', 'u_{n+1}=u_n+2'],
	]

	test.each(t)('%s gives %s', (e, expected) => {
		expect(math(e).string).toBe(expected)
	})
})

describe('Testing latex export', () => {
	const t = [
		['(3/4)', '\\left(\\dfrac{3}{4}\\right)'],
		['3+4=3/4', '3+4=\\dfrac{3}{4}'],
		['3%', '3\\%'],
		['3%+4%', '3\\%+4\\%'],
		['0.012 345 678 912 345 6', '0{,}012\\,345\\,678\\,912\\,345\\,6'],
		['0.0123456789123456', '0{,}012\\,345\\,678\\,912\\,345\\,6'],
		['{3/4}x', '\\dfrac{3}{4}x'],
		['1 2', '12'],
		['5 km', '5\\,km'],
		['abs(5)', '\\left\\lvert 5 \\right\\rvert'],
	]

	test.each(t)('exporting %s to latex', (e, expected) => {
		expect(math(e).latex).toBe(expected)
	})
})

describe('Testing latex export (no add spaces)', () => {
	const t = [
		['0.012 345 678 912 345 6', '0{,}012\\,345\\,678\\,912\\,345\\,6'],
		['0.0123456789123456', '0{,}0123456789123456'],
		['{3/4}x', '\\dfrac{3}{4}x'],
		['1 2', '1\\,2'],
		['5 km', '5\\,km'],
	]

	test.each(t)('exporting %s to latex (no add spaces)', (e, expected) => {
		expect(math(e).toLatex({ addSpaces: false })).toBe(expected)
	})
})

describe('Testing export with option implicit product', () => {
	const t = [
		['3*a', '3a'],
		['3*(2+5)', '3(2+5)'],
		['3*a^2', '3a^2'],
		['3(-2)^2', '3(-2)^2'],
		['3*5', '3*5'],
	]

	test.each(t)('exporting %s to asciimath', (e, expected) => {
		expect(math(e).toString({ implicit: true })).toBe(expected)
	})
})
