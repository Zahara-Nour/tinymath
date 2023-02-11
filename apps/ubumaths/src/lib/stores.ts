// global store
import type { MathfieldElement } from 'mathlive'
import { writable, type Writable } from 'svelte/store'

export const touchDevice = writable(false)
export const mathliveReady = writable(false)
export const mathfieldElement:Writable<null |typeof MathfieldElement> = writable(null)