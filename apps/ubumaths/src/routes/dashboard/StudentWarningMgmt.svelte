<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, isEmptyObject, objectMap } from '$lib/utils'
	import { Accordion, AccordionItem, toastStore } from '@skeletonlabs/skeleton'
	import type { Student, StudentProfile, Teacher } from '../../types/type'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../types/supabase'
	import {
		fetchDayStudentsTeacherWarnings,
		fetchStudentWarnings,
	} from '$lib/db'
	import { DateTime } from 'luxon'
	import StudentAwardMgmt from './StudentAwardMgmt.svelte'
	export let db: SupabaseClient<Database>

	let { warn, trace, fail } = getLogger('TeacherAwardMgmt', 'warn')
	let u = $user as Student
	let warningsByDate: Record<string, string[]> = {}

	getWarnings()

	async function getWarnings() {
		warningsByDate = {}
		const { data, error } = await fetchStudentWarnings(db, u.id)
		if (error) {
			console.log(error.message)
			toastStore.trigger({
				message: 'Erreur lors de la récupération des avertissements',
				background: 'bg-error-500',
			})
		} else if (!data) {
			toastStore.trigger({
				message: 'Avertissements : aucune donnée',
				background: 'bg-error-500',
			})
		} else {
			warningsByDate = data.reduce((acc, curr) => {
				acc[curr.date] = curr.warnings

				return acc
			}, {} as Record<string, string[]>)
		}
	}
</script>

<PageHeader title="Avertissements" />

{#if warningsByDate && !isEmptyObject(warningsByDate)}
	<div class="mt-8 card">
		<header class="card-header" />
		<section class="p-4">
			{#each Object.entries(warningsByDate).sort( (a, b) => b[0].localeCompare(a[0]), ) as [date, warnings]}
				<h3 class="mt-4">
					{DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
				</h3>
				{#if warnings.length > 0}
					<ul class="list">
						{#each warnings as warning}
							<li>{warning}</li>
						{/each}
					</ul>
				{:else}
					<p>Aucun avertissement</p>
				{/if}
			{/each}
		</section>
	</div>
{/if}
