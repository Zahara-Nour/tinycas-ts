import Decimal from 'decimal.js'

export type NonEmptyArr<T> = [T, ...T[]]

export type ParserOptions = {
	implicit: boolean
}

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

export type CopyArg = {
	unit?: Unit
	children?: Node[]

	value?: Decimal
	boolvalue?: boolean

	// Symbl
	symbol?: string

	// SegmentLength
	begin?: string
	end?: string

	// Identifier
	name?: string

	// Limit
	sign?: string

	// TODO: A verifier
	relation?: string

	input?: string

	// IncorrectExp
	error?: string
	message?: string

	// Relations
	ops?: string[]
}

export type CreateNodeArg = CopyArg & {
	type: types
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

export type SignedTerm = {
	op: '+' | '-'
	term: Node
}

export type Node = {
	readonly pos: number
	readonly string: string
	readonly latex: string
	readonly texmacs: string
	readonly root: Node
	readonly normal: Normal
	_normal?: Normal
	type: types
	parent?: ExpressionWithChildren
	unit?: Unit
	input?: string
	generated: Node[]
	substitutionMap?: Record<string, string>
	derivate: (variable?: string) => Node
	compose: (g: Node, variable?: string) => Node
	reduce: () => Node
	isCorrect: () => boolean
	isIncorrect: () => boolean
	isRelations: () => boolean
	isEquality: () => boolean
	isUnequality: () => boolean
	isInequality: () => boolean
	isBoolean: () => boolean
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
	compareTo: (e: Node) => -1 | 0 | 1
	isLowerThan: (e: Node | string | number) => boolean
	isLowerOrEqual: (e: Node | string | number) => boolean
	isGreaterThan: (e: Node | string | number) => boolean
	isGreaterOrEqual: (e: Node | string | number) => boolean
	isOne: () => boolean
	isMinusOne: () => boolean
	isZero: () => boolean
	equalsZero: () => boolean
	strictlyEquals: (e: Node) => boolean
	equals: (e: Node) => boolean
	isSameQuantityType: (e: Node) => boolean
	toString: (params?: ToStringArg) => string
	toLatex: (params?: ToLatexArg) => string
	toTexmacs: (params?: ToTexmacsArg) => string
	isInt: () => boolean
	isEven: () => boolean
	isOdd: () => boolean
	isNumeric: () => boolean
	add: (e: Node) => Node
	sub: (e: Node) => Node
	mult: (
		e: Node | string | number,
		type?:
			| typeof TYPE_PRODUCT
			| typeof TYPE_PRODUCT_IMPLICIT
			| typeof TYPE_PRODUCT_POINT,
	) => Node
	div: (e: Node) => Node
	frac: (e: Node) => Node
	oppose: () => Node
	inverse: () => Node
	radical: () => Node
	positive: () => Node
	bracket: () => Node
	pow: (e: Node) => Node
	floor: () => Node
	mod: (e: Node) => Node
	abs: () => Node
	exp: () => Node
	ln: () => Node
	log: () => Node
	sin: () => Node
	cos: () => Node
	shallowShuffleTerms: () => Node
	shallowShuffleFactors: () => Node
	shuffleTerms: () => Node
	shuffleFactors: () => Node
	shuffleTermsAndFactors: () => Node
	sortTerms: () => Node
	shallowSortTerms: () => Node
	sortFactors: () => Node
	shallowSortFactors: () => Node
	sortTermsAndFactors: () => Node
	reduceFractions: () => Node
	removeMultOperator: () => Node
	removeUnecessaryBrackets: (allowFirstNegativeTerm?: boolean) => Node
	removeZerosAndSpaces: () => Node
	removeSigns: () => Node
	removeNullTerms: () => Node
	removeFactorsOne: () => Node
	simplifyNullProducts: () => Node
	searchUnecessaryZeros: () => boolean
	searchMisplacedSpaces: () => boolean
	readonly terms: NonEmptyArr<SignedTerm>
	readonly factors: NonEmptyArr<Node>
	eval(params?: EvalArg): Node
	generate: () => Node
	shallow: () => {
		nature: string
		children: null | string[]
		unit: null | string
	}
	substitute: (values?: Record<string, string>) => Node
	matchTemplate: (t: Node) => boolean
	copyFromString: (withUnit?: boolean) => Node
	copy: (params?: Node[]) => Node

	[Symbol.iterator]?: () => IterableIterator<Node>
	children?: Node[]
	readonly length?: number
	readonly first?: Node
	readonly last?: Node

	sign?: string

	ops?: string[]

	isTrue?: () => boolean
	isFalse?: () => boolean
	value?: Decimal
	boolvalue?: boolean

	nature?: string
	// INTEGER_TAMPLATE et DECIMAL_TEMPLATE
	relative?: boolean

	// INTEGER TEMPLATE - LIST_TEMPLATE
	signed?: boolean
	excludeMin?: Node
	excludeMax?: Node
	exclude?: Node[]
	excludeDivider?: Node[]
	excludeMultiple?: Node[]
	excludeCommonDividersWith?: Node[]

	// VALUE_DECIMAL_TEMPLATE
	precision?: number

	begin?: string
	end?: string

	error?: string
	message?: string

	symbol?: string
	name?: string
}

export type ExpressionWithChildren = Node & {
	[Symbol.iterator]: () => IterableIterator<Node>
	children: Node[]
	readonly length: number
	readonly first: Node
	readonly last: Node
}

export type Limit = ExpressionWithChildren & {
	sign: string
	type: typeof TYPE_LIMIT
}

export type Time = ExpressionWithChildren & {
	type: typeof TYPE_TIME
}

export type Relations = ExpressionWithChildren & {
	ops: string[]
	type: typeof TYPE_RELATIONS
}

export type Sum = ExpressionWithChildren & {
	type: typeof TYPE_SUM
}

export type Difference = ExpressionWithChildren & {
	type: typeof TYPE_DIFFERENCE
}

export type Product = ExpressionWithChildren & {
	type: typeof TYPE_PRODUCT
}
export type ProductImplicit = ExpressionWithChildren & {
	type: typeof TYPE_PRODUCT_IMPLICIT
}
export type ProductPoint = ExpressionWithChildren & {
	type: typeof TYPE_PRODUCT_POINT
}

export type Quotient = ExpressionWithChildren & {
	type: typeof TYPE_QUOTIENT
}

export type Division = ExpressionWithChildren & {
	type: typeof TYPE_DIVISION
}

export type Power = ExpressionWithChildren & {
	type: typeof TYPE_POWER
}

export type Positive = ExpressionWithChildren & {
	type: typeof TYPE_POSITIVE
}

export type Opposite = ExpressionWithChildren & {
	type: typeof TYPE_OPPOSITE
}

export type Abs = ExpressionWithChildren & {
	type: typeof TYPE_ABS
}

export type Cos = ExpressionWithChildren & {
	type: typeof TYPE_COS
}

export type Sin = ExpressionWithChildren & {
	type: typeof TYPE_SIN
}

export type Tan = ExpressionWithChildren & {
	type: typeof TYPE_TAN
}

export type Gcd = ExpressionWithChildren & {
	type: typeof TYPE_GCD
}

export type Log = ExpressionWithChildren & {
	type: typeof TYPE_LOG
}

export type LogN = ExpressionWithChildren & {
	type: typeof TYPE_LN
}

export type Bracket = ExpressionWithChildren & {
	type: typeof TYPE_BRACKET
}

export type Exp = ExpressionWithChildren & {
	type: typeof TYPE_EXP
}

export type Floor = ExpressionWithChildren & {
	type: typeof TYPE_FLOOR
}

export type Max = ExpressionWithChildren & {
	type: typeof TYPE_MAX
}

export type MaxP = ExpressionWithChildren & {
	type: typeof TYPE_MAXP
}

export type Min = ExpressionWithChildren & {
	type: typeof TYPE_MIN
}

export type MinP = ExpressionWithChildren & {
	type: typeof TYPE_MINP
}
export type Mod = ExpressionWithChildren & {
	type: typeof TYPE_MOD
}

export type Percentage = ExpressionWithChildren & {
	type: typeof TYPE_PERCENTAGE
}

export type Radical = ExpressionWithChildren & {
	type: typeof TYPE_RADICAL
}

export type Equality = ExpressionWithChildren & {
	type: typeof TYPE_EQUALITY
}
export type Unequality = ExpressionWithChildren & {
	type: typeof TYPE_UNEQUALITY
}

export type InequalityLess = ExpressionWithChildren & {
	type: typeof TYPE_INEQUALITY_LESS
}

export type InequalityLessOrEqual = ExpressionWithChildren & {
	type: typeof TYPE_INEQUALITY_LESSOREQUAL
}

export type InequalityMore = ExpressionWithChildren & {
	type: typeof TYPE_INEQUALITY_MORE
}

export type InequalityMoreOrEqual = ExpressionWithChildren & {
	type: typeof TYPE_INEQUALITY_MOREOREQUAL
}

export type Bool = Node & {
	isTrue: () => boolean
	isFalse: () => boolean
	value: Decimal
	boolvalue: boolean
	type: typeof TYPE_BOOLEAN
}

export type Numbr = Node & {
	input: string
	value: Decimal
	type: typeof TYPE_NUMBER
}

export type Hole = Node & {
	type: typeof TYPE_HOLE
}

export type TemplateArg = {
	nature: string
	precision?: number
	relative?: boolean
	signed?: boolean
	excludeMin?: Node
	excludeMax?: Node
	exclude?: Node[]
	excludeDivider?: Node[]
	excludeMultiple?: Node[]
	excludeCommonDividersWith?: Node[]
	children: Node[]
}

export type Template = ExpressionWithChildren & {
	type: typeof TYPE_TEMPLATE
	nature: string
	// INTEGER_TAMPLATE et DECIMAL_TEMPLATE
	relative?: boolean

	// INTEGER TEMPLATE - LIST_TEMPLATE
	signed?: boolean
	excludeMin?: Node
	excludeMax?: Node
	exclude?: Node[]
	excludeDivider?: Node[]
	excludeMultiple?: Node[]
	excludeCommonDividersWith?: Node[]

	// VALUE_DECIMAL_TEMPLATE
	precision?: number
}

export type SegmentLength = Node & {
	type: typeof TYPE_SEGMENT_LENGTH
	begin: string
	end: string
}

export type IncorrectExp = Node & {
	type: typeof TYPE_ERROR
	error: string
	message: string
}

export type Symbl = Node & {
	type: typeof TYPE_SYMBOL
	symbol: string
}

export type Identifier = Node & {
	type: typeof TYPE_IDENTIFIER
	name: string
}

export type Expression =
	| Bool
	| Numbr
	| Template
	| SegmentLength
	| IncorrectExp
	| Identifier
	| Symbl
	| Hole
	| ExpressionWithChildren

export type Normal = {
	readonly n: Nlist
	readonly d: Nlist
	readonly node: Node
	readonly string: string
	_n?: Nlist
	_d?: Nlist
	unit?: Normal
	type: typeof TYPE_NORMAL
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
	mult: (e: Normal | string | number | Decimal) => Normal
	div: (e: Normal) => Normal
	pow: (e: Normal) => Normal
	oppose: () => Normal
	invert: () => Normal
	compareTo: (e: Normal) => -1 | 0 | 1
	toNode: (params?: ToNodeArg) => Node
	equalsTo: (e: string | number | Normal) => boolean
}

export type NlistElements = NlistElement[]
export type NlistElement = [Nlist | Node, Nlist | Node]
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
	readonly node: Node
	toNode: () => Node
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
	pow: (n: Node) => Unit
	toString: () => string
	readonly string: string
	isVolume: () => boolean
	isMetricalVolume: () => boolean
	isCapacity: () => boolean
	isConvertibleTo: (u: Unit) => boolean
	getCoefTo: (u: Unit) => Node
	equalsTo: (u: Unit) => boolean
	normal: () => Normal
	_normal?: Normal
	readonly u: Node
	_u?: Node
	type: typeof TYPE_UNIT
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
	s: -1 | 1
}
export type CreateFractionArg = { n: Decimal; d: Decimal; s: number }
export type FractionArg = number | Decimal | string | Node
export type EvalArg = {
	decimal?: boolean
	precision?: number
	unit?: string | Unit
	values?: Record<string, string>
}
export type ToNodeArg = { isUnit?: boolean; formatTime?: boolean }

export type CompareArg = Node | Normal | Nlist

export function isNormal(a: CompareArg): a is Normal {
	return a.type === TYPE_NORMAL
}

export function isNlist(a: CompareArg): a is Nlist {
	return a.type === TYPE_NSUM || a.type === TYPE_NPRODUCT
}

export function isExpression(a: CompareArg): a is Node {
	return !isNlist(a) && !isNormal(a)
}

export function isBoolean(e: Node): e is Bool {
	return e.type === TYPE_BOOLEAN
}
export function isNumber(e: Node): e is Numbr {
	return e.type === TYPE_NUMBER
}
export function isInt(e: Node): e is Numbr {
	return isNumber(e) && e.value.isInt()
}

export function isTemplate(e: Node): e is Template {
	return e.type === TYPE_TEMPLATE
}
export function isSegmentLength(e: Node): e is SegmentLength {
	return e.type === TYPE_SEGMENT_LENGTH
}
export function isIncorrectExp(e: Node): e is IncorrectExp {
	return e.type === TYPE_ERROR
}
export function isIdentifier(e: Node): e is Identifier {
	return e.type === TYPE_IDENTIFIER
}
export function isSymbol(e: Node): e is Symbl {
	return e.type === TYPE_SYMBOL
}
export function isHole(e: Node): e is Hole {
	return e.type === TYPE_HOLE
}
export function isExpressionWithChildren(e: Node): e is ExpressionWithChildren {
	return !(
		isBoolean(e) ||
		isNumber(e) ||
		isTemplate(e) ||
		isSegmentLength(e) ||
		isIncorrectExp(e) ||
		isIdentifier(e) ||
		isSymbol(e) ||
		isHole(e)
	)
}

export function isOpposite(e: Node): e is Opposite {
	return isExpressionWithChildren(e) && e.type === TYPE_OPPOSITE
}

export function isPositive(e: Node): e is Opposite {
	return isExpressionWithChildren(e) && e.type === TYPE_POSITIVE
}
export function isBracket(e: Node): e is Bracket {
	return isExpressionWithChildren(e) && e.type === TYPE_BRACKET
}
export function isRadical(e: Node): e is Radical {
	return isExpressionWithChildren(e) && e.type === TYPE_RADICAL
}

export function isSum(e: Node): e is Sum {
	return isExpressionWithChildren(e) && e.type === TYPE_SUM
}
export function isDifference(e: Node): e is Difference {
	return isExpressionWithChildren(e) && e.type === TYPE_DIFFERENCE
}

export function isProduct(e: Node): e is Product {
	return isExpressionWithChildren(e) && e.type === TYPE_PRODUCT
}

export function isProductPoint(e: Node): e is ProductPoint {
	return isExpressionWithChildren(e) && e.type === TYPE_PRODUCT_POINT
}
export function isProductImplicit(e: Node): e is ProductImplicit {
	return isExpressionWithChildren(e) && e.type === TYPE_PRODUCT_IMPLICIT
}

export function isQuotient(e: Node): e is Quotient {
	return isExpressionWithChildren(e) && e.type === TYPE_QUOTIENT
}

export function isDivision(e: Node): e is Division {
	return isExpressionWithChildren(e) && e.type === TYPE_DIVISION
}
export function isPower(e: Node): e is Power {
	return isExpressionWithChildren(e) && e.type === TYPE_POWER
}

export function isLimit(e: Node): e is Limit {
	return isExpressionWithChildren(e) && e.type === TYPE_LIMIT
}
export function isRelations(e: Node): e is Relations {
	return isExpressionWithChildren(e) && e.type === TYPE_RELATIONS
}

export function isEquality(e: Node): e is Equality {
	return isExpressionWithChildren(e) && e.type === TYPE_EQUALITY
}

export function isInequalityLess(e: Node): e is InequalityLess {
	return isExpressionWithChildren(e) && e.type === TYPE_INEQUALITY_LESS
}

export function isInequalityLessOrEqual(e: Node): e is InequalityLessOrEqual {
	return isExpressionWithChildren(e) && e.type === TYPE_INEQUALITY_LESSOREQUAL
}

export function isInequalityMore(e: Node): e is InequalityMore {
	return isExpressionWithChildren(e) && e.type === TYPE_INEQUALITY_MORE
}

export function isInequalityMoreOrEQual(e: Node): e is InequalityMoreOrEqual {
	return isExpressionWithChildren(e) && e.type === TYPE_INEQUALITY_MOREOREQUAL
}

export function isMinP(e: Node): e is MinP {
	return isExpressionWithChildren(e) && e.type === TYPE_MINP
}

export function isMin(e: Node): e is Min {
	return isExpressionWithChildren(e) && e.type === TYPE_MIN
}

export function isMaxP(e: Node): e is MaxP {
	return isExpressionWithChildren(e) && e.type === TYPE_MAXP
}

export function isMax(e: Node): e is Max {
	return isExpressionWithChildren(e) && e.type === TYPE_MAX
}

export function isPercentage(e: Node): e is Percentage {
	return isExpressionWithChildren(e) && e.type === TYPE_PERCENTAGE
}

export function isCos(e: Node): e is Cos {
	return isExpressionWithChildren(e) && e.type === TYPE_COS
}

export function isSin(e: Node): e is Sin {
	return isExpressionWithChildren(e) && e.type === TYPE_SIN
}

export function isTan(e: Node): e is Tan {
	return isExpressionWithChildren(e) && e.type === TYPE_TAN
}

export function isLn(e: Node): e is LogN {
	return isExpressionWithChildren(e) && e.type === TYPE_LN
}

export function isLog(e: Node): e is Log {
	return isExpressionWithChildren(e) && e.type === TYPE_LOG
}

export function isExp(e: Node): e is Exp {
	return isExpressionWithChildren(e) && e.type === TYPE_EXP
}

export function isTime(e: Node): e is Time {
	return isExpressionWithChildren(e) && e.type === TYPE_TIME
}

export function isAbs(e: Node): e is Abs {
	return isExpressionWithChildren(e) && e.type === TYPE_ABS
}

export function isFloor(e: Node): e is Floor {
	return isExpressionWithChildren(e) && e.type === TYPE_FLOOR
}

export function isPGCD(e: Node): e is Gcd {
	return isExpressionWithChildren(e) && e.type === TYPE_GCD
}

export function isMod(e: Node): e is Mod {
	return isExpressionWithChildren(e) && e.type === TYPE_MOD
}

export function isUnequality(e: Node): e is Unequality {
	return isExpressionWithChildren(e) && e.type === TYPE_UNEQUALITY
}

export function isFunction(e: Node): e is ExpressionWithChildren {
	return (
		isRadical(e) ||
		isPGCD(e) ||
		isMin(e) ||
		isMinP(e) ||
		isMax(e) ||
		isMaxP(e) ||
		isMod(e) ||
		isCos(e) ||
		isSin(e) ||
		isTan(e) ||
		isLog(e) ||
		isLn(e) ||
		isExp(e) ||
		isFloor(e) ||
		isAbs(e)
	)
}

export type types =
	| typeof TYPE_SUM
	| typeof TYPE_DIFFERENCE
	| typeof TYPE_PRODUCT
	| typeof TYPE_PRODUCT_IMPLICIT
	| typeof TYPE_PRODUCT_POINT
	| typeof TYPE_DIVISION
	| typeof TYPE_QUOTIENT
	| typeof TYPE_POWER
	| typeof TYPE_ERROR
	| typeof TYPE_HOLE
	| typeof TYPE_SYMBOL
	| typeof TYPE_NUMBER
	| typeof TYPE_PERCENTAGE
	| typeof TYPE_OPPOSITE
	| typeof TYPE_POSITIVE
	| typeof TYPE_TEMPLATE
	| typeof TYPE_UNIT
	| typeof TYPE_BRACKET
	| typeof TYPE_EQUALITY
	| typeof TYPE_UNEQUALITY
	| typeof TYPE_INEQUALITY_LESS
	| typeof TYPE_INEQUALITY_LESSOREQUAL
	| typeof TYPE_INEQUALITY_MORE
	| typeof TYPE_INEQUALITY_MOREOREQUAL
	| typeof TYPE_RELATIONS
	| typeof TYPE_SEGMENT_LENGTH
	| typeof TYPE_GCD
	| typeof TYPE_MAX
	| typeof TYPE_MAXP
	| typeof TYPE_MIN
	| typeof TYPE_MINP
	| typeof TYPE_MOD
	| typeof TYPE_BOOLEAN
	| typeof TYPE_COS
	| typeof TYPE_SIN
	| typeof TYPE_TAN
	| typeof TYPE_LN
	| typeof TYPE_LOG
	| typeof TYPE_EXP
	| typeof TYPE_FLOOR
	| typeof TYPE_ABS
	| typeof TYPE_RADICAL
	| typeof TYPE_TIME
	// typeof  TYPE_SIMPLE_TIME |
	| typeof TYPE_IDENTIFIER
	| typeof TYPE_LIMIT
	| typeof TYPE_NORMAL
	| typeof TYPE_NSUM
	| typeof TYPE_NPRODUCT
	| typeof TYPE_NULL_EXPRESSION
	| typeof TYPE_NOT_INITALIZED

export type ptypes =
	| Sum
	| Difference
	| Product
	| ProductImplicit
	| ProductPoint
	| Division
	| Quotient
	| Power
	| IncorrectExp
	| Hole
	| Symbl
	| Numbr
	| Percentage
	| Opposite
	| Positive
	| Template
	| Unit
	| Bracket
	| Equality
	| Unequality
	| InequalityLess
	| InequalityLessOrEqual
	| InequalityMore
	| InequalityMoreOrEqual
	| Relations
	| SegmentLength
	| Gcd
	| Max
	| MaxP
	| Min
	| MinP
	| Mod
	| Bool
	| Cos
	| Sin
	| Tan
	| LogN
	| Log
	| Exp
	| Floor
	| Abs
	| Radical
	| Time
	// typeof  TYPE_SIMPLE_TIME |
	| Identifier
	| Limit

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
export const TYPE_NULL_EXPRESSION = 'null expression'
export const TYPE_NOT_INITALIZED = 'not initialized'
