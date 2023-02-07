import {
	TYPE_POSITIVE,
	TYPE_BRACKET,
	TYPE_DIFFERENCE,
	TYPE_DIVISION,
	TYPE_ERROR,
	TYPE_HOLE,
	TYPE_NUMBER,
	TYPE_OPPOSITE,
	TYPE_POWER,
	TYPE_PRODUCT,
	TYPE_PRODUCT_IMPLICIT,
	TYPE_PRODUCT_POINT,
	TYPE_QUOTIENT,
	TYPE_RADICAL,
	TYPE_SUM,
	TYPE_SYMBOL,
	TYPE_TEMPLATE,
	TYPE_EQUALITY,
	TYPE_INEQUALITY_LESS,
	TYPE_INEQUALITY_LESSOREQUAL,
	TYPE_INEQUALITY_MORE,
	TYPE_INEQUALITY_MOREOREQUAL,
	TYPE_PERCENTAGE,
	TYPE_SEGMENT_LENGTH,
	TYPE_GCD,
	TYPE_BOOLEAN,
	TYPE_COS,
	TYPE_SIN,
	TYPE_TAN,
	TYPE_LN,
	TYPE_EXP,
	TYPE_FLOOR,
	TYPE_LOG,
	TYPE_UNEQUALITY,
	TYPE_MOD,
	TYPE_ABS,
	TYPE_TIME,
	TYPE_MAX,
	TYPE_MIN,
	TYPE_MINP,
	TYPE_MAXP,
	TYPE_RELATIONS,
	TYPE_IDENTIFIER,
	TYPE_LIMIT,
	Expression,
} from './types.js'

/* 
Doit produire la même chaîne que celle qui été utilisée pour créer l'expression */

function canUseImplicitProduct(exp: Expression) {
	return (
		exp.isBracket() ||
		exp.isFunction() ||
		exp.isSymbol() ||
		(exp.isPower() && exp.first.isSymbol())
	)
}

export function text(e: Expression, options) {
	let s: string

	// console.log('isUnit', options.isUnit)

	switch (e.type) {
		case TYPE_LIMIT:
			if (e.first.isSymbol()) {
				s = e.first.string + (e.sign === '+' ? 'plus' : 'moins')
			} else {
				s = e.first.string + (e.sign === '+' ? 'plus' : 'moins')
			}
			break
		case TYPE_RELATIONS:
			s = e.first.toString(options)
			e.ops.forEach((op, i) => {
				s += op
				s += e.children[i + 1].toString(options)
			})
			break

		case TYPE_TIME:
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
			break

		case TYPE_SEGMENT_LENGTH:
			s = e.begin + e.end
			break

		case TYPE_EQUALITY:
		case TYPE_UNEQUALITY:
		case TYPE_INEQUALITY_LESS:
		case TYPE_INEQUALITY_LESSOREQUAL:
		case TYPE_INEQUALITY_MORE:
		case TYPE_INEQUALITY_MOREOREQUAL:
			s = e.first.toString(options) + e.type + e.last.toString(options)
			break

		case TYPE_PERCENTAGE:
			s = e.first.toString(options) + '%'
			break

		case TYPE_POSITIVE:
			s = '+' + e.first.toString(options)
			break

		case TYPE_OPPOSITE: {
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
			break
		}

		case TYPE_RADICAL:
		case TYPE_COS:
		case TYPE_SIN:
		case TYPE_TAN:
		case TYPE_LN:
		case TYPE_LOG:
		case TYPE_EXP:
		case TYPE_FLOOR:
		case TYPE_ABS:
			s = e.type + '(' + e.first.toString(options) + ')'
			break

		case TYPE_BRACKET:
			s = '(' + e.first.toString(options) + ')'
			break

		case TYPE_DIFFERENCE:
			s = e.first.toString(options) + '-' + e.last.toString(options)
			break

		case TYPE_POWER:
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
			break

		case TYPE_DIVISION:
			s = e.first.toString(options) + ':' + e.last.toString(options)
			break

		case TYPE_QUOTIENT: {
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

			break
		}

		case TYPE_SUM:
			s = e.children.map((child) => child.toString(options)).join(e.type)
			break

		case TYPE_PRODUCT: {
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
			break
		}

		case TYPE_PRODUCT_IMPLICIT:
			s = e.children
				.map((child) =>
					child.isQuotient()
						? '{' + child.toString(options) + '}'
						: child.toString(options),
				)
				.join('')
			break

		case TYPE_PRODUCT_POINT:
			s = e.children.map((child) => child.toString(options)).join(e.type)
			// console.log('isunit IMPLCITI POINT', options.isUnit, s)
			break

		case TYPE_IDENTIFIER:
			s = e.name
			break

		case TYPE_SYMBOL:
			s = e.letter
			break

		case TYPE_NUMBER:
			// s = e.value.toString()
			// if (e.value.toString() !== e.input) {
			//   console.log(`difference _${e.value.toString()}_ _${e.input}_`, typeof e.value.toString(), typeof e.input )
			// }
			s = e.input
			if (options.comma) {
				s = s.replace('.', ',')
			}

			break

		case TYPE_HOLE:
			s = '?'
			break

		case TYPE_ERROR:
			s = e.input
			// s = 'Error :\n' + e.error.message + ' ' + e.error.input
			break

		// case TYPE_NORMAL:
		//   s = e.n.string + '/' + +e.d.string
		//   break

		case TYPE_GCD:
			s =
				'pgcd(' +
				e.first.toString(options) +
				';' +
				e.last.toString(options) +
				')'
			break

		case TYPE_MOD:
			s =
				'mod(' +
				e.first.toString(options) +
				';' +
				e.last.toString(options) +
				')'
			break

		case TYPE_BOOLEAN:
			s = e.boolvalue.toString()
			break

		case TYPE_TEMPLATE:
			s = e.nature
			if (e.relative) s += 'r'
			if (e.signed) s += 's'
			switch (e.nature) {
				case '$e':
				case '$ep':
				case '$ei':
					if (!(e.children[0].isHole() && e.children[1].isHole())) {
						s += `{${
							!e.children[0].isHole()
								? e.children[0].toString(options) + ';'
								: ''
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
			break

		case TYPE_MIN:
		case TYPE_MAX:
		case TYPE_MINP:
		case TYPE_MAXP:
			s = e.type + '(' + e.first.string + ';' + e.last.string + ')'

			break
		default:
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

export function latex(e: Expression, options) {
	let s: string

	switch (e.type) {
		case TYPE_LIMIT:
			if (e.first.isSymbol()) {
				s = e.sign + '\\infin'
			} else {
				s = e.first.string + '^' + e.sign
			}
			break
		case TYPE_ABS:
			s = '\\left\\lvert ' + e.first.toLatex(options) + ' \\right\\rvert'
			break

		case TYPE_TIME:
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
				if (e.children[5].value.lessThan(10)) {
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

			break

		case TYPE_SEGMENT_LENGTH:
			s = e.begin + e.end
			break

		case TYPE_RELATIONS: {
			s = e.first.toLatex(options)
			e.ops.forEach((op, i) => {
				s += op
				s += e.children[i + 1].toLatex(options)
			})
			break
		}
		case TYPE_EQUALITY:
		case TYPE_UNEQUALITY:
		case TYPE_INEQUALITY_LESS:
		case TYPE_INEQUALITY_LESSOREQUAL:
		case TYPE_INEQUALITY_MORE:
		case TYPE_INEQUALITY_MOREOREQUAL:
			s = e.first.toLatex(options) + e.type + e.last.toLatex(options)
			break

		case TYPE_PERCENTAGE:
			s = e.first.toLatex(options) + '\\%'
			break

		case TYPE_RADICAL:
			s = '\\sqrt{' + e.first.toLatex(options) + '}'
			break

		case TYPE_BRACKET: {
			// const quotient = e.first.isQuotient()
			// s = !quotient ? '\\left(' : ''
			s = '\\left('
			s += e.first.toLatex(options)
			// if (!quotient) {
			s += '\\right)'
			// }
			break
		}

		case TYPE_POSITIVE: {
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
			break
		}

		case TYPE_OPPOSITE: {
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

			break
		}
		case TYPE_DIFFERENCE: {
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
			break
		}
		case TYPE_SUM: {
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
			break
		}

		case TYPE_POWER:
			// console.log('e', e.string)
			// console.log('e.first', e.first.toLatex(options))
			s = e.first.toLatex(options) + '^{' + e.last.toLatex(options) + '}'
			// console.log('s', s)
			break

		case TYPE_DIVISION:
			s = e.first.toLatex(options) + '\\div' + e.last.toLatex(options)
			break

		case TYPE_QUOTIENT:
			s =
				'\\dfrac{' +
				(e.first.isBracket()
					? e.first.first.toLatex(options)
					: e.first.toLatex(options)) +
				'}{' +
				(e.last.isBracket()
					? e.last.first.toLatex(options)
					: e.last.toLatex(options)) +
				'}'
			break

		case TYPE_PRODUCT: {
			let a = e.first
			let b = e.last
			if (a.isBracket() && a.first.isQuotient()) a = a.first
			if (b.isBracket() && b.first.isQuotient()) b = b.first
			s =
				a.toLatex(options) +
				(options.implicit ? '' : '\\times ') +
				b.toLatex(options)
			break
		}

		case TYPE_PRODUCT_IMPLICIT:
			s = e.children.map((child) => child.toLatex(options)).join('')
			break

		case TYPE_PRODUCT_POINT:
			s = e.children.map((child) => child.toLatex(options)).join(' \\cdot ')
			break

		case TYPE_IDENTIFIER:
			s = e.name
			break

		case TYPE_SYMBOL:
			if (e.letter === 'pi') {
				s = '\\pi'
			} else {
				s = e.letter
			}
			break

		case TYPE_NUMBER:
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
			break

		case TYPE_HOLE:
			s = '\\ldots'
			break

		case TYPE_ERROR:
			// s = 'Error : \n' + e.error + ' ' + e.input
			switch (e.input) {
				case '<':
					s = '\\lt'
					break
				case '>':
					s = '\\gt'
					break
				default:
					s = e.input
			}

			break

		default:
			s = e.string
	}
	// if (e.unit && options.displayUnit) s += ' ' + e.unit.string
	if (e.unit) s += '\\,' + e.unit.string
	return s
}

export function texmacs(e: Expression, options) {
	let s

	switch (e.type) {
		case TYPE_ABS:
			s = '<around*|\\||' + e.first.toLatex(options) + '|\\|>'
			break

		case TYPE_TIME:
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
				if (e.children[5].value.lessThan(10)) {
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
			break

		case TYPE_SEGMENT_LENGTH:
			s = e.begin + e.end
			break

		case TYPE_EQUALITY:
			s = e.first.toTexmacs(options) + '=' + e.last.toTexmacs(options)
			break

		case TYPE_UNEQUALITY:
			s = e.first.toTexmacs(options) + '\\<neq\\>' + e.last.toTexmacs(options)
			break
		case TYPE_INEQUALITY_LESS:
			s = e.first.toTexmacs(options) + '\\<less\\>' + e.last.toTexmacs(options)
			break
		case TYPE_INEQUALITY_LESSOREQUAL:
			s =
				e.first.toTexmacs(options) +
				'\\<leqslant\\>' +
				e.last.toTexmacs(options)
			break
		case TYPE_INEQUALITY_MORE:
			s = e.first.toTexmacs(options) + '\\<gtr\\>' + e.last.toTexmacs(options)
			break
		case TYPE_INEQUALITY_MOREOREQUAL:
			s =
				e.first.toTexmacs(options) +
				'\\<geqslant\\>' +
				e.last.toTexmacs(options)
			break

		case TYPE_PERCENTAGE:
			s = e.first.toTexmacs(options) + '%'
			break

		case TYPE_RADICAL:
			s = '<sqrt|' + e.first.toTexmacs(options) + '>'
			break

		case TYPE_BRACKET: {
			s = '<around*|(|' + e.first.toTexmacs(options) + '|)>'
			break
		}

		case TYPE_POSITIVE: {
			s += '+' + e.first.toTexmacs(options)
			break
		}

		case TYPE_OPPOSITE: {
			s = '-' + e.first.toTexmacs(options)
			break
		}

		case TYPE_DIFFERENCE: {
			s = e.first.toTexmacs(options) + '-' + e.last.toTexmacs(options)
			break
		}
		case TYPE_SUM: {
			s = e.first.toTexmacs(options) + '+' + e.last.toTexmacs(options)
			break
		}

		case TYPE_POWER:
			// console.log('e', e.string)
			// console.log('e.first', e.first.toLatex(options))
			s =
				e.first.toTexmacs(options) + '<rsup|' + e.last.toTexmacs(options) + '>'
			// console.log('s', s)
			break

		case TYPE_DIVISION:
			s = e.first.toTexmacs(options) + '\\<div\\>' + e.last.toTexmacs(options)
			break

		case TYPE_QUOTIENT:
			s =
				'<dfrac|' +
				e.first.toTexmacs(options) +
				'|' +
				e.last.toTexmacs(options) +
				'>'
			break

		case TYPE_PRODUCT: {
			s = e.first.toTexmacs(options) + '\\<times\\>' + e.last.toTexmacs(options)
			break
		}

		case TYPE_PRODUCT_IMPLICIT:
			s = e.first.toTexmacs(options) + '*' + e.last.toTexmacs(options)
			break

		case TYPE_PRODUCT_POINT:
			s = e.first.toTexmacs(options) + '\\<cdot\\>' + e.last.toTexmacs(options)
			break

		case TYPE_IDENTIFIER:
			s = e.name
			break

		case TYPE_SYMBOL:
			if (e.letter === 'pi') {
				s = '\\<pi\\>'
			} else {
				s = e.letter
			}
			break

		case TYPE_NUMBER:
			s = e.toString({ displayUnit: false })
			if (options.addSpaces) {
				s = formatSpaces(s)
			}
			s = s.replace(/ /g, '<space|0.17em>').replace('.', ',')
			break

		case TYPE_HOLE:
			s = '......'
			break

		case TYPE_ERROR:
			s = 'error'
			break

		default:
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
