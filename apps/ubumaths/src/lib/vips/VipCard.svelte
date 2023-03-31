<script lang="ts">
	import cards from './cards'
	import { fetchImage } from '$lib/images'
	import type { VipCard } from '$lib/type'

	export let name: string
	let image: string
	const card: VipCard = cards.find((c) => c.name === name)!
	fetchImage(card.image, 'public/vips').then((img) => {
		image = img
	})
</script>

<div class="flex flex-col w-64 h-96 rounded-xl border-8 border-yellow-300 ">
	<div><img alt={card.name} src={image} /></div>
	<div
		class="my-2 font-bold text-2xl text-primary-500"
		style="font-family: 'Baloo 2', sans-serif;"
	>
		{card.title}
	</div>
	<div>{card.text}</div>
</div>
