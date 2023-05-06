<script lang="ts">
	import VipCardComponent from '$lib/vips/VipCard.svelte'
	import type { StudentProfile, User, VipCard } from '../../../types/type'

	export let cards: VipCard[]
	export let student: StudentProfile
	export let user: User
	console.log('modal drawn cards', cards)
</script>

<div class="flex flex items-center justify-center">
	{#each cards as card}
		<VipCardComponent {card} {student} {user} />
	{/each}
</div>
