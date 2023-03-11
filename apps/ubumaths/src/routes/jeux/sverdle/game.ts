import { words, allowed } from './words.server'

export class Game {
	index: number
	guesses: string[]
	answers: string[]
	answer: string
	size: number

	/**
	 * Create a game object from the player's cookie, or initialise a new game
	 */
	constructor(serialized: string | undefined = undefined) {
		if (serialized) {
			const [index, guesses, answers] = serialized.split('-')

			this.index = +index
			this.answer = words[this.index]
			this.size = this.answer.length
			this.guesses = guesses ? guesses.split(' ') : []
			this.answers = answers ? answers.split(' ') : []
			console.log('serialiazed game answer', this.answer, this.answer.length)
		} else {
			this.index = Math.floor(Math.random() * words.length)
			this.answer = words[this.index]
			this.size = this.answer.length
			this.guesses = ['', '', '', '', '', '']
			this.answers = []
			console.log('init game answer', this.answer, this.answer.length)
		}
	}

	/**
	 * Update game state based on a guess of a five-letter word. Returns
	 * true if the guess was valid, false otherwise
	 */
	enter(letters: string[]) {
		console.log('answer', this.answer, this.answer.length)
		const word = letters.join('')
		const valid = allowed.has(word)

		if (!valid) return false

		this.guesses[this.answers.length] = word

		const available = Array.from(this.answer)
		const answer = Array(this.size).fill('_')

		// first, find exact matches
		for (let i = 0; i < this.size; i += 1) {
			if (normalizeString(letters[i]) === normalizeString(available[i])) {
				answer[i] = 'x'
				available[i] = ' '
			}
		}

		// then find close matches (this has to happen
		// in a second step, otherwise an early close
		// match can prevent a later exact match)
		for (let i = 0; i < this.size; i += 1) {
			if (answer[i] === '_') {
				const index = available
					.map(normalizeString)
					.indexOf(normalizeString(letters[i]))
				if (index !== -1) {
					answer[i] = 'c'
					available[index] = ' '
				}
			}
		}

		this.answers.push(answer.join(''))

		return true
	}

	/**
	 * Serialize game state so it can be set as a cookie
	 */
	toString() {
		return `${this.index}-${this.guesses.join(' ')}-${this.answers.join(' ')}`
	}
}

function normalizeString(str: string) {
	return str
	// .normalize('NFD')
	// .replace(/[\u0300-\u036f]/g, '')
	// .toLowerCase()
}
