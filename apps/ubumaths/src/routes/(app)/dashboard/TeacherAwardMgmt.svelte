<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, objectMap } from '$lib/utils'
	import { Accordion, AccordionItem, toastStore } from '@skeletonlabs/skeleton'
	import type { StudentProfile, Teacher } from '../../../types/type'
	import IconPlus from '$lib/icones/IconPlus.svelte'
	import IconMinus from '$lib/icones/IconMinus.svelte'
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import { DB_updateStudentGidouille, DB_updateStudentVipWallet } from '$lib/db'
	import IconCards from '$lib/icones/IconCards.svelte'

	import VipCards from './VIPCards.svelte'

	export let db: SupabaseClient<Database>

	let pendingGidouille: Record<number, boolean> = {}
	let { warn, trace, fail } = getLogger('TeacherAwardMgmt', 'warn')
	let u = $user as Teacher
	let selectedStudent: StudentProfile | null = null
	let students = u.students

	async function addGidouille(student: StudentProfile) {
		console.log('adding gidouille')
		pendingGidouille[student.id] = true
		const { error } = await DB_updateStudentGidouille(
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
			const { error } = await DB_updateStudentGidouille(
				db,
				student.id,
				student.gidouilles - 1,
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

	function handleUpdateGidouilles() {
		students = students
	}
</script>

<PageHeader title="Récompenses" />

<div class="mt-8 card">
	<header class="card-header"><h3 class="card-title">Gidouilles</h3></header>
	<section class="p-4">
		<Accordion class="mt-4">
			{#each u.classes as classe (classe.id)}
				<AccordionItem open>
					<svelte:fragment slot="summary">{classe.name}</svelte:fragment>
					<svelte:fragment slot="content">
						<ul class="list">
							{#each students[classe.id].sort( (a, b) => a.firstname.localeCompare(b.firstname), ) as student (student.id)}
								<li>
									<div
										class="flex justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2 mb-2"
									>
										<div class="flex flex-col mr-4">
											<div class="text-xl font-bold">
												{student.firstname}
											</div>
											<div class="text-xs">
												{student.lastname}
											</div>
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
											<button
												class="btn-icon variant-filled-primary"
												disabled={pendingGidouille[student.id]}
												on:click={() =>
													(selectedStudent =
														selectedStudent === student ? null : student)}
											>
												<IconCards />
											</button>
										</div>
									</div>
								</li>
								{#if selectedStudent === student}
									<VipCards
										on:updateGidouilles={handleUpdateGidouilles}
										{student}
										{db}
										user={u}
										short
									/>
								{/if}
							{/each}
						</ul>
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	</section>
</div>
