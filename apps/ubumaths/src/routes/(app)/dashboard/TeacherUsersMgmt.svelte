<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, isEmptyObject, objectMap } from '$lib/utils'
	import type { StudentProfile, Teacher } from '../../../types/type'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import VipCards from './VIPCards.svelte'
	import Warnings from './Warnings.svelte'

	export let db: SupabaseClient<Database>

	let { warn, trace, fail } = getLogger('TeacherAwardMgmt', 'warn')
	let u = $user as Teacher
	let selectedClasseId = u.classe_ids[0]
	let selectedStudent: StudentProfile

	$: selectFirstStudent(selectedClasseId)

	function selectFirstStudent(classeId: number) {
		if (classeId) {
			selectedStudent = u.students[classeId][0]
		}
	}

	$: console.log('selectedStudent', selectedStudent)
</script>

<div class="container mx-auto p-4 max-w-screen-md">
	<label class="label">
		<span>Classe</span>
		<select class="select" bind:value={selectedClasseId}>
			{#each u.classe_ids as classe_id}
				{@const classe = u.classes.find((c) => c.id === classe_id)}
				<option value={classe_id}>{classe.name}</option>
			{/each}
		</select>
	</label>

	{#if selectedClasseId}
		<label class="label">
			<span>Elève</span>

			<select class="select" bind:value={selectedStudent}>
				{#each u.students[selectedClasseId].sort( (a, b) => a.firstname.localeCompare(b.firstname), ) as student}
					<option value={student}>{student.firstname} {student.lastname}</option
					>
				{/each}
			</select>
		</label>
	{/if}

	{#if selectedStudent}
		<Warnings {db} student={selectedStudent} />
		<VipCards {db} student={selectedStudent} user={u} short />
	{/if}
</div>
