// global store
import type { MathfieldElement } from 'tinymathlive'
import { get, writable, type Writable } from 'svelte/store'
import type { FormatToHtmlArg, User } from '../types/type'
import { isObjectWithText } from './utils'
import { getLogger } from '$lib/utils'
let { info, fail, warn } = getLogger('store', 'info')
import { browser, building, dev, version } from '$app/environment'
import { guest } from './users'
import { mdc_colors } from './colors'

// let correct_color = mdc_colors['lime-500']
export const correct_color = writable('#a3d651')
// let unoptimal_color = mdc_colors['amber-300']
export const unoptimal_color = writable('#ffc400')
export const incorrect_color = writable(mdc_colors['red-200'])
// let incorrect_color = '#ff6171'
export const color1 = writable(mdc_colors['orange-300'])
export const color2 = writable(mdc_colors['teal-400'])
export const color3 = writable(mdc_colors['pink-300'])
export const fullScreen = writable(false)
export const user: Writable<User> = writable(guest)
export const connected = writable(false)
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
	if (!get(mathliveReady) && browser) {
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
