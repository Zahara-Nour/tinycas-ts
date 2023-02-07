console.log('module output')
import {
	Node,
	isLimit,
	isRelations,
	isTime,
	isSegmentLength,
	isEquality,
	isUnequality,
	isInequalityLess,
	isInequalityLessOrEqual,
	isInequalityMore,
	isInequalityMoreOrEQual,
	isPercentage,
	isPositive,
	isOpposite,
	isRadical,
	isCos,
	isSin,
	isTan,
	isLn,
	isLog,
	isExp,
	isFloor,
	isMod,
	isBracket,
	isDifference,
	isPower,
	isDivision,
	isQuotient,
	isSum,
	isProduct,
	isProductImplicit,
	isProductPoint,
	isIdentifier,
	isSymbol,
	isNumber,
	isHole,
	isIncorrectExp,
	isPGCD,
	isBoolean,
	isTemplate,
	isMin,
	isMinP,
	isMax,
	isMaxP,
	isAbs,
	ToStringArg,
	ToLatexArg,
	ToTexmacsArg,
	isFunction,
	Numbr,
} from './types'

/* 
Doit produire la même chaîne que celle qui été utilisée pour créer l'expression */

function canUseImplicitProduct(exp: Node) {
	return (
		isBracket(exp) ||
		isFunction(exp) ||
		isSymbol(exp) ||
		(isPower(exp) && exp.first.isSymbol())
	)
}

export function text(e: Node, options: ToStringArg) {
	let s = ''

	// console.log('isUnit', options.isUnit)

	if (isLimit(e)) {
		if (e.first.isSymbol()) {
			s = e.first.string + (e.sign === '+' ? 'plus' : 'moins')
		} else {
			s = e.first.string + (e.sign === '+' ? 'plus' : 'moins')
		}
	} else if (isRelations(e)) {
		s = e.first.toString(options)
		e.ops.forEach((op, i) => {
			s += op
			s += e.children[i + 1].toString(options)
		})
	} else if (isTime(e)) {
		// format = options.formatTime

		s = ''
		if (e.children[0] && !e.children[0].isZero()) {
			s += e.children[0]
			s += ' '
		}
		if (e.children[1] && !e.children[1].isZero()) {
			s += e.children[1]
			s += ' '
		}
		if (e.children[2] && !e.children[2].isZero()) {
			s += e.children[2]
			s += ' '
		}
		if (e.children[3] && !e.children[3].isZero()) {
			s += e.children[3]
			s += ' '
		}
		if (e.children[4] && !e.children[4].isZero()) {
			s += e.children[4]
			s += ' '
		}
		if (e.children[5] && !e.children[5].isZero()) {
			s += e.children[5]
			s += ' '
		}
		if (e.children[6] && !e.children[6].isZero()) {
			s += e.children[6]
			s += ' '
		}
		if (e.children[7] && !e.children[7].isZero()) {
			s += e.children[7]
			s += ' '
		}
		s = s.trim()
	} else if (isSegmentLength(e)) {
		s = e.begin + e.end
	} else if (
		isEquality(e) ||
		isUnequality(e) ||
		isInequalityLess(e) ||
		isInequalityLessOrEqual(e) ||
		isInequalityMore(e) ||
		isInequalityMoreOrEQual(e)
	) {
		s = e.first.toString(options) + e.type + e.last.toString(options)
	} else if (isPercentage(e)) {
		s = e.first.toString(options) + '%'
	} else if (isPositive(e)) {
		s = '+' + e.first.toString(options)
	} else if (isOpposite(e)) {
		const needBrackets =
			options.addBrackets && (e.first.isOpposite() || e.first.isPositive())

		s = '-'
		if (needBrackets) {
			s += '('
		}
		s += e.first.toString(options)
		if (needBrackets) {
			s += ')'
		}
	} else if (
		isRadical(e) ||
		isCos(e) ||
		isSin(e) ||
		isTan(e) ||
		isLn(e) ||
		isLog(e) ||
		isExp(e) ||
		isFloor(e)
	) {
		s = e.type + '(' + e.first.toString(options) + ')'
	} else if (isBracket(e)) {
		s = '(' + e.first.toString(options) + ')'
	} else if (isDifference(e)) {
		s = e.first.toString(options) + '-' + e.last.toString(options)
	} else if (isPower(e)) {
		s = e.last.toString(options)
		if (
			!(
				e.last.isSymbol() ||
				e.last.isNumber() ||
				e.last.isHole() ||
				e.last.isBracket()
			)
		) {
			s = '{' + s + '}'
		}
		s = e.first.toString(options) + '^' + s
	} else if (isDivision(e)) {
		s = e.first.toString(options) + ':' + e.last.toString(options)
	} else if (isQuotient(e)) {
		let s1 = e.first.toString(options)
		let s2 = e.last.toString(options)
		if (e.first.isOpposite() || e.first.isSum() || e.first.isDifference()) {
			s1 = '{' + s1 + '}'
		}
		if (
			e.last.isOpposite() ||
			e.last.isSum() ||
			e.last.isDifference() ||
			e.last.isProduct() ||
			e.last.isDivision() ||
			e.last.isQuotient()
		) {
			s2 = '{' + s2 + '}'
		}
		s = s1 + '/' + s2
	} else if (isSum(e)) {
		s = e.children.map((child) => child.toString(options)).join(e.type)
	} else if (isProduct(e)) {
		s =
			e.first.toString(options) +
			(options.isUnit
				? '.'
				: options.implicit && canUseImplicitProduct(e.last)
				? ''
				: e.type) +
			e.last.toString(options)
		// s = e.children
		//   .map(child => child.toString(options))
		//   .join(options.isUnit ? '.' : options.implicit ? '' : e.type)
		// console.log('isunit PRODUCT', options.isUnit, s)
	} else if (isProductImplicit(e)) {
		s = e.children
			.map((child) =>
				child.isQuotient()
					? '{' + child.toString(options) + '}'
					: child.toString(options),
			)
			.join('')
	} else if (isProductPoint(e)) {
		s = e.children.map((child) => child.toString(options)).join(e.type)
		// console.log('isunit IMPLCITI POINT', options.isUnit, s)
	} else if (isIdentifier(e)) {
		s = e.name
	} else if (isSymbol(e)) {
		s = e.symbol
	} else if (isNumber(e)) {
		// s = e.value.toString()
		// if (e.value.toString() !== e.input) {
		//   console.log(`difference _${e.value.toString()}_ _${e.input}_`, typeof e.value.toString(), typeof e.input )
		// }
		s = e.input
		if (options.comma) {
			s = s.replace('.', ',')
		}
	} else if (isHole(e)) {
		s = '?'
	} else if (isIncorrectExp(e)) {
		s = e.input || ''
		// s = 'Error :\n' + e.error.message + ' ' + e.error.input

		// case TYPE_NORMAL:
		//   s = e.n.string + '/' + +e.d.string
		//   break
	} else if (isPGCD(e)) {
		s =
			'pgcd(' + e.first.toString(options) + ';' + e.last.toString(options) + ')'
	} else if (isMod(e)) {
		s =
			'mod(' + e.first.toString(options) + ';' + e.last.toString(options) + ')'
	} else if (isBoolean(e)) {
		s = e.boolvalue.toString()
	} else if (isTemplate(e)) {
		s = e.nature
		if (e.relative) s += 'r'
		if (e.signed) s += 's'
		switch (e.nature) {
			case '$e':
			case '$ep':
			case '$ei':
				if (!(e.children[0].isHole() && e.children[1].isHole())) {
					s += `{${
						!e.children[0].isHole() ? e.children[0].toString(options) + ';' : ''
					}${e.children[1].toString(options)}}`
				} else {
					s += `[${e.children[2].toString(options)};${e.children[3].toString(
						options,
					)}]`
				}
				if (e.exclude) {
					s +=
						'\\{' +
						e.exclude.map((child) => child.toString(options)).join(';') +
						'}'
				}
				if (e.excludeMin) {
					s += '\\[' + e.excludeMin + ';' + e.excludeMax + ']'
				}
				break

			case '$d':
			case '$dr':
			case '$dn':
				// TODO: a refaire
				// if (e.max_e) {
				// 	if (e.min_e) {
				// 		s += `{${e.min_e}:${e.max_e};`
				// 	} else {
				// 		s += `{${e.max_e};`
				// 	}
				// 	if (e.min_d) {
				// 		s += `${e.min_d}:${e.max_d}}`
				// 	} else {
				// 		s += `${e.max_d}}`
				// 	}
				// }
				break
			case '$l':
				s +=
					'{' +
					e.children.map((child) => child.toString(options)).join(';') +
					'}'
				if (e.exclude) {
					s +=
						'\\{' +
						e.exclude.map((child) => child.toString(options)).join(';') +
						'}'
				}
				if (e.excludeMin) {
					s += '\\[' + e.excludeMin + ';' + e.excludeMax + ']'
				}

				break

			case '$':
				s += '{' + e.first.toString(options) + '}'
		}
	} else if (isMin(e) || isMinP(e) || isMax(e) || isMaxP(e)) {
		s = e.type + '(' + e.first.string + ';' + e.last.string + ')'
	}

	if (e.unit && options.displayUnit) {
		if (
			!(
				e.isSymbol() ||
				e.isNumber() ||
				e.isBracket() ||
				e.isHole() ||
				e.isTemplate()
			)
		) {
			s = '{' + s + '}'
		}
		s += ' ' + e.unit.string
	}
	// if (options.isUnit) console.log('-> isUnit', s)
	return s
}

export function latex(e: Node, options: ToLatexArg) {
	let s: string

	if (isLimit(e)) {
		if (e.first.isSymbol()) {
			s = e.sign + '\\infin'
		} else {
			s = e.first.string + '^' + e.sign
		}
	}
	if (isAbs(e)) {
		s = '\\left\\lvert ' + e.first.toLatex(options) + ' \\right\\rvert'
	} else if (isTime(e)) {
		// format = options.formatTime

		s = ''
		if (e.children[0] && !e.children[0].isZero()) {
			s += e.children[0].toLatex(options)
			s += '\\,'
		}
		if (e.children[1] && !e.children[1].isZero()) {
			s += e.children[1].toLatex(options)
			s += '\\,'
		}
		if (e.children[2] && !e.children[2].isZero()) {
			s += e.children[2].toLatex(options)
			s += '\\,'
		}
		if (e.children[3] && !e.children[3].isZero()) {
			s += e.children[3].toLatex(options)
			s += '\\,'
		}
		if (e.children[4] && !e.children[4].isZero()) {
			s += e.children[4].toLatex(options)
			s += '\\,'
		}
		if (e.children[5] && !e.children[5].isZero()) {
			if ((e.children[5] as Numbr).value.lessThan(10)) {
				s += '0' + e.children[5].toLatex(options)
			} else {
				s += e.children[5].toLatex(options)
			}
			s += '\\,'
		}
		if (e.children[6] && !e.children[6].isZero()) {
			s += e.children[6].toLatex(options)
			s += '\\,'
		}
		if (e.children[7] && !e.children[7].isZero()) {
			s += e.children[7].toLatex(options)
			s += '\\,'
		}
	} else if (isSegmentLength(e)) {
		s = e.begin + e.end
	} else if (isRelations(e)) {
		s = e.first.toLatex(options)
		e.ops.forEach((op, i) => {
			s += op
			s += e.children[i + 1].toLatex(options)
		})
	} else if (
		isEquality(e) ||
		isUnequality(e) ||
		isInequalityLess(e) ||
		isInequalityLessOrEqual(e) ||
		isInequalityMore(e) ||
		isInequalityMoreOrEQual(e)
	) {
		s = e.first.toLatex(options) + e.type + e.last.toLatex(options)
	} else if (isPercentage(e)) {
		s = e.first.toLatex(options) + '\\%'
	} else if (isRadical(e)) {
		s = '\\sqrt{' + e.first.toLatex(options) + '}'
	} else if (isBracket(e)) {
		// const quotient = e.first.isQuotient()
		// s = !quotient ? '\\left(' : ''
		s = '\\left('
		s += e.first.toLatex(options)
		// if (!quotient) {
		s += '\\right)'
		// }
	} else if (isPositive(e)) {
		const needBrackets =
			options.addBrackets && (e.first.isOpposite() || e.first.isPositive())

		s = '+'
		if (needBrackets) {
			s += '\\left('
		}
		s += e.first.toLatex(options)
		if (needBrackets) {
			s += '\\right)'
		}
	} else if (isOpposite(e)) {
		const needBrackets =
			options.addBrackets &&
			(e.first.isSum() ||
				e.first.isDifference() ||
				e.first.isOpposite() ||
				e.first.isPositive())

		s = '-'
		if (needBrackets) {
			s += '\\left('
		}

		s += e.first.toLatex(options)
		if (needBrackets) {
			s += '\\right)'
		}
	} else if (isDifference(e)) {
		const needBrackets =
			options.addBrackets &&
			(e.last.isSum() ||
				e.last.isDifference() ||
				e.last.isOpposite() ||
				e.last.isPositive())

		s = e.first.toLatex(options) + '-'

		if (needBrackets) {
			s += '\\left('
		}
		s += e.last.toLatex(options)
		if (needBrackets) {
			s += '\\right)'
		}
	} else if (isSum(e)) {
		const needBrackets =
			options.addBrackets && (e.last.isOpposite() || e.last.isPositive())

		s = e.first.toLatex(options) + '+'

		if (needBrackets) {
			s += '\\left('
		}
		s += e.last.toLatex(options)
		if (needBrackets) {
			s += '\\right)'
		}
	} else if (isPower(e)) {
		// console.log('e', e.string)
		// console.log('e.first', e.first.toLatex(options))
		s = e.first.toLatex(options) + '^{' + e.last.toLatex(options) + '}'
		// console.log('s', s)
	} else if (isDivision(e)) {
		s = e.first.toLatex(options) + '\\div' + e.last.toLatex(options)
	} else if (isQuotient(e)) {
		s =
			'\\dfrac{' +
			(isBracket(e.first)
				? e.first.first.toLatex(options)
				: e.first.toLatex(options)) +
			'}{' +
			(isBracket(e.last)
				? e.last.first.toLatex(options)
				: e.last.toLatex(options)) +
			'}'
	} else if (isProduct(e)) {
		let a = e.first
		let b = e.last
		if (isBracket(a) && a.first.isQuotient()) a = a.first
		if (isBracket(b) && b.first.isQuotient()) b = b.first
		s =
			a.toLatex(options) +
			(options.implicit ? '' : '\\times ') +
			b.toLatex(options)
	} else if (isProductImplicit(e)) {
		s = e.children.map((child) => child.toLatex(options)).join('')
	} else if (isProductPoint(e)) {
		s = e.children.map((child) => child.toLatex(options)).join(' \\cdot ')
	} else if (isIdentifier(e)) {
		s = e.name
	} else if (isSymbol(e)) {
		if (e.symbol === 'pi') {
			s = '\\pi'
		} else {
			s = e.symbol
		}
	} else if (isNumber(e)) {
		// s = parseFloat(e.value, 10)

		// s = e.value.toNumber()
		//   .toLocaleString('en',{maximumSignificantDigits:20} )
		//   .replace(/,/g, '\\,')
		//   .replace('.', '{,}')
		s = e.toString({ displayUnit: false })
		if (options.addSpaces) {
			s = formatSpaces(s)
		}
		s = s.replace(/ /g, '\\,').replace('.', '{,}')
		// const value = options.keepUnecessaryZeros ? e.input : e.value.toString()

		// s = options.addSpaces ? formatLatexNumber(value) : value.replace('.', ',')
	} else if (isHole(e)) {
		s = '\\ldots'
	} else if (isIncorrectExp(e)) {
		// s = 'Error : \n' + e.error + ' ' + e.input
		switch (e.input) {
			// TODO: WTF ??????
			case '<':
				s = '\\lt'
				break
			case '>':
				s = '\\gt'
				break
			default:
				s = e.input || ''
		}
	} else {
		s = e.string
	}
	// if (e.unit && options.displayUnit) s += ' ' + e.unit.string
	if (e.unit) s += '\\,' + e.unit.string
	return s
}

export function texmacs(e: Node, options: ToTexmacsArg) {
	let s = ''

	if (isAbs(e)) {
		s = '<around*|\\||' + e.first.toLatex(options) + '|\\|>'
	} else if (isTime(e)) {
		// format = options.formatTime

		s = ''
		if (e.children[0] && !e.children[0].isZero()) {
			s += e.children[0].toTexmacs(options)
			s += '<space|0.17em>'
		}
		if (e.children[1] && !e.children[1].isZero()) {
			s += e.children[1].toTexmacs(options)
			s += '<space|0.17em>'
		}
		if (e.children[2] && !e.children[2].isZero()) {
			s += e.children[2].toTexmacs(options)
			s += '<space|0.17em>'
		}
		if (e.children[3] && !e.children[3].isZero()) {
			s += e.children[3].toTexmacs(options)
			s += '<space|0.17em>'
		}
		if (e.children[4] && !e.children[4].isZero()) {
			s += e.children[4].toTexmacs(options)
			s += '<space|0.17em>'
		}
		if (e.children[5] && !e.children[5].isZero()) {
			if ((e.children[5] as Numbr).value.lessThan(10)) {
				s += '0' + e.children[5].toTexmacs(options)
			} else {
				s += e.children[5].toTexmacs(options)
			}
			s += '<space|0.17em>'
		}
		if (e.children[6] && !e.children[6].isZero()) {
			s += e.children[6].toTexmacs(options)
			s += '<space|0.17em>'
		}
		if (e.children[7] && !e.children[7].isZero()) {
			s += e.children[7].toTexmacs(options)
			s += '<space|0.17em>'
		}
	} else if (isSegmentLength(e)) {
		s = e.begin + e.end
	} else if (isEquality(e)) {
		s = e.first.toTexmacs(options) + '=' + e.last.toTexmacs(options)
	} else if (isUnequality(e)) {
		s = e.first.toTexmacs(options) + '\\<neq\\>' + e.last.toTexmacs(options)
	} else if (isInequalityLess(e)) {
		s = e.first.toTexmacs(options) + '\\<less\\>' + e.last.toTexmacs(options)
	} else if (isInequalityLessOrEqual(e)) {
		s =
			e.first.toTexmacs(options) + '\\<leqslant\\>' + e.last.toTexmacs(options)
	} else if (isInequalityMore(e)) {
		s = e.first.toTexmacs(options) + '\\<gtr\\>' + e.last.toTexmacs(options)
	} else if (isInequalityMoreOrEQual(e)) {
		s =
			e.first.toTexmacs(options) + '\\<geqslant\\>' + e.last.toTexmacs(options)
	} else if (isPercentage(e)) {
		s = e.first.toTexmacs(options) + '%'
	} else if (isRadical(e)) {
		s = '<sqrt|' + e.first.toTexmacs(options) + '>'
	} else if (isBracket(e)) {
		s = '<around*|(|' + e.first.toTexmacs(options) + '|)>'
	} else if (isPositive(e)) {
		s += '+' + e.first.toTexmacs(options)
	} else if (isOpposite(e)) {
		s = '-' + e.first.toTexmacs(options)
	} else if (isDifference(e)) {
		s = e.first.toTexmacs(options) + '-' + e.last.toTexmacs(options)
	} else if (isSum(e)) {
		s = e.first.toTexmacs(options) + '+' + e.last.toTexmacs(options)
	} else if (isPower(e)) {
		// console.log('e', e.string)
		// console.log('e.first', e.first.toLatex(options))
		s = e.first.toTexmacs(options) + '<rsup|' + e.last.toTexmacs(options) + '>'
		// console.log('s', s)
	} else if (isDivision(e)) {
		s = e.first.toTexmacs(options) + '\\<div\\>' + e.last.toTexmacs(options)
	} else if (isQuotient(e)) {
		s =
			'<dfrac|' +
			e.first.toTexmacs(options) +
			'|' +
			e.last.toTexmacs(options) +
			'>'
	} else if (isProduct(e)) {
		s = e.first.toTexmacs(options) + '\\<times\\>' + e.last.toTexmacs(options)
	} else if (isProductImplicit(e)) {
		s = e.first.toTexmacs(options) + '*' + e.last.toTexmacs(options)
	} else if (isProductPoint(e)) {
		s = e.first.toTexmacs(options) + '\\<cdot\\>' + e.last.toTexmacs(options)
	} else if (isIdentifier(e)) {
		s = e.name
	} else if (isSymbol(e)) {
		if (e.symbol === 'pi') {
			s = '\\<pi\\>'
		} else {
			s = e.symbol
		}
	} else if (isNumber(e)) {
		s = e.toString({ displayUnit: false })
		if (options.addSpaces) {
			s = formatSpaces(s)
		}
		s = s.replace(/ /g, '<space|0.17em>').replace('.', ',')
	} else if (isHole(e)) {
		s = '......'
	} else if (isIncorrectExp(e)) {
		s = 'error'
	} else {
		s = e.string
	}
	// if (e.unit && options.displayUnit) s += ' ' + e.unit.string
	if (e.unit) s += '<space|0.17em>' + e.unit.string
	return s
}

// Ajoute un espace tous les 3 chiffres
function formatSpaces(num: string) {
	let [int, dec] = num.replace(/ /g, '').split('.')
	int = int.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
	if (dec) dec = dec.replace(/\d{3}(?=\d)/g, '$& ')
	// if (dec) dec = dec.replace(/(\d)(?<=(?<!\d)(\d{3})+)/g, '$1\\,')
	return dec ? int + '.' + dec : int
}
console.log('end module output')
