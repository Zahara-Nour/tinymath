<script lang="ts">
	import cards, { drawVipCards, useVipCard } from './cards'
	import {
		isTeacher,
		type StudentProfile,
		type User,
		type VipCard,
	} from '../../types/type'
	import {
		modalStore,
		toastStore,
		type ModalSettings,
	} from '@skeletonlabs/skeleton'
	import { createEventDispatcher } from 'svelte'
	import DrawnCards from '../../routes/(app)/dashboard/DrawnCards.svelte'

	const dispatch = createEventDispatcher()

	export let card: VipCard
	export let short = false
	export let user: User
	export let student: StudentProfile

	let disabled = false
	let image: string = 'images/vips/' + card.name + '1' + '@0.5x.jpg'
	let modalComponent

	// fetchImage(card.image, 'public/vips').then((img) => {
	// 	image = img
	// })

	async function onUseCard(card: VipCard) {
		console.log('using card', card.name)
		disabled = true
		if (card.effect) {
			console.log('effect', card.effect)
			if (card.effect.name === 'draw') {
				const { error, draws } = await drawVipCards(
					student,
					card.effect.param,
					0,
				)
				if (error) {
					toastStore.trigger({
						message: error.message,
						background: 'bg-error-500',
					})
					return
				} else {
					console.log('drawns cards', cards)
					dispatch('updateVips', {
						text: 'Vips updated',
					})
					modalComponent = {
						// Pass a reference to your custom component
						ref: DrawnCards,
						// Add the component properties as key/value pairs
						props: { cards: draws, student, user },
						// Provide a template literal for the default component slot
						slot: '<p>Skeleton</p>',
					}
					const d: ModalSettings = {
						backdropClasses: '!bg-surface-800 text-black',
						type: 'component',
						// Pass the component directly:
						component: modalComponent,
					}
					modalStore.trigger(d)
				}
			}
		}
		const error = await useVipCard(card, student)
		if (error) {
			console.log("La carte n'a pas puêtre utilisée : " + error.message)
			toastStore.trigger({
				message: "La carte n'a pas pu être utilisée : " + error.message,
			})
		} else {
			console.log('La carte a été utilisée avec succès')
			console.log('vips', student.vips)
			dispatch('updateVips', {
				text: 'Vips updated',
			})
		}
		disabled = false
	}
</script>

<div
	class={' w-64 rounded-xl border-8 border-yellow-300 bg-white ' +
		(short ? 'h-72 max-h-72' : 'h-96 max-h-96')}
>
	<img class="w-full" alt={card.name} src={image} />

	<div class="p-2 flex flex-col items-center justify-start h-2/3">
		<div
			class="my-2 font-bold text-2xl text-primary-500 w-full h-auto text-center"
			style="font-family: 'Baloo 2', sans-serif;"
		>
			{card.title}
		</div>
		{#if !short}
			<div class="text-black">{card.text}</div>
		{/if}
		{#if isTeacher(user)}
			<button
				class="btn mt-2 variant-filled-primary"
				{disabled}
				on:click={() => onUseCard(card)}
			>
				Utiliser
			</button>
		{/if}
	</div>
</div>
