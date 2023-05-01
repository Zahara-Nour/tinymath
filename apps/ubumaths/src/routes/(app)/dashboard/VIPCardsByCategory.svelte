<script lang="ts">
	import VipCard from '$lib/vips/VipCard.svelte'
	import { toastStore } from '@skeletonlabs/skeleton'
	import type { StudentProfile } from '../../../types/type'
	import { updateVip } from '$lib/db'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'

	export let cards: Record<string, number> = {}
	export let student: StudentProfile
	export let db: SupabaseClient<Database>
	export let category = ''

	let pendingVip = false

	async function useVip(cardName: string) {
		pendingVip = true
		const { error } = await updateVip(db, student.id, {
			...student.vips,
			[cardName]: student.vips[cardName] - 1,
		})
		if (error) {
			console.log(error.message)
			toastStore.trigger({
				message: "La carte VIP n'a pas pu être utilisée.",
				background: 'bg-error-500',
			})
		} else {
			student.vips[cardName] -= 1
			console.log('card used', student.vips[cardName])
			toastStore.trigger({
				message: 'La carte a été utilisée.',
				background: 'bg-success-500',
			})
			cards[cardName] -= 1
		}
		pendingVip = false
	}
</script>

<div class="mt-6">
	<div class="font-bold text-2xl mb-4">{category}</div>
	<div class="flex gap-8 flex-wrap justify-center items-center">
		{#each Object.entries(cards) as [name, count] (name)}
			{#if count > 0}
				<div class="flex flex-col items-center">
					<div class="relative inline-block">
						{#if count > 1}
							<span
								class="badge-icon variant-filled-success absolute -top-0 -right-0 z-10 w-10 h-10"
								><span class="text-white text-xl">{count}</span></span
							>
							<VipCard {name} />
						{:else}
							<VipCard {name} />
						{/if}
					</div>
					<div>
						<button
							class="btn mt-2 variant-filled-primary"
							disabled={pendingVip}
							on:click={() => useVip(name)}
						>
							Use
						</button>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
