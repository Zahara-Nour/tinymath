<script lang="ts">
	import cards from './cards'
	import { fetchImage } from '$lib/images'
	import type { VipCard } from '../../types/type'

	export let name: string
	let image: string
	const card: VipCard = cards.find((c) => c.name === name)!
	console.log('card', card, name)
	fetchImage(card.image, 'public/vips').then((img) => {
		image = img
	})
</script>

<div
	class="flex flex-col w-64 h-96 rounded-xl border-8 border-yellow-300 bg-white"
>
	<div><img alt={card.name} src={image} /></div>
	<div class="p-2">
		<div
			class="my-2 font-bold text-2xl text-primary-500 w-full h-auto"
			style="font-family: 'Baloo 2', sans-serif;"
		>
			{card.title}
		</div>
		<div>{card.text}</div>
	</div>
</div>
