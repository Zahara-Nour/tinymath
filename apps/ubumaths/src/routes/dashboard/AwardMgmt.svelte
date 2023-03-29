<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, objectMap } from '$lib/utils'
	import {
		Accordion,
		AccordionItem,
		ListBox,
		ListBoxItem,
		popup,
		toastStore,
		type PopupSettings,
	} from '@skeletonlabs/skeleton'
	import type { StudentProfile, Teacher } from '$lib/type'
	import IconPlus from '$lib/icones/IconPlus.svelte'
	import IconMinus from '$lib/icones/IconMinus.svelte'
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import { enhance } from '$app/forms'
	import { updateGidouille } from '$lib/db'

	export let db: SupabaseClient<Database>

	let pendingGidouille: Record<number, boolean> = {}

	async function drawVipCard(student: StudentProfile) {
		if (student.gidouilles >= 3) {
			pendingGidouille[student.id] = true
			const { error } = await updateGidouille(
				db,
				student.id,
				(student.gidouilles -= 3),
			)
			if (error) {
				console.log(error.message)
				toastStore.trigger({
					message: 'Le retrait de gidouilles a échoué.',
					background: 'bg-error-500',
				})
			} else {
				student.gidouilles -= 3
				// force update
				u = u
			}
			pendingGidouille[student.id] = false
		}
	}

	async function addGidouille(student: StudentProfile) {
		console.log('adding gidouille')
		pendingGidouille[student.id] = true
		const { error } = await updateGidouille(
			db,
			student.id,
			student.gidouilles + 1,
		)
		if (error) {
			console.log(error.message)
			toastStore.trigger({
				message: "L'ajout de gidouille a échoué.",
				background: 'bg-error-500',
			})
		} else {
			student.gidouilles += 1
			// force update
			u = u
		}
		pendingGidouille[student.id] = false
	}
	async function removeGidouille(student: StudentProfile) {
		if (student.gidouilles > 0) {
			pendingGidouille[student.id] = true
			const { error } = await updateGidouille(
				db,
				student.id,
				student.gidouilles - 11,
			)
			if (error) {
				console.log(error.message)
				toastStore.trigger({
					message: 'Le retrait de gidouille a échoué.',
					background: 'bg-error-500',
				})
			} else {
				student.gidouilles -= 1
				// force update
				u = u
			}
			pendingGidouille[student.id] = false
		}
	}
	let { warn, trace, fail } = getLogger('assessmentMgmt', 'warn')
	let u = $user as Teacher
</script>

<PageHeader title="Récompenses / Avertissements" />

<div class="mt-8 card">
	<header class="card-header"><h3 class="card-title">Gidouilles</h3></header>
	<section class="p-4">
		<Accordion class="mt-4">
			{#each u.classes as classe}
				<AccordionItem open>
					<svelte:fragment slot="summary">{classe.name}</svelte:fragment>
					<svelte:fragment slot="content">
						<ul class="list">
							{#each u.students[classe.id] as student}
								<li>
									<div
										class="flex  justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2 mb-2"
									>
										<div class="text-xl font-bold overflow-hidden">
											{student.firstname + ' ' + student.lastname}
										</div>

										<div class="flex gap-1 items-center">
											<button
												class="btn-icon variant-filled-primary"
												disabled={pendingGidouille[student.id]}
												on:click={() => removeGidouille(student)}
											>
												<IconMinus />
											</button>
											<span>{student.gidouilles}</span>
											<Gidouille />
											<button
												class="btn-icon variant-filled-primary"
												disabled={pendingGidouille[student.id]}
												on:click={() => addGidouille(student)}
											>
												<IconPlus />
											</button>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	</section>
</div>
