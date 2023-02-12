import math from 'tinycas'
// loggers
type Level = 'trace' | 'debug' | 'info' | 'warn' | 'fail'
type Noop = () => void
type ConsoleLogger = (...args: unknown[]) => void | Noop
type Logger = {
	level: Level
	fail: ConsoleLogger
	warn: ConsoleLogger
	info: ConsoleLogger
	debug: ConsoleLogger
	trace: ConsoleLogger
}
type Loggers = { [name: string]: Logger }

function noop() {
	/* do nothing */
}
const loggers: Loggers = {}
function getLogger(name: string, level: Level = 'info') {
	if (
		!Object.prototype.hasOwnProperty.call(loggers, name) ||
		loggers[name].level !== level
	) {
		const levels = ['trace', 'debug', 'info', 'warn', 'fail']
		// const getTimestamp = () => ''
		// const getTimestamp = () => moment().format('YY-MM-DD HH:mm:ss')
		// const coloredPrefix = `%c[${getTimestamp()}] [${name}] `
		// const prefix = `[${getTimestamp()}] [${name}] `
		const coloredPrefix = `%c[${name}] `
		const prefix = `[${name}] `

		const fail =
			levels.indexOf(level) <= levels.indexOf('fail')
				? console.error.bind(console, coloredPrefix, 'color:#ED8784')
				: noop
		const warn =
			levels.indexOf(level) <= levels.indexOf('warn')
				? console.warn.bind(console, coloredPrefix, 'color:#F3D9A2')
				: noop
		const info =
			levels.indexOf(level) <= levels.indexOf('info')
				? console.info.bind(console, coloredPrefix, 'color:#8CE9FF')
				: noop
		const debug =
			levels.indexOf(level) <= levels.indexOf('debug')
				? console.log.bind(console, prefix)
				: noop
		const trace =
			levels.indexOf(level) <= levels.indexOf('trace')
				? console.log.bind(console, prefix)
				: noop

		loggers[name] = {
			level,
			fail,
			warn,
			info,
			debug,
			trace,
		}
	}
	return loggers[name]
}

/**
 * Randomly shuffle an array (in place shuffle)
 * https://stackoverflow.com/a/2450976/1293256
 */
const shuffle = function (array: unknown[]) {
	let currentIndex = array.length
	let temporaryValue, randomIndex

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1

		// And swap it with the current element.
		temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}

	return array
}

// test if a variable is an object and is empty
function isEmptyObject(obj: object) {
	// return obj.constructor === Object && Object.entries(obj).length === 0
	return Object.entries(obj).length === 0
}

function getPropertyName(obj: object) {
	return Object.getOwnPropertyNames(obj)[0]
}

// lexical sort
const lexicoSort = (a: number | string, b: number | string) => {
	if (a < b) return -1
	if (a > b) return 1
	return 0
}

// clean string for url
const cleanString = (str: string) =>
	str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/\s/g, '')
		.toLowerCase()

export function getRandomIntInclusive(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

const regex = /\$\$(.*?)\$\$/g
const replacementLatex = (_: unknown, p1: string) =>
	'$$' + math(p1).latex + '$$'
const replacementTexmacs = (_: unknown, p1: string) =>
	'$' + math(p1).texmacs + '$'

type ObjectWithText = { text: string }
type FormatToLatexArg = null | ObjectWithText | string | Array<FormatToLatexArg>
type FormatToTexmacsArg =
	| null
	| ObjectWithText
	| string
	| Array<FormatToTexmacsArg>
export const formatToLatex = (o: FormatToLatexArg): unknown => {
	if (!o) {
		return ''
	}
	if (Array.isArray(o)) {
		return o.map((elmt) => formatToLatex(elmt))
	} else if (typeof o === 'object') {
		return { ...o, text: formatToLatex(o.text) }
	} else if (typeof o === 'string') {
		return o.replace(regex, replacementLatex)
	} else {
		return o
	}
}

export const formatToTexmacs = (o: FormatToTexmacsArg): unknown => {
	if (!o) {
		return ''
	}
	if (Array.isArray(o)) {
		return o.map((elmt) => formatToTexmacs(elmt))
	} else if (typeof o === 'object') {
		return { ...o, text: formatToTexmacs(o.text) }
	} else if (typeof o === 'string') {
		return o.replace(regex, replacementTexmacs)
	} else {
		return o
	}
}

export function objectMap<S, T>(
	object: { [index: string]: S },
	mapFn: (o: S, key: string, i?: number) => T,
	init?: T,
): { [index: string]: T } {
	return Object.keys(object).reduce(
		function (result: { [index: string]: T }, key, idx) {
			const value = object[key]
			const new_value = mapFn(value, key, idx)
			result[key] = new_value
			return result
		},
		init ? init : ({} as { [index: string]: T }),
	)
}

export {
	getLogger,
	shuffle,
	isEmptyObject,
	getPropertyName,
	lexicoSort,
	cleanString,
}
