import { Decimal } from 'decimal.js'
import {
	pgcd,
	primeFactors,
	RadicalReduction,
	// roundDecimal,
} from '../src/utils/utils'

// describe('Testing rounding', () => {
// 	const t = [
// 		[5.2346, 2, '5.23'],
// 		[5.2356, 2, '5.24'],
// 		[5.2, 2, '5.2'],
// 	]

// 	test.each(t)('rounding %s', (n, d, expected) => {
// 		expect(roundDecimal(new Decimal(n), 2).toString()).toBe(expected)
// 	})
// })

describe('Testing radical reduction', () => {
	const t = [
		[2, 1],
		[4, 2],
		[20, 2],
		[32, 4],
		[45, 3],
	]
	test.each(t)('reduction %s', (n, expected) => {
		expect(RadicalReduction(n)).toBe(expected)
	})
})

describe('Testing pgcd', () => {
	const t = [
		[[new Decimal(0), new Decimal(5)], '5'],
		[[new Decimal(5), new Decimal(0)], '5'],
		[[new Decimal(10), new Decimal(15)], '5'],
		[[new Decimal(18), new Decimal(24)], '6'],
		[[new Decimal(18), new Decimal(24), new Decimal(30), new Decimal(42)], '6'],
	]

	test.each(t)('rounding %s', (numbers: Decimal[], expected: string) => {
		expect(pgcd(numbers).toString()).toBe(expected)
	})
})

describe('Testing prime factorization', () => {
	const t = [
		[1, [[1, 1]]],
		[2, [[2, 1]]],
		[
			1234567890,
			[
				[2, 1],
				[3, 2],
				[5, 1],
				[3607, 1],
				[3803, 1],
			],
		],
	]
	test.each(t)('fatorize %s', (n: number, expected: [number, number][]) => {
		expect(primeFactors(n)).toStrictEqual(expected)
	})
})
