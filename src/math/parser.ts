import { token, lexer } from './lexer'

import {
	number,
	hole,
	symbol,
	radical,
	positive,
	opposite,
	quotient,
	sum,
	difference,
	product,
	division,
	power,
	notdefined,
	bracket,
	template,
	equality,
	inequality,
	percentage,
	segmentLength,
	pgcd,
	boolean,
	cos,
	sin,
	tan,
	ln,
	log,
	exp,
	mod,
	floor,
	unequality,
	abs,
	min,
	max,
	time,
	minPreserve,
	maxPreserve,
	relations,
	identifier,
	limit,
	productImplicit,
} from './node'
import {
	Lexer,
	Node,
	Token,
	Unit,
	ParserOptions,
	TemplateArg,
	Sign,
} from './types'
import Decimal from 'decimal.js'
import { unit } from './unit'
// import template from './template'

// const SEMICOLON = token(';')
const PLUS = token('+')
const MINUS = token('-')
const TIMES = token('*')
const DIV = token(':')
const FRAC = token('/')
const POW = token('^')
const HOLE = token('?')
const PERIOD = token('.')
const EQUAL = token('=')
const NOTEQUAL = token('!=')
const PERCENT = token('%')
const EXCLUDE = token('\\')
const MULTIPLE = token('m')
const DIVIDER = token('d')
const COMMON_DIVIDERS = token('cd')
const COMP = token('@[<>]=?')
const OPENING_BRACKET = token('(')
const CLOSING_BRACKET = token(')')
const SEMICOLON = token(';')
const OPENING_SQUAREBRACKET = token('[')
const CLOSING_SQUAREBRACKET = token(']')
const OPENING_CURLYBRACKET = token('{')
const CLOSING_CURLYBRACKET = token('}')

const VALUE_DECIMAL_TEMPLATE = token('$$')
const INTEGER_TEMPLATE = token('@\\$(e[pi]?)(rs?)?')
const DECIMAL_TEMPLATE = token('@\\$d(r)?')
const VARIABLE_TEMPLATE = token('@\\$(\\d)+')
const LIST_TEMPLATE = token('$l')
const VALUE_TEMPLATE = token('$')
const IDENTIFIANT = token('@&[a-z]+(\\d)*|&(\\d)+')
const INDICE = token('@_({.+}|([0-9]+|[ijknmp]))')

const SEGMENT_LENGTH = token('@[A-Z][A-Z]')
const CONSTANTS = token('@pi|infinity')
const BOOLEAN = token('@false|true')
const FUNCTION = token(
	'@cos|sin|sqrt|pgcd|minip|mini|maxip|maxi|cos|sin|tan|exp|ln|log|mod|floor|abs',
)
const INTEGER = token('@[\\d]+')
const NUMBER = token('@\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?')
const TIME = token(
	'@\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*ans?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*mois)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*semaines?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*jours?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*h(?![a-zA-Z]))?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*mins?)?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*s(?![a-zA-Z]))?\\s*\
((\\d+[\\d\\s]*([,\\.][\\d\\s]*\\d+)?)\\s*ms)?',
)
const UNIT = token(
	'@Qr|€|k€|kL|hL|daL|L|dL|cL|mL|km|hm|dam|dm|cm|mm|ans|min|ms|t|q|kg|hg|dag|dg|cg|mg|°|m|g|h|s',
)
const LIMIT = token('@(inf|\\d+)(plus|moins)')

const ERROR_NO_VALID_ATOM = 'no valid atom found'
const ERROR_BAD_UNIT = 'non compatible units'
const ERROR_UNEXPECTED_END = 'Unexpected end of expression'
const ERROR_UNIT_REQUIRED = 'unit required'
const ERROR_UNIT_IN_IMPLICIT_PRODUCT =
	'no unit before a factor in implicit product'
const ERROR_NUMBER_MISPLACED =
	'Number must be placed at the beginning of an implicit product'
// const TEMPLATE = token(`@${regexBase}|${regexInteger}|${regexDecimal}`)

// const LENGTH = token('@km|hm|dam|dm|cm|mm|m')
// const MASS = token('@kg|hg|dag|dg|cg|mg|g')
// const ANGLE = token('°')
// const TIME = '@an|mois|jour|h|min|s|ms'
const SYMBOL = token('@[a-z]{1}')

// const TEMPLATE = token('@\\$[edfrnsEDF]')
// const MACRO = token('SUMA|SUMI|SUMZ|PRODUCTZ|evaluate|INT|DECIMAL')

// sur les conventions de calcul :
// http://images.math.cnrs.fr/Une-nouvelle-convention-de-calcul.html#nb4
// conventions choisies ici
// les produits implicites sont considérés comme une expression entre parenthèses par rapport à la division
// mais l'exponentiation reste prioritaire
// pour une suite de puissances, on fait de la gauche vers la droite

// *  <Systeme> ::= <Relation> <Systeme'>
// *  <Systeme'> ::= , <Relation> <Systeme'> | $
//  *  <Relation> ::= <Expression> <Relation'>
//  *  <Relation'> ::= = <Expression> | <= <Expression> | < <Expression> | > <Expression> | >= <Expression> |$
//  *  <Expression> ::= - <Terme> <Expression'> | + <Terme> <Expression'> | <Terme> <Expression'>
//  *  <Expression'> ::= + <Terme> <Expression'> | - <Terme> <Expression'> | $
//  *  <Terme> ::= <Facteur> <Terme'>
//  *  <Terme'> ::= (* <Facteur> | : <Facteur2> | / <Facteur2> ) <Terme'> | $
//  *  <Facteur> ::= <Atome> (<Puissance>   | <ProduitImplicite>)
//  *  <Puissance> ::= ^ <Atome> <Puissance> | $
//  *  <ProduitImplicite> -> <Atome'> <ProduitImplicite> | $              //produits implicites
//  *  <Facteur2> -> <Atome> <Puissance>                          //facteur2:eviter les produits implicites apres la division
//  *  <Atome> -> (<Nombre> | <Atome'>) (Unit | $)                           //pour etre sur qu'un nombre est devant dans un produit implicite
//  *  <Atome'> -> ? | <Litteral>  | <Fonction>  | ( <Expression> )
//  <Unit> -> <ComposedUnit> <Unit'>
//  <Unit'> ::= .<ComposedUnit> | $
//  <Composed=unit> ::= <SimpleUnit> (^(Integer | -Integer) | $)

const defaultParserOptions: ParserOptions = {
	implicit: true,
}

// TODO: passer les options tout au long
function parser({ implicit }: ParserOptions = defaultParserOptions) {
	let _lex: Lexer
	let _lexem: string
	let _input: string
	let _parts: RegExpExecArray

	function match(t: Token) {
		if (_lex.match(t)) {
			_lexem = _lex.lexem
			_parts = _lex.parts
			return _lexem
		}
		return ''
	}

	function prematch(t: Token) {
		return _lex.prematch(t)
	}

	function require(t: Token) {
		if (!match(t)) throw new Error(`${t.pattern} required`)
	}

	function parseExpression() {
		return parseRelations()
	}

	function parseRelations() {
		const exps = []
		type Comparator = '<' | '<=' | '>' | '>=' | '!=' | '='
		const ops: Comparator[] = []
		exps.push(parseMember())
		let e: Node
		while (match(EQUAL) || match(NOTEQUAL) || match(COMP)) {
			ops.push(_lexem as Comparator)
			exps.push(parseMember())
		}
		if (ops.length === 0) {
			e = exps[0]
		} else if (ops.length === 1) {
			if (ops[0] === '!=') {
				e = unequality([exps[0], exps[1]])
			} else if (ops[0] === '=') {
				e = equality([exps[0], exps[1]])
			} else {
				e = inequality([exps[0], exps[1]], ops[0])
			}
		} else {
			e = relations(ops, exps)
		}
		return e
	}

	function parseMember() {
		let e: Node
		let term: Node
		let sign = ''
		// let unit

		if (match(MINUS) || match(PLUS)) {
			sign = _lexem
		}
		term = parseTerm()

		if (sign) {
			e = sign === '-' ? opposite([term]) : positive([term])
			// e.unit = term.unit
			// term.unit = null|string
		} else {
			e = term
		}

		// unit = e.unit ? e.unit : { string: baseUnits.noUnit[1] }

		while (match(PLUS) || match(MINUS)) {
			sign = _lexem

			term = parseTerm()

			if (!term.isSameQuantityType(e)) {
				throw new Error(ERROR_BAD_UNIT)
			}
			// if (!unit) unit = term.unit

			e = sign === '+' ? sum([e, term]) : difference([e, term])
		}
		return e
	}

	function parseTerm() {
		let e = parseImplicitFactors()

		while (match(TIMES) || match(DIV) || match(FRAC)) {
			if (_lexem === '*') {
				e = product([e, parseImplicitFactors()])
			} else if (_lexem === ':') {
				e = division([e, parseImplicitFactors({ localImplicit: false })])
			} else {
				e = quotient([e, parseImplicitFactors({ localImplicit: false })])
			}
		}
		return e
	}

	function parseImplicitFactors({ localImplicit = true } = {}) {
		let e = parsePower()
		let next: Node | null
		// produit implicite
		if (implicit && localImplicit) {
			do {
				try {
					next = parsePower()
				} catch (error) {
					if ((error as Error).message === ERROR_NO_VALID_ATOM) {
						// on doit continuer à parser l'expression car on peut tomber sur - ou +
						next = null
					} else {
						// throw new Error((error as Error).message)
						throw error
					}
				}
				if (next && next.isNumber()) {
					throw new Error(ERROR_NUMBER_MISPLACED)
				} else if (next && e.unit) {
					// TODO: a verfier que ça ne pose pas de probleme avec les durées en HMS
					throw new Error(ERROR_UNIT_IN_IMPLICIT_PRODUCT)
				} else if (next) {
					e = productImplicit([e, next])
				}
			} while (next)
		}
		return e
	}

	function parsePower(): Node {
		let e = parseAtom()

		while (match(POW)) {
			// TODO: vérifier qu'il n'y a pas d'unité dans l'exposant

			e = power([e, parseAtom()])
		}

		return e
	}

	function parseAtom(): Node {
		let e: Node, func: string
		let exclude: Node[],
			excludeMin: Node | null = null,
			excludeMax: Node | null = null

		if (match(LIMIT)) {
			const lim = _lexem

			let sign: Sign
			let children: Node[]
			if (lim[0] === 'i') {
				sign = lim.substring(3) === 'plus' ? '+' : '-'
				children = [symbol('inf')]
			} else {
				sign = lim[lim.length - 2] === 'u' ? '+' : '-'
				children =
					lim[lim.length - 2] === 'u'
						? [number(lim.substring(0, lim.length - 4))]
						: [number(lim.substring(0, lim.length - 5))]
			}
			e = limit(sign, children)
		} else if (match(IDENTIFIANT)) {
			e = identifier(_lexem)
		} else if (match(BOOLEAN)) {
			e = boolean(_lexem === 'true')
		} else if (match(TIME)) {
			const units = ['ans', 'mois', 'semaines', 'jours', 'h', 'min', 's', 'ms']
			const parts = [
				_parts[3],
				_parts[6],
				_parts[9],
				_parts[12],
				_parts[15],
				_parts[18],
				_parts[21],
				_parts[24],
			]
			const filtered = parts.filter((p) => !!p)
			const u: null | string =
				filtered.length === 1 ? units[parts.findIndex((p) => !!p)] : null

			if (u) {
				// durée exprimée à l'aide d'une seule unité
				e = parser().parse(filtered[0])
				e.unit = unit(u)
			} else if (filtered.length === 0) {
				// TODO: c'est possible ce cas ?
				e = number(0)
				e.unit = unit('s')
			} else {
				// c'est du HMS
				const times = parts.map((p, i) => {
					const e = p ? parser().parse(p.trim()) : number(0)
					e.unit = unit(units[i])
					return e
				})
				e = time(times)
			}
		} else if (match(SEGMENT_LENGTH)) {
			e = segmentLength(_lexem.charAt(0), _lexem.charAt(1))
		}

		// number
		else if (match(NUMBER)) {
			e = number(_lexem)
		} else if (match(HOLE)) {
			e = hole()
		} else if ((func = match(FUNCTION))) {
			require(OPENING_BRACKET)
			switch (func) {
				case 'sqrt':
					e = radical([parseExpression()])
					break

				case 'pgcd': {
					const a = parseExpression()
					require(SEMICOLON)
					const b = parseExpression()
					e = pgcd([a, b])
					break
				}

				case 'minip': {
					const a = parseExpression()
					require(SEMICOLON)
					const b = parseExpression()
					e = minPreserve([a, b])
					break
				}

				case 'mini': {
					const a = parseExpression()
					require(SEMICOLON)
					const b = parseExpression()
					e = min([a, b])
					break
				}

				case 'maxip': {
					const a = parseExpression()
					require(SEMICOLON)
					const b = parseExpression()
					e = maxPreserve([a, b])
					break
				}

				case 'maxi': {
					const a = parseExpression()
					require(SEMICOLON)
					const b = parseExpression()
					e = max([a, b])
					break
				}

				case 'mod': {
					const a = parseExpression()
					require(SEMICOLON)
					const b = parseExpression()
					e = mod([a, b])
					break
				}

				case 'cos':
					e = cos([parseExpression()])
					break

				case 'sin':
					e = sin([parseExpression()])
					break

				case 'tan':
					e = tan([parseExpression()])
					break

				case 'ln':
					e = ln([parseExpression()])
					break

				case 'log':
					e = log([parseExpression()])
					break

				case 'exp':
					e = exp([parseExpression()])
					break

				case 'floor':
					e = floor([parseExpression()])
					break

				case 'abs':
					e = abs([parseExpression()])
					break

				default:
					throw new Error('function not recognized')
			}
			require(CLOSING_BRACKET)
		}
		// integer
		else if (match(INTEGER_TEMPLATE)) {
			const nature = _parts[2]
			const relative = _parts[3]
			const signed = !!relative && relative.includes('s')
			exclude = []
			const excludeMultiple: Node[] = []
			const excludeDivider: Node[] = []
			const excludeCommonDividersWith: Node[] = []
			let minDigit: Node = hole()
			let maxDigit: Node = hole()
			let min: Node = hole()
			let max: Node = hole()

			// $e : entier positif
			// $en : entier négatif
			// $er : entier relatif
			// $ep : entier pair
			// $ei : entier impair
			// $e{3} : max 3 chiffres                 ** accolades ne passent pas dans les commentaires
			// $e{2;3} : entre 2 et 3 chiffres
			// $e([ ])
			// dans 'l'expression régulière :
			// _parts[2] renvoie la nature ($e, $er, ouu $en)
			// _parts[4] et _parts[6] : nb chiffres min et max
			// _parts[4] nb chiffres ax si il n'y a pas _parts[6]

			if (match(OPENING_CURLYBRACKET)) {
				maxDigit = parseExpression()
				if (match(SEMICOLON)) {
					minDigit = maxDigit
					maxDigit = parseExpression()
				}
				require(CLOSING_CURLYBRACKET)
			} else if (match(OPENING_SQUAREBRACKET)) {
				min = parseExpression()
				require(SEMICOLON)
				max = parseExpression()
				require(CLOSING_SQUAREBRACKET)
			}

			if (match(EXCLUDE)) {
				if (match(OPENING_CURLYBRACKET)) {
					exclude = []
					do {
						if (match(MULTIPLE)) {
							excludeMultiple.push(parseExpression())
						} else if (match(DIVIDER)) {
							excludeDivider.push(parseExpression())
						} else if (match(COMMON_DIVIDERS)) {
							excludeCommonDividersWith.push(parseExpression())
						} else {
							exclude.push(parseExpression())
						}
					} while (match(SEMICOLON))
					require(CLOSING_CURLYBRACKET)
				} else {
					require(OPENING_SQUAREBRACKET)
					excludeMin = parseExpression()
					require(SEMICOLON)
					excludeMax = parseExpression()
					require(CLOSING_SQUAREBRACKET)
				}
			}

			const argTemplate: TemplateArg = {
				nature: '$' + nature,
				relative: !!relative,
				signed,
				children: [minDigit, maxDigit, min, max],
			}
			if (exclude.length) argTemplate.exclude = exclude
			if (excludeMultiple.length) argTemplate.excludeMultiple = excludeMultiple
			if (excludeDivider.length) argTemplate.excludeDivider = excludeDivider
			if (excludeCommonDividersWith.length)
				argTemplate.excludeCommonDividersWith = excludeCommonDividersWith
			if (excludeMin) argTemplate.excludeMin = excludeMin
			if (excludeMax) argTemplate.excludeMax = excludeMax
			e = template(argTemplate)
		}
		// decimal
		else if (match(DECIMAL_TEMPLATE)) {
			const nature = 'd'
			const relative = _parts[2]
			let integerPartN: Node = hole() // digits number before comma
			let integerPartMin: Node = hole() // digits number before comma
			let integerPartMax: Node = hole() // digits number before comma
			let decimalPartN: Node = hole() // digits number after comma
			let decimalPartMin: Node = hole() // digits number after comma
			let decimalPartMax: Node = hole() // digits number after comma

			if (match(OPENING_CURLYBRACKET)) {
				integerPartN = parseExpression()
				if (match(DIV)) {
					integerPartMin = integerPartN
					integerPartN = hole()
					integerPartMax = parseExpression()
				}
				if (match(SEMICOLON)) {
					decimalPartN = parseExpression()
					if (match(DIV)) {
						decimalPartMin = decimalPartN
						decimalPartN = hole()
						decimalPartMax = parseExpression()
					}
				}
				require(CLOSING_CURLYBRACKET)
			}
			e = template({
				nature: '$' + nature,
				relative: !!relative,
				children: [
					integerPartN,
					decimalPartN,
					integerPartMin,
					integerPartMax,
					decimalPartMin,
					decimalPartMax,
				],
			})
		} else if (match(VARIABLE_TEMPLATE)) {
			const nature = _parts[2]
			e = template({
				nature: '$' + nature,
				children: [],
			})
		}
		// List
		else if (match(LIST_TEMPLATE)) {
			const nature = _lexem
			const include = []
			const excludeMultiple = []
			const excludeDivider = []
			exclude = []
			excludeMin = null
			excludeMax = null
			require(OPENING_CURLYBRACKET)
			include.push(parseExpression())
			while (match(SEMICOLON)) {
				include.push(parseExpression())
			}
			require(CLOSING_CURLYBRACKET)

			if (match(EXCLUDE)) {
				if (match(OPENING_CURLYBRACKET)) {
					exclude = []

					do {
						if (match(MULTIPLE)) {
							excludeMultiple.push(parseExpression())
						} else if (match(DIVIDER)) {
							excludeDivider.push(parseExpression())
						} else {
							exclude.push(parseExpression())
						}
					} while (match(SEMICOLON))
					require(CLOSING_CURLYBRACKET)
				} else {
					require(OPENING_SQUAREBRACKET)
					excludeMin = parseExpression()
					require(SEMICOLON)
					excludeMax = parseExpression()
					require(CLOSING_SQUAREBRACKET)
				}
			}
			// console.log('include parser:',include)
			// TODO: et  excludeCommonDividersWith ?
			const argTemplate: TemplateArg = {
				nature,
				children: include,
			}
			if (exclude.length) argTemplate.exclude = exclude
			if (excludeMultiple.length) argTemplate.excludeMultiple = excludeMultiple
			if (excludeDivider.length) argTemplate.excludeDivider = excludeDivider
			// if (excludeCommonDividersWith.length)
			// 	argTemplate.excludeCommonDividersWith = excludeCommonDividersWith
			if (excludeMin) argTemplate.excludeMin = excludeMin
			if (excludeMax) argTemplate.excludeMax = excludeMax

			e = template(argTemplate)
		} else if (match(VALUE_DECIMAL_TEMPLATE)) {
			let precision = null
			if (match(INTEGER)) {
				precision = parseInt(_lexem, 10)
			}
			require(OPENING_CURLYBRACKET)
			const argTemplate: TemplateArg = {
				nature: '$$',
				children: [parseExpression()],
			}
			if (precision) argTemplate.precision = precision
			e = template(argTemplate)

			require(CLOSING_CURLYBRACKET)
		} else if (match(VALUE_TEMPLATE)) {
			require(OPENING_CURLYBRACKET)
			e = template({
				nature: '$',
				children: [parseExpression()],
			})
			require(CLOSING_CURLYBRACKET)
		} else if (match(CONSTANTS)) {
			e = symbol(_lexem)
		} else if (match(SYMBOL)) {
			let s = _lexem
			switch (s) {
				/*
        case "p":
          e = parseFactory.PI;
        */
				default:
					if (match(INDICE)) {
						s += _lexem
					}
					e = symbol(s)
			}
		} else if (match(OPENING_BRACKET)) {
			// TODO: rajouter dans options qu'il ne faut pas de nouvelles unités
			e = bracket([parseExpression()])
			require(CLOSING_BRACKET)
		}
		// Fausses parenthèses pour gérer les fractions et les puissances
		else if (match(OPENING_CURLYBRACKET)) {
			// TODO: rajouter dans options qu'il ne faut pas de nouvelles unités
			e = parseExpression()
			require(CLOSING_CURLYBRACKET)
		} else {
			throw new Error(ERROR_NO_VALID_ATOM)
		}

		if (e && match(PERCENT)) {
			e = percentage([e])
		}

		// les noms des fonctions interferent avec ceux des unités
		if (e && !prematch(FUNCTION)) {
			const unit = parseUnit()
			if (unit) {
				e.unit = unit
				// console.log('unit parsed', unit.string)
			}
		}
		return e
	}

	function parseUnit(): null | Unit {
		function getUnit() {
			let u = unit(_lexem)
			if (match(POW)) {
				const n = parseAtom()
				// if (
				//   !(
				//     n.isInt()
				//     || (n.isOpposite() && n.first.isInt())
				//   )
				// ) {
				//   failure('Integer required')
				// }
				u = u.pow(n)
			}
			return u
		}

		if (match(UNIT)) {
			let result = getUnit()
			while (match(PERIOD)) {
				if (match(UNIT)) {
					result = result.mult(getUnit())
				} else {
					throw new Error(ERROR_UNIT_REQUIRED)
				}
			}
			return result
		} else {
			return null
		}
	}

	return {
		parse(input: string | number | Decimal) {
			let e: Node
			if (typeof input === 'number' || Decimal.isDecimal(input)) {
				e = number(input)
			} else {
				input = input.trim()
				_input = input
				_lex = lexer(input)

				try {
					e = parseExpression()
					if (_lex.pos < _input.length) {
						// !_input.substring(_lex.pos, _input.length).match(/^\s*$/g)
						throw new Error(ERROR_UNEXPECTED_END)
						// console.log(_lex.pos, _input+':'+_input.length, '/'+_input.substring(_lex.pos, _input.length)+'/')
					}
				} catch (error) {
					let place = '-'.repeat(_lex.pos)
					place += '^'
					const message = `
${_input}
${place}
${(error as Error).message}`
					e = notdefined((error as Error).message, message, input)
				}
			}
			return e
		},
	}
}

export default parser
