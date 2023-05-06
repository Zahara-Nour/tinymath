import { toastStore } from '@skeletonlabs/skeleton'
import type { StudentProfile, VipCard } from '../../types/type'

import db, { DB_updateStudentGidouille, DB_updateStudentVipWallet } from '../db'

const cardPool: VipCard[] = [
	{
		name: 'mathemagie',
		title: 'Mathémagie',
		text: "Je peux assister le professeur pour un tour de mathémagie, ou le professeur peut m'apprendre un tour de mathémagie pour épater mes amis.",
		image: 'mathemagie.jpg',
		rarity: 'common',
	},
	{
		name: 'captain',
		title: 'Captain',
		text: "Je peux choisir mon rôle lors d'un travail de groupe.",
		image: 'captain.jpg',
		rarity: 'common',
	},
	{
		name: 'lalala',
		title: 'La la la la la',
		text: "Je peux choisis un morceau de musique pour l'entrée ou la sortie du cours.",
		image: 'musique.png',
		rarity: 'common',
	},
	{
		name: 'batman',
		title: 'Batman and Robin',
		text: "Je peux être l'assistant du professeur pour l'aider à distribuer les feuilles ou pour organiser une activité, un tour de mathémagie.",
		image: 'batman.jpg',
		rarity: 'common',
	},
	{
		name: 'jeu',
		title: 'Jeu maths',
		text: "Je peux choisir le jeu mathématique que l'on va faire.",
		image: 'bingo.jpg',
		rarity: 'common',
	},

	{
		name: 'fame',
		title: 'Walk of fame',
		text: "J'ai le droit à mon moment de gloire : je peux afficher une œuvre personnelle dans la classe, raconter une blague à la classe, .....bref, tout ce qui peut me mettre en  valeur aux yeux de la classe..",
		image: 'hollywood.jpg',
		rarity: 'common',
	},
	{
		name: 'tranquilou',
		title: 'Tranquilou',
		text: "J'ai le droit d'avoir oublié de faire mon travail pour cette fois.",
		image: 'tranquilou.jpg',
		rarity: 'uncommon',
	},
	{
		name: 'ecrabouilleur',
		title: 'Ecrabouilleur',
		text: 'Je peux enlever un avertissement.',
		image: 'ecrabouilleur.jpg',
		rarity: 'uncommon',
		effect: {
			name: 'remove_remark',
			param: 1,
		},
	},
	{
		name: 'bougeotte',
		title: 'Bougeotte',
		text: 'Je choisis ma place pour une heure (mais mon professeur peut me remettre à mon ancienne pace si je ne suis pas sérieux)',
		image: 'bougeotte.png',
		rarity: 'uncommon',
	},

	{
		name: 'bonus',
		title: 'Point bonus',
		text: 'A utiliser sur une évaluation',
		image: 'bonus.webp',
		rarity: 'uncommon',
	},
	{
		name: 'memoire',
		title: 'Trou de mémoire',
		text: "J'ai le droit d'utiliser mes cahiers pendant une évaluation.",
		image: 'oubli.jpg',
		rarity: 'uncommon',
	},
	{
		name: 'team',
		title: 'My team',
		text: 'Je peux choisir le groupe avec lequel il faudra produire un travail.',
		image: 'travail-groupe.jpg',
		rarity: 'uncommon',
	},
	{
		name: 'help',
		title: 'Help !',
		text: "J'ai le droit à une aide particulière du professeur pendant mon évaluation.",
		image: 'aide.png',
		rarity: 'uncommon',
	},
	{
		name: 'inventeur',
		title: 'Inventeur',
		text: "Je peux proposer l'idée d'une nouvelle carte VIP ( qui devra être validée par le professeur).",
		image: 'inventeur.jpg',
		rarity: 'uncommon',
	},

	{
		name: 'coup-double',
		title: 'Coup double',
		text: 'Je choisis pour ce trimestre une note qui va compter deux fois.',
		image: 'coup-double.png',
		rarity: 'rare',
	},
	{
		name: 'throne',
		title: 'Game of throne',
		text: "J'ai le droit d'avoir la chaise du prof pour une heure.",
		image: 'throne.jpg',
		rarity: 'rare',
	},

	{
		name: 'super-bonus',
		title: 'Super bonus',
		text: 'Je peux ajouter deux points sur mes évaluations.',
		image: 'bonus.webp',
		rarity: 'rare',
	},

	{
		name: 'Sheikh',
		title: 'Sheikh / Sheikha',
		text: "Je peux prendre la chaise du professeur, j'ai le droit à un karak, et le professeur m'appelle Sheikh ou Sheikha pendant toutes l'heure.",
		image: 'roi.jpg',
		rarity: 'rare',
	},
	{
		name: 'super-bougeotte',
		title: 'Super bougeotte',
		text: 'Je choisis ma place pour une semaine (mais mon professeur peut me remettre à mon ancienne pace si je ne suis pas sérieux)',
		image: 'bougeotte.png',
		rarity: 'rare',
	},

	{
		name: 'soldes',
		title: 'Soldes',
		text: 'Je peux choisir deux autres cartes VIP.',
		image: 'soldes.jpg',
		rarity: 'rare',
		effect: {
			name: 'draw',
			param: 2,
		},
	},
	{
		name: 'choix',
		title: 'Libre choix',
		text: 'Je peux choisir la carte VIP que je veux.',
		image: 'choix.png',
		rarity: 'legendary',
	},
	{
		name: 'mega-bonus',
		title: 'Mega bonus',
		text: 'Je peux ajouter trois points sur mes évaluations.',
		image: 'bonus.webp',
		rarity: 'legendary',
	},
	{
		name: 'mega-soldes',
		title: 'Mega soldes',
		text: 'Je peux piocher 3 nouvelles cartes VIP.',
		image: 'soldes.jpg',
		rarity: 'legendary',
		effect: {
			name: 'draw',
			param: 3,
		},
	},
	{
		name: 'candy',
		title: 'Candy',
		text: "Si mes parents sont d'accord, j'ai le droit à ce que le professeur m'offre un paquet de bonbons.",
		image: 'bonbons.jpg',
		rarity: 'legendary',
	},
]

async function useVipCard(card: VipCard, student: StudentProfile) {
	const newWallet = student.vips
		.map(({ card: c, count }) => ({
			card: c,
			count: c.name === card.name ? count - 1 : count,
		}))
		.filter(({ count }) => count > 0)
	console.log('new wallet', newWallet)

	const result = await DB_updateStudentVipWallet(db, student.id, newWallet)
	console.log('result', result)
	if (result.error) {
		console.log(result.error.message)

		return new Error(
			"La carte VIP n'a pas pu être utilisée : " + result.error.message,
		)
	} else {
		student.vips = newWallet
		return null
	}
}

async function drawVipCards(student: StudentProfile, n = 1, gidouilles = 3) {
	const draws: VipCard[] = []
	const newWallet = [...student.vips]

	if (gidouilles > student.gidouilles) {
		return {
			error: new Error(`Pas assez de gidouilles pour piocher ${n} cartes VIP.`),
			data: null,
		}
	}
	for (let i = 0; i < n; i++) {
		const alea = Math.random()

		const rarity =
			alea < 0.5
				? 'common'
				: alea < 0.85
				? 'uncommon'
				: alea < 0.95
				? 'rare'
				: 'legendary'
		const cards = cardPool.filter((c) => c.rarity === rarity)
		const card = cards[Math.floor(Math.random() * cards.length)]
		draws.push(card)
		const existed = newWallet.find(({ card: c }) => c.name === card.name)
		if (existed) {
			existed.count += 1
		} else {
			newWallet.push({ card, count: 1 })
		}
	}

	const promise = Promise.all([
		DB_updateStudentVipWallet(db, student.id, newWallet),
		DB_updateStudentGidouille(db, student.id, student.gidouilles - gidouilles),
	])
	const results = await promise

	function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
		return value !== null && value !== undefined
	}

	const errors = results.map((result) => result.error).filter(notEmpty)

	if (errors.length) {
		const message =
			'Erreur lors de la mise à jour des vips et des gidouilles : ' +
			errors.map((error) => error.message).join(', ')

		return { error: new Error(message), draws: null }
	} else {
		student.gidouilles -= gidouilles
		student.vips = newWallet
		console.log('draws', draws)
		return { error: null, draws }
	}
}
export { useVipCard, drawVipCards }
export default cardPool
