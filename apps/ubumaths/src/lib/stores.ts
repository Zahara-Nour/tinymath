// global store
import type { MathfieldElement } from 'tinymathlive'
import { get, writable, type Writable } from 'svelte/store'
import type { FormatToHtmlArg } from './type'
import { isObjectWithText } from './utils'
import { getLogger } from '$lib/utils'
let { info, fail, warn } = getLogger('store', 'info')

export const storedGrade = writable('')
export const fontSize = writable(16)
export const touchDevice = writable(false)
export const mathliveReady = writable(false)
export const virtualKeyboardMode = writable(false)
export const mathfieldElement: Writable<null | typeof MathfieldElement> =
	writable(null)

// convertit les sous-chaines $$...latex...$$ en markup HTML
// entrée : chaine, tableau, objet (le champs text est converti et enregistré dans le champs html)
export const formatLatexToHtml = writable(
	(o: FormatToHtmlArg): NonNullable<FormatToHtmlArg> => '',
)

// convertit une chaine Latex valide en Markup Html (pas besoin des $$...$$ dans l'expression)
export const toMarkup = writable((o: string) => o)

export function prepareMathlive() {
	if (!get(mathliveReady)) {
		import('tinymathlive')
			.then((m) => {
				console.log('m', m)
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
						return { ...o, html: _formatToHtml(o.text) }
					} else if (typeof o === 'string') {
						return o.replace(regex, replacement)
					} else {
						return o
					}
				}
				formatLatexToHtml.set(_formatToHtml)
			})
			.catch((e) => {
				fail('erreur while importing mathlive', e)
			})
	}
}
