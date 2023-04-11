import { writable } from 'svelte/store'
import { defaultPlayer } from '../routes/navadra/js/player'

export const player = writable(defaultPlayer)
