import { getLogger, getRandomIntInclusive, objectMap } from '$lib/utils'
import { get } from 'svelte/store'
import { player } from '$lib/navadraStore'
import db, { DB_fetchPlayer, DB_insertPlayer, DB_updatePlayer } from '$lib/db'
import { monstersManager } from './monsters'
import type {
	Monster,
	Player,
	PlayerProfile,
	Sex,
	Tutor,
} from '../../../types/navadra_types'
import { user } from '$lib/stores'

let { trace, info, fail, warn } = getLogger('player', 'trace')

export const defaultPlayerProfile: PlayerProfile = {
	id: 0,
	sex: 'fille',
	pseudo: '',
	avatar: '',
	level: 1,
	xp: 0,
	fire_pyrs: 0,
	wind_pyrs: 0,
	water_pyrs: 0,
	earth_pyrs: 0,
	spent_fire_pyrs: 0,
	spent_wind_pyrs: 0,
	spent_water_pyrs: 0,
	spent_earth_pyrs: 0,
	prestige: 0,
	tuto: '',
	tutor: 'Namuka',
	position: {
		x: 0,
		y: 0,
	},
	monsters_ids: [],
}

export const defaultPlayer = createPlayer(defaultPlayerProfile)

function createPlayer(
	profile: PlayerProfile,
	monsters: Monster[] = [],
): Player {
	return {
		profile: { ...defaultPlayerProfile, ...profile },
		monsters,

		getElementsStats(this: Player) {
			let stats: Record<string, number> = {}
			let totalSpentPyrs =
				this.profile.spent_fire_pyrs +
				this.profile.spent_water_pyrs +
				this.profile.spent_wind_pyrs +
				this.profile.spent_earth_pyrs
			if (totalSpentPyrs === 4) {
				//Si le joueur n'a encore dépensé aucune Pyrs
				stats['feu'] = Math.round(
					(this.profile.spent_fire_pyrs / totalSpentPyrs) * 100,
				)
				stats['eau'] = Math.round(
					(this.profile.spent_water_pyrs / totalSpentPyrs) * 100,
				)
				stats['vent'] = Math.round(
					(this.profile.spent_wind_pyrs / totalSpentPyrs) * 100,
				)
				stats['terre'] = Math.round(
					(this.profile.spent_earth_pyrs / totalSpentPyrs) * 100,
				)
				const diff =
					100 - stats['feu'] - stats['eau'] - stats['vent'] - stats['terre'] //Permet de s'assurer que la somme fait 100
				const max = Math.max(...Object.values(stats))
				const elmt = Object.keys(stats).find((key) => stats[key] === max)!
				stats[elmt] = stats[elmt] + diff
			} else {
				const feu = this.profile.spent_fire_pyrs - 1
				const eau = this.profile.spent_water_pyrs - 1
				const vent = this.profile.spent_wind_pyrs - 1
				const terre = this.profile.spent_earth_pyrs - 1
				totalSpentPyrs -= 4
				stats['feu'] = Math.round((feu / totalSpentPyrs) * 100)
				stats['eau'] = Math.round((eau / totalSpentPyrs) * 100)
				stats['vent'] = Math.round((vent / totalSpentPyrs) * 100)
				stats['terre'] = Math.round((terre / totalSpentPyrs) * 100)
				const diff =
					100 - stats['feu'] - stats['eau'] - stats['vent'] - stats['terre'] //Permet de s'assurer que la somme fait 100
				const max = Math.max(...Object.values(stats))
				const elmt = Object.keys(stats).find((key) => stats[key] === max)!
				stats[elmt] = stats[elmt] + diff
			}
			return stats
		},

		defineElement(this: Player) {
			const stats = this.getElementsStats()
			console.log('profile elements', stats)
			const max = Math.max(...Object.values(stats))
			const maxs = Object.keys(stats).filter((key) => stats[key] === max)
			let element = ''

			if (maxs.length > 1) {
				//S'il y a plusieurs maximums à égalité dont l'élément de l'ancien tutor du joueur
				if (this.profile.tutor === 'Namuka' && max === stats['feu']) {
					element = 'feu'
				} else if (this.profile.tutor === 'Katillys' && max === stats['eau']) {
					element = 'eau'
				} else if (this.profile.tutor === 'Sivem' && max === stats['vent']) {
					element = 'vent'
				} else if (this.profile.tutor === 'Leorn' && max === stats['terre']) {
					element = 'terre'
				}
			} else {
				//Sinon on prend le premier élément qui est égal au max
				if (max === stats['feu']) {
					element = 'feu'
				} else if (max === stats['eau']) {
					element = 'eau'
				} else if (max === stats['vent']) {
					element = 'vent'
				} else if (max === stats['terre']) {
					element = 'terre'
				} else {
					fail('defineElement')
				}
			}

			return element
		},

		get element() {
			return this.defineElement()
		},
		get stamina() {
			let level = 1
			let st = 10
			while (level < this.profile.level) {
				level++
				st = Math.ceil(st + level * 3.75)
			}
			return st
		},

		get pm() {
			let level = 1
			let magicPower = 7
			while (level < this.profile.level) {
				level++
				magicPower = Math.ceil(magicPower + level * 1.12)
			}
			return magicPower
		},

		definePosition() {
			let xmin = 0,
				ymin = 0,
				xmax = 0,
				ymax = 0,
				x = 0,
				y = 0
			console.log('element', this.element)
			switch (this.element) {
				case 'feu':
					xmin = 530
					xmax = 680
					ymin = 500
					ymax = 680
					break
				case 'eau':
					xmin = 210
					xmax = 400
					ymin = 210
					ymax = 400
					break
				case 'vent':
					xmin = 250
					xmax = 450
					ymin = 550
					ymax = 720
					break
				case 'terre':
					xmin = 500
					xmax = 680
					ymin = 170
					ymax = 380
					break
			}
			x = getRandomIntInclusive(xmin, xmax) / 10
			y = getRandomIntInclusive(ymin, ymax) / 10
			const position = { x, y }
			this.profile.position = position
		},
	}
}

export const playersManager = {
	createPlayer,

	async loadDB(user_id?: number) {
		if (!user_id) user_id = get(user).id
		const { error, data } = await DB_fetchPlayer(db, user_id)
		if (error) {
			fail('error while loading player', error.message)
			return null
		} else if (!data) {
			fail('player not found')
			return null
		} else {
			console.log('loadDb')
			const profile: PlayerProfile = {
				...data,
				sex: data.sex as Sex,
				tutor: data.tutor as Tutor,
				position: JSON.parse(data.position),
			}
			const monsters: Monster[] = (
				await Promise.all(
					profile.monsters_ids.map((monster_id) =>
						monstersManager.loadDB(monster_id),
					),
				)
			).filter((monster) => monster !== null) as Monster[]
			console.log('monsters', monsters)
			const player = this.createPlayer(profile, monsters)
			console.log('player****', player)
			return player
		}
	},

	async insertDB({ profile }: Player, user_id?: number) {
		if (!user_id) user_id = get(user).id
		const row = {
			...profile,
			position: JSON.stringify(profile.position),
			user_id,
		}
		const { error, data } = await DB_insertPlayer(db, row)
		if (error) {
			fail('coud not insert player', error.message)
		} else if (!data) {
			fail('no data returned after inserted new player')
		} else {
			profile.id = data.id
		}
	},

	async updateDB({ profile }: Player, user_id?: number) {
		if (!user_id) user_id = get(user).id
		const row = {
			...profile,
			position: JSON.stringify(profile.position),
			user_id,
		}
		const { error } = await DB_updatePlayer(db, row)
		if (error) {
			fail('coud not update player', error.message)
		} else {
			trace('player updated')
		}
	},
}
