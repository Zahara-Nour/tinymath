<script lang="ts">
	import { addUsers, supabaseClient } from '$lib/db'
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { grades } from '$lib/grades'
	import { enhance, type SubmitFunction } from '$app/forms'
	import { getLogger } from '$lib/utils'
	import { toastStore } from '@skeletonlabs/skeleton'
	import type { School } from '$lib/type'
	import { add_classes } from 'svelte/internal'

	let { warn, trace, fail } = getLogger('UserMgmt', 'warn')
	let textarea: string = ''
	let rows: UserInfo[] = []
	let className = ''
	let selectedGrade = grades[0]
	let selectedSchool = 0
	let schoolName = ''
	let schoolCity = ''
	let schoolCountry = ''
	let schools: School[] | null = null
	type UserInfo = {
		email: string
		role: string
		grade: string
		classes: string[]
	}

	fetchSchools()

	$: processCells(textarea)
	$: if (schools) {
		selectedSchool = 0
	}

	function fetchSchools() {
		supabaseClient
			.from('schools')
			.select('name, city, country, id')
			.then((res) => {
				if (res.error) {
					fail(res.error.message)
					toastStore.trigger({
						message: 'La récupération des écoles a échoué.',
						background: 'bg-error-500',
					})
				} else if (!res.data) {
					fail('No schools found')
					toastStore.trigger({
						message: 'Aucune école trouvée.',
						background: 'bg-error-500',
					})
				} else {
					schools = res.data
					console.log('schools', schools)
				}
			})
	}
	function processCells(text: string) {
		if (text) {
			rows = text.split('\n').map((row) => {
				console.log('row', row)
				const cells = row.split('\t')
				console.log('cells', cells)
				return {
					email: cells[0],
					role: cells[1],
					grade: cells[2],
					classes: JSON.parse(cells[3]) as string[],
				}
			})
			console.log('rows', rows)
		}
	}

	const submitClass: SubmitFunction = async ({ action, cancel }) => {
		const { error } = await supabaseClient.from('classes').insert({
			class: className,
			grade: selectedGrade,
			school_id: schools![selectedSchool].id,
		})
		if (error) {
			fail(error.message)
			toastStore.trigger({
				message: 'La création de la classe a échoué.',
				background: 'bg-error-500',
			})
		} else {
			toastStore.trigger({
				message: 'La classe a été créée avec succès.',
				background: 'bg-success-500',
			})
		}
		cancel()
	}
	const submitSchool: SubmitFunction = async ({ action, cancel }) => {
		const { data, error } = await supabaseClient.from('schools').insert({
			name: schoolName,
			city: schoolCity,
			country: schoolCountry,
		})
		if (error) {
			fail(error.message)
			toastStore.trigger({
				message: "La création de l'école a échoué.",
				background: 'bg-error-500',
			})
		} else {
			toastStore.trigger({
				message: "L'école a été créée avec succès.",
				background: 'bg-success-500',
			})
		}
		cancel()
	}
</script>

<PageHeader title="Gestion des utilisateurs" />
<h3>Ajouter des élèves</h3>
<textarea
	class="textarea"
	rows="4"
	placeholder="Coller les cellules contenant les profils utilisateurs."
	bind:value={textarea}
/>

<div class="table-container">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>Email</th>
				<th>Role</th>
				<th>Grade</th>
				<th>Classes</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td>{row['email']}</td>
					<td>{row['role']}</td>
					<td>{row['grade']}</td>
					<td>{row['classes'].toString()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="flex justify-center">
	<button
		on:click={() => addUsers(rows)}
		class="my-4 btn variant-filled-tertiary">Créer les utilisateurs</button
	>
</div>

<h3>Ajouter une classe</h3>

<form method="post" use:enhance={submitClass}>
	<div class="flex flex-col">
		<label class="label">
			<span>Nom de la classe</span>
			<input class="input" type="text" bind:value={className} />
		</label>
		<label class="label">
			<span>Grade</span>
			<select class="select" size="4" bind:value={selectedGrade}>
				{#each grades as grade}
					<option value={grade}>{grade}</option>
				{/each}
			</select>
		</label>
		<label class="label">
			<span>Ecole</span>
			{#if schools}
				<select class="select" size="4" bind:value={selectedSchool}>
					{#each schools as school, i}
						<option value={i}
							>{`${school.country} - ${school.city} - ${school.name}`}</option
						>
					{/each}
				</select>
			{/if}
		</label>
	</div>
	<div class="flex justify-center">
		<button
			disabled={!schools || !schools.length || !className || !selectedGrade}
			class="my-4 btn variant-filled-tertiary">Créer la classe</button
		>
	</div>
</form>

<h3>Ajouter une école</h3>

<form method="post" use:enhance={submitSchool}>
	<div class="flex flex-col">
		<label class="label">
			<span>Nom de l'école</span>
			<input class="input" type="text" bind:value={schoolName} />
		</label>
		<label class="label">
			<span>Ville</span>
			<input class="input" type="text" bind:value={schoolCity} />
		</label>
		<label class="label">
			<span>Pays</span>
			<input class="input" type="text" bind:value={schoolCountry} />
		</label>
	</div>
	<div class="flex justify-center">
		<button
			disabled={!schoolName || !schoolCity || !schoolCountry}
			class="my-4 btn variant-filled-tertiary">Ajouter l'école</button
		>
	</div>
</form>
