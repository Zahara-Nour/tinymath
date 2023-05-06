import { getLogger, getRandomIntInclusive } from '$lib/utils'
import { player } from '$lib/navadraStore'
import { get } from 'svelte/store'
import db, {
	DB_fetchMonster,
	DB_insertMonster,
	DB_updateMonster,
} from '$lib/db'
import { defaultPlayerProfile, playersManager } from './player'
import type {
	Element,
	Monster,
	MonsterCaracs,
	MonsterCategory,
	MonsterInfos,
	MonsterProfile,
	Position,
} from '../../../types/navadra_types'
import monstersCaracs from './monstersCaracs'

let { trace, info, fail, warn } = getLogger('player', 'trace')

export const monstersManager = {
	createMonster,
	hydrateMonster,
	async loadDB(monster_id: number) {
		const { error, data } = await DB_fetchMonster(db, monster_id)
		if (error) {
			fail('error while loading monster', error.message)
			return null
		} else if (!data) {
			fail('monster not found')
			return null
		} else {
			const profile = {
				...data,
				position: JSON.parse(data.position) as Position,
				element: data.element as Element,
				category: data.category as MonsterCategory,
			}
			const monster = hydrateMonster(profile)
			return monster
		}
	},

	async insertDB(monster: Monster) {
		const { error, data } = await DB_insertMonster(db, {
			...monster.profile,
			position: JSON.stringify(monster.profile.position),
		})
		if (error) {
			fail('coud not insert monster', error.message)
		} else if (!data) {
			fail('no data returned after inserted new monster')
		} else {
			monster.profile.id = data.id
			trace('saved monster', data)
		}
	},

	async updateDB(monster: Monster) {
		const { error, data } = await DB_updateMonster(db, {
			...monster.profile,
			position: JSON.stringify(monster.profile.position),
		})
		if (error) {
			fail('coud not update monster', error.message)
		} else {
			trace('updated monster', data)
		}
	},
}

const defaultMonsterProfile: MonsterProfile = {
	id: 0,
	nb_hunters: 1,
	level: 1,
	category: 'offensif',
	name: '',
	element: 'feu',
	dead: false,
	position: {
		x: 0,
		y: 0,
	},
}

function hydrateMonster(profile: MonsterProfile): Monster {
	return {
		profile,

		get pm() {
			// on crée un joueur du même niveau que le monstre
			const p = playersManager.createPlayer({
				...defaultPlayerProfile,
				level: get(player).profile.level,
			})
			const coeffPlayer = 0.33
			const bonusType = 0.67
			let base = Math.ceil(p.stamina * coeffPlayer)
			switch (this.profile.category) {
				case 'offensif':
					base = (1 + bonusType) * base
					break

				case 'defensif':
					base = bonusType * base
					break
			}
			if (this.profile.nb_hunters == 4.5) {
				//Si ce sont des monstres multijoueurs balèzes on leur donne un bonus
				base = base * 1.05
			} else if (this.profile.nb_hunters == 8) {
				//Si ce sont des monstres multijoueurs balèzes on leur donne un bonus
				base = base * 1.1
			}
			return Math.round(base)
		},
		get stamina() {
			// on crée un joueur du même niveau que le monstre
			const p = playersManager.createPlayer({
				...defaultPlayerProfile,
				level: get(player).profile.level,
			})
			const coeffPlayer = 3.5
			const bonusType = 0.67
			let base = Math.floor(
				p.pm * coeffPlayer + 0.07 * p.pm * this.profile.level,
			)
			switch (this.profile.category) {
				case 'offensif':
					base = bonusType * base
					break
				case 'defensif':
					base = (1 + bonusType) * base
					break
			}
			return Math.round(this.profile.nb_hunters * base)
		},

		defineBorderColorHex() {
			switch (this.profile.element) {
				case 'feu':
					return '#ad0101'
				case 'eau':
					return '#016dad'
				case 'vent':
					return '#f2b819'
				case 'terre':
					return '#0aae02'
			}
		},

		defineNameColorHex() {
			switch (this.profile.element) {
				case 'feu':
					return '#eec2c3'
				case 'eau':
					return '#caecf6'
				case 'vent':
					return '#f1eec1'
				case 'terre':
					return '#ccf7ca'
			}
		},

		definePosition() {
			const playerProfile = get(player).profile
			console.log('playerProfile', playerProfile)
			const playerPosition = playerProfile.position
			console.log('playerPosition', playerPosition)
			let ok = 1
			const playerWidth = 10 //On prend la largeur du joueur et des monstres
			const playerHeight = 10
			const monsterWidth = 12
			const monsterHeight = 10
			let xmin = 0,
				xmax = 0,
				ymin = 0,
				ymax = 0
			let x = 0,
				y = 0
			while (ok > 0) {
				switch (
					this.profile.element //Détermination de l'intervalle de position possible en fonction de l'élément du monster
				) {
					case 'feu':
						xmin = 530
						xmax = 680
						ymin = 470
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
						ymin = 500
						ymax = 720
						break
					case 'terre':
						xmin = 500
						xmax = 680
						ymin = 170
						ymax = 380
						break
				}
				ok = 0
				x = getRandomIntInclusive(xmin, xmax) / 10
				y = getRandomIntInclusive(ymin, ymax) / 10
				if (
					Math.abs(x - playerPosition.x) <= playerWidth &&
					Math.abs(y - playerPosition.y) <= playerHeight
				) {
					// Si la position générée se chevauche avec celle du joueur
					ok++
				}
				//On récupère chaque monster pour tester le chevauchement de position
				get(player).monsters.forEach((monster) => {
					if (
						Math.abs(x - monster.profile.position.x) <= monsterWidth &&
						Math.abs(y - monster.profile.position.y) <= monsterHeight
					) {
						// Si la position générée se chevauche avec celle du monster
						ok++
					}
				})
			}
			this.profile.position = {
				x,
				y,
			}
		},
	}
}
function createMonster({
	level = 1,
	nb_hunters = 1,
	caracs,
}: MonsterInfos): Monster {
	if (!caracs) caracs = setMonsterCharacs(nb_hunters)
	const profile = {
		...defaultMonsterProfile,
		level,
		nb_hunters,
		...caracs,
	}
	return hydrateMonster(profile)
}

function setMonsterCharacs(nb_hunters: number) {
	//Permet d'attribuer des caractéristiques aléatoire à un nouveau monster en fonction du nb de chasseurs recommandé

	const list = monstersCaracs[nb_hunters]
	return list[Math.floor(Math.random() * list.length)]
}
