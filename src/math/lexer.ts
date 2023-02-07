import { Lexer, RegExToken, StringToken, Token } from './types.js'

export class LexingError extends Error {}

function stringToken(pattern: string): StringToken {
	const _pattern = pattern

	return {
		get pattern() {
			return _pattern
		},
		get lexem() {
			return _pattern
		},
		match(s: string) {
			return s.startsWith(_pattern)
		},
	}
}

function regExToken(pattern: string): RegExToken {
	const _pattern = pattern
	let _lexem: string
	let _parts: null | RegExpExecArray

	return {
		get pattern() {
			return _pattern
		},
		get lexem() {
			return _lexem
		},
		get parts() {
			return _parts
		},
		match(s: string) {
			const r = new RegExp(_pattern)
			const matched = r.exec(s)

			if (matched) {
				_lexem = matched[0]
				_parts = matched.length > 1 ? matched : null
			}
			return matched !== null
		},
	}
}

export function token(pattern: string): Token {
	let t: Token
	if (pattern.startsWith('@')) {
		// TODO: pourquoi les parentheses ? -> ça décale les indices dans le tableau de matching
		t = regExToken('^(' + pattern.slice(1, pattern.length) + ')')
	} else {
		t = stringToken(pattern)
	}
	return t
}

export function lexer(exp: string): Lexer {
	const whiteSpace = token('@\\s+')
	let _pos = 0
	let _savedPos: number
	let _lexem: string
	// const _baseExp = exp.replace(/\s/g, '')
	const _baseExp = exp.trim()
	let _parts: RegExpExecArray

	function removeWhiteSpaces() {
		if (_pos < _baseExp.length && whiteSpace.match(_baseExp.slice(_pos))) {
			_pos += whiteSpace.lexem.length
		}
	}
	return {
		get lexem() {
			return _lexem
		},

		get pos() {
			return _pos
		},

		get parts() {
			return _parts
		},

		// TODO: rename matchAndConsume ?
		match(t: Token) {
			if (_pos >= _baseExp.length) return false
			const s = _baseExp.slice(_pos)
			if (t.match(s)) {
				_lexem = t.lexem
				if ('parts' in t) _parts = t.parts
				_pos += _lexem.length
				removeWhiteSpaces()
				return true
			}
			return false
		},

		prematch(t: Token) {
			if (_pos >= _baseExp.length) return false
			const s = _baseExp.slice(_pos)
			return t.match(s)
		},

		saveTrack() {
			_savedPos = _pos
		},

		backTrack() {
			_pos = _savedPos
		},
	}
}
