import math from 'tinycas'
import type {
	FormatToLatexArg,
	FormatToTexmacsArg,
	ObjectWithText,
} from '../types/type'
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

export function isObjectWithText(o: any): o is ObjectWithText {
	return typeof o === 'object' && !!(o as ObjectWithText).text
}

export const formatToLatex = (
	o: FormatToLatexArg,
): NonNullable<FormatToLatexArg> => {
	if (!o) {
		return ''
	} else if (Array.isArray(o)) {
		return (o as Array<object | string>).map((elmt) => formatToLatex(elmt))
	} else if (isObjectWithText(o)) {
		return { ...o, text: formatToLatex(o.text) }
	} else if (typeof o === 'string') {
		return o.replace(regex, replacementLatex)
	} else {
		return o
	}
}

export const formatToTexmacs = (
	o: FormatToTexmacsArg,
): NonNullable<FormatToTexmacsArg> => {
	if (!o) {
		return ''
	}
	if (Array.isArray(o)) {
		return (o as Array<object | string>).map((elmt) => formatToTexmacs(elmt))
	} else if (isObjectWithText(o)) {
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
			if (
				!(
					(typeof new_value === 'object' &&
						isEmptyObject(new_value as object)) ||
					(Array.isArray(new_value) && new_value.length === 0) ||
					!new_value
				)
			)
				result[key] = new_value
			return result
		},
		init ? init : ({} as { [index: string]: T }),
	)
}

// https://stackoverflow.com/questions/23437476/in-typescript-how-to-check-if-a-string-is-numeric#:~:text=Most%20of%20the%20time%20the,%26%26%20isFinite(Number(n))%3B
export function isNumeric(str: number | string) {
	return !isNaN(+str)
}

export function isInteger(str: number | string) {
	return !isNaN(+str) && Number.isInteger(+str)
}

export function convertToTime(ms: number) {
	const days = Math.floor(ms / (1000 * 60 * 60 * 24))
	const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
	const seconds = Math.floor((ms % (1000 * 60)) / 1000)
	const milliseconds = Math.floor(ms % 1000)
	return { days, hours, minutes, seconds, milliseconds }
}

export const magnify_lg = '1.125em'
export const magnify_xl = '1.25em'
export const magnify_2xl = '1.5em'
export const magnify_3xl = '1.875em'

export {
	getLogger,
	shuffle,
	isEmptyObject,
	getPropertyName,
	lexicoSort,
	cleanString,
}
