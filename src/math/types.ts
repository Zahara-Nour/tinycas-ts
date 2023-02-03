import Decimal from 'decimal.js'

export type StringToken = {
	readonly pattern: string
	readonly lexem: string
	match(s: string): boolean
}

export type RegExToken = {
	readonly pattern: string
	readonly lexem: string
	readonly parts: RegExpExecArray
	match(s: string): boolean
}

export type Token = StringToken | RegExToken

export type Lexer = {
	readonly lexem: string
	readonly pos: number
	readonly parts: RegExpExecArray
	match(t: Token): boolean
	prematch(t: Token): boolean
	saveTrack(): void
	backTrack(): void
}

export type ToStringArg = {
	isUnit?: boolean
	displayUnit?: boolean
	comma?: boolean
	addBrackets?: boolean
	implicit?: boolean
}

export type ToLatexArg = {
	addBrackets?: boolean
	implicit?: boolean
	addSpaces?: boolean
	keepUnecessaryZeros?: boolean
}

export type ToTexmacsArg = {
	addBrackets?: boolean
	implicit?: boolean
	addSpaces?: boolean
	keepUnecessaryZeros?: boolean
}

export type Node = {
	[Symbol.iterator](): IterableIterator<Expression>
	derivate: (variable?: string) => Expression
	compose: (g: Expression, variable?: string) => Expression
	reduce: () => Expression
	develop: () => Expression
	simplify: () => Expression
	isCorrect: () => boolean
	isIncorrect: () => boolean
	isRelations: () => boolean
	isEquality: () => boolean
	isUnequality: () => boolean
	isInequality: () => boolean
	isBoolean: () => boolean
	isTrue: () => boolean
	isFalse: () => boolean
	isSum: () => boolean
	isDifference: () => boolean
	isOpposite: () => boolean
	isPositive: () => boolean
	isProduct: () => boolean
	isDivision: () => boolean
	isQuotient: () => boolean
	isPower: () => boolean
	isRadical: () => boolean
	isPGCD: () => boolean
	isMax: () => boolean
	isMaxP: () => boolean
	isMin: () => boolean
	isMinP: () => boolean
	isMod: () => boolean
	isCos: () => boolean
	isSin: () => boolean
	isTan: () => boolean
	isLn: () => boolean
	isLog: () => boolean
	isExp: () => boolean
	isFloor: () => boolean
	isAbs: () => boolean
	isNumber: () => boolean
	isBracket: () => boolean
	isSymbol: () => boolean
	isSegmentLength: () => boolean
	isTemplate: () => boolean
	isHole: () => boolean
	isTime: () => boolean
	isLimit: () => boolean
	isChild: () => boolean
	isIdentifier: () => boolean
	isFirst: () => boolean
	isLast: () => boolean
	isFunction: () => boolean
	isDuration: () => boolean
	isLength: () => boolean
	isMass: () => boolean
	isVolume: () => boolean
	compareTo: (e: Expression) => -1 | 0 | 1
	isLowerThan: (e: Expression | string | number) => boolean
	isLowerOrEqual: (e: Expression | string | number) => boolean
	isGreaterThan: (e: Expression | string | number) => boolean
	isGreaterOrEqual: (e: Expression | string | number) => boolean
	isOne: () => boolean
	isMinusOne: () => boolean
	isZero: () => boolean
	equalsZero: () => boolean
	strictlyEquals: (e: Expression) => boolean
	equals: (e: Expression) => boolean
	isSameQuantityType: (e: Expression) => boolean
	readonly terms: { op: '+' | '-'; term: Expression }[]
	readonly factors: Expression[]
	readonly pos: number
	readonly first: null | Expression
	readonly last: null | Expression
	readonly length: null | number
	toString: (params?: ToStringArg) => string
	readonly string: string
	toLatex: (params?: ToLatexArg) => string
	readonly latex: string
	toTexmacs: (params?: ToTexmacsArg) => string
	readonly texmacs: string
	readonly root: Expression
	isInt: () => boolean
	isEven: () => boolean
	isOdd: () => boolean
	isNumeric: () => boolean
	add: (e: Expression) => Expression
	sub: (e: Expression) => Expression
	mult: (e: Expression | string | number) => Expression
	div: (e: Expression) => Expression
	frac: (e: Expression) => Expression
	oppose: () => Expression
	inverse: () => Expression
	radical: () => Expression
	positive: () => Expression
	bracket: () => Expression
	pow: (e: Expression) => Expression
	floor: () => Expression
	mod: (e: Expression) => Expression
	abs: () => Expression
	exp: () => Expression
	ln: () => Expression
	log: () => Expression
	sin: () => Expression
	cos: () => Expression
	shallowShuffleTerms: () => Expression
	shallowShuffleFactors: () => Expression
	shuffleTerms: () => Expression
	shuffleFactors: () => Expression
	shuffleTermsAndFactors: () => Expression
	sortTerms: () => Expression
	shallowSortTerms: () => Expression
	sortFactors: () => Expression
	shallowSortFactors: () => Expression
	sortTermsAndFactors: () => Expression
	reduceFractions: () => Expression
	removeMultOperator: () => Expression
	removeUnecessaryBrackets: (allowFirstNegativeTerm?: boolean) => Expression
	removeZerosAndSpaces: () => Expression
	removeSigns: () => Expression
	removeNullTerms: () => Expression
	removeFactorsOne: () => Expression
	simplifyNullProducts: () => Expression
	searchUnecessaryZeros: () => boolean
	searchMisplacedSpaces: () => boolean
	eval(params?: EvalArg): Expression
	generate: () => Expression
	shallow: () => {
		nature: string
		children: null | string[]
		unit: null | string
	}
	readonly normal: Normal
	substitute: (values?: Record<string, string>) => Expression
	matchTemplate: (t: Expression) => boolean
	addParent: (e: Expression) => Expression
}

export type Expression = Node & {
	children?: Expression[]
	parent: null | Expression
	type: string
	boolvalue?: boolean
	value?: Decimal
	input?: string
	letter?: string
	begin?: string
	end?: string
	ops?: string[]
	sign?: string
	name?: string
	error?: Error
	unit?: Unit
	message?: string
	nature?: string
	precision?: number
	relative?: boolean
	signed?: boolean
	excludeMin?: Expression
	excludeMax?: Expression
	exclude?: Expression[]
	excludeDivider?: Expression[]
	excludeMultiple?: Expression[]
	excludeCommonDividersWith?: Expression[]
	generated: Expression[]
	substitutionMap: Record<string, string>
}

export type PNormal = {
	isZero: () => boolean
	isInt: () => boolean
	isOne: () => boolean
	isProduct: () => boolean
	isPower: () => boolean
	isDivision: () => boolean
	isQuotient: () => boolean
	isOpposite: () => boolean
	isMinusOne: () => boolean
	isNumeric: () => boolean
	isDuration: () => boolean
	isLength: () => boolean
	isMass: () => boolean
	isConvertibleTo: (u: Normal) => boolean
	isSameQuantityType: (e: Normal) => boolean
	getCoefTo: (u: Normal) => Normal
	reduce: () => Normal
	add: (e: Normal) => Normal
	sub: (e: Normal) => Normal
	mult: (e: Normal) => Normal
	div: (e: Normal) => Normal
	pow: (e: Normal) => Normal
	oppose: () => Normal
	invert: () => Normal
	compareTo: (e: Normal) => -1 | 0 | 1
	readonly node: Expression
	toNode: (params?: ToNodeArg) => Expression
	readonly string: string
	equalsTo: (e: string | number | Normal) => boolean
}

export type Normal = PNormal & {
	n: Nlist
	d: Nlist
	unit?: Normal
	type: string
}

export type NlistElements = NlistElement[]
export type NlistElement = [Nlist | Expression, Nlist | Expression]
export type Nlist = {
	[Symbol.iterator]: () => IterableIterator<NlistElement>
	compareTo: (l: Nlist) => -1 | 0 | 1
	equalsTo: (l: Nlist) => boolean
	merge: (l: Nlist) => Nlist
	createList(type: string, children: NlistElements): Nlist
	symmetrize: () => Nlist
	readonly string: string
	toString: (params?: ToStringArg) => string
	isOne: () => boolean
	isZero: () => boolean
	isMinusOne: () => boolean
	isInt: () => boolean
	isOpposite: () => boolean
	readonly first: NlistElement
	readonly last: NlistElement
	readonly length: number
	readonly node: Expression
	toNode: () => Expression
	mult: (l: Nlist) => Nlist
	add: (l: Nlist) => Nlist
	sub: (l: Nlist) => Nlist
	oppose: () => Nlist
	invert: () => Nlist
	div: (l: Nlist) => Nlist
	frac: (l: Nlist) => Nlist
	children: NlistElements
	type: string
}

export type Unit = {
	mult: (u: Unit) => Unit
	div: (u: Unit) => Unit
	pow: (n: Expression) => Unit
	toString: () => string
	readonly string: string
	isVolume: () => boolean
	isMetricalVolume: () => boolean
	isCapacity: () => boolean
	isConvertibleTo: (u: Unit) => boolean
	getCoefTo: (u: Unit) => Expression
	equalsTo: (u: Unit) => boolean
	normal: Normal
	u: Expression
	type: string
}

export type conversionTable = [number, string]

export type Fraction = {
	add: (f: Fraction) => Fraction
	sub: (f: Fraction) => Fraction
	mult: (f: Fraction) => Fraction
	div: (f: Fraction) => Fraction
	reduce: () => Fraction
	isLowerThan: (f: Fraction) => boolean
	isGreaterThan: (f: Fraction) => boolean
	toString: () => string
	n: Decimal
	d: Decimal
	s: number
}
export type CreateFractionArg = { n: Decimal; d: Decimal; s: number }
export type FractionArg = number | Decimal | string | Expression
export type EvalArg = {
	decimal?: boolean
	precision?: number
	unit?: string | Unit
	values?: Record<string, string>
}

export type ToNodeArg = { isUnit?: boolean; formatTime?: boolean }

export type compareArg = Expression | Normal | Nlist

export function isNormal(a: compareArg): a is Normal {
	return a.type === TYPE_NORMAL
}

export function isNlist(a: compareArg): a is Nlist {
	return a.type === TYPE_NSUM || a.type === TYPE_NPRODUCT
}

export function isExpression(a: compareArg): a is Expression {
	return !isNlist(a) && !isNormal(a)
}

export const TYPE_SUM = '+'
export const TYPE_DIFFERENCE = '-'
export const TYPE_PRODUCT = '*'
export const TYPE_PRODUCT_IMPLICIT = ''
export const TYPE_PRODUCT_POINT = '.'
export const TYPE_DIVISION = ':'
export const TYPE_QUOTIENT = '/'
export const TYPE_POWER = '^'
export const TYPE_ERROR = '!! Error !!'
export const TYPE_HOLE = '?'
export const TYPE_SYMBOL = 'symbol'
export const TYPE_NUMBER = 'number'
export const TYPE_PERCENTAGE = 'percentage'
export const TYPE_OPPOSITE = 'opposite'
export const TYPE_POSITIVE = 'positive'
export const TYPE_TEMPLATE = 'template'
export const TYPE_SIMPLE_UNIT = 'simple unit'
export const TYPE_UNIT = 'unit'
export const TYPE_BRACKET = 'bracket'
export const TYPE_EQUALITY = '='
export const TYPE_UNEQUALITY = '!='
export const TYPE_INEQUALITY_LESS = '<'
export const TYPE_INEQUALITY_LESSOREQUAL = '<='
export const TYPE_INEQUALITY_MORE = '>'
export const TYPE_INEQUALITY_MOREOREQUAL = '>='
export const TYPE_RELATIONS = 'relations'
export const TYPE_SEGMENT_LENGTH = 'segment length'
export const TYPE_GCD = 'gcd'
export const TYPE_MAX = 'maxi'
export const TYPE_MAXP = 'maxip'
export const TYPE_MIN = 'mini'
export const TYPE_MINP = 'minip'
export const TYPE_MOD = 'mod'
export const TYPE_BOOLEAN = 'boolean'
export const TYPE_COS = 'cos'
export const TYPE_SIN = 'sin'
export const TYPE_TAN = 'tan'
export const TYPE_LN = 'ln'
export const TYPE_LOG = 'log'
export const TYPE_EXP = 'exp'
export const TYPE_FLOOR = 'floor'
export const TYPE_ABS = 'abs'
export const TYPE_RADICAL = 'sqrt'
export const TYPE_TIME = 'time'
// export const TYPE_SIMPLE_TIME = 'simple_time'
export const TYPE_IDENTIFIER = 'identifiant'
export const TYPE_LIMIT = 'limit'

export const TYPE_NORMAL = 'normal'
export const TYPE_NSUM = 'nsum'
export const TYPE_NPRODUCT = 'nproduct'
