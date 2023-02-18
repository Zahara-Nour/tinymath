// global store
import type { MathfieldElement } from 'tinymathlive'
import { writable, type Writable } from 'svelte/store'
import type { FormatToHtmlArg } from './type'
import { isObjectWithText } from './utils'
import { getLogger } from '$lib/utils'
let { info, fail, warn } = getLogger('store', 'info')

export const touchDevice = writable(false)
export const mathliveReady = writable(false)
export const virtualKeyboardMode = writable(false)
export const mathfieldElement: Writable<null | typeof MathfieldElement> =
	writable(null)
export const formatToHtml = writable(
	(o: FormatToHtmlArg): NonNullable<FormatToHtmlArg> => '',
)
export const toMarkup = writable((o: string) => o)

export function prepareMathlive() {
	if (mathliveReady) {
		import('tinymathlive')
			.then((m) => {
				mathliveReady.set(true)
				mathfieldElement.set(m.MathfieldElement)
				toMarkup.set(m.convertLatexToMarkup)
				const regex = /\$\$(.*?)\$\$/g

				const replacement = (_: string, p1: string) =>
					m.convertLatexToMarkup(p1)

				const _formatToHtml = (
					o: FormatToHtmlArg,
				): NonNullable<FormatToHtmlArg> => {
					if (!o) {
						return ''
					}

					if (Array.isArray(o)) {
						return o.map((elmt) => _formatToHtml(elmt))
					} else if (isObjectWithText(o)) {
						return { ...o, text: _formatToHtml(o.text) }
					} else if (typeof o === 'string') {
						return o.replace(regex, replacement)
					} else {
						return o
					}
				}
				formatToHtml.set(_formatToHtml)
			})
			.catch((e) => {
				fail('erreur while importing mathlive', e)
			})
	}
}
