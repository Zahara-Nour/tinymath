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
	<div class="max-h-32 flex items-center justify-center">
		<img class="h-full" alt={card.name} src={image} />
	</div>
	<div class="p-2 mt-6">
		<div
			class="my-2 font-bold text-2xl text-primary-500 w-full h-auto text-center"
			style="font-family: 'Baloo 2', sans-serif;"
		>
			{card.title}
		</div>
		<div class="text-black">{card.text}</div>
	</div>
</div>
