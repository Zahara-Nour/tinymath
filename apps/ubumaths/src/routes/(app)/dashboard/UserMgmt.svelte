<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { grades } from '$lib/grades'
	import { enhance, type SubmitFunction } from '$app/forms'
	import { getLogger } from '$lib/utils'
	import type {
		Admin,
		Classe,
		InsertUserData,
		StudentProfile,
		TeacherProfile,
	} from '../../../types/type'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import { get } from 'svelte/store'
	import {
		DB_insertClass,
		DB_fetchClasseStudents,
		DB_fetchSchoolClasses,
		DB_fetchSchoolTeachers,
	} from '$lib/db'
	import { Pulse } from 'svelte-loading-spinners'
	import {
		Accordion,
		AccordionItem,
		ListBox,
		ListBoxItem,
		popup,
		toastStore,
		type PopupSettings,
	} from '@skeletonlabs/skeleton'
	import { cleanProfile } from '$lib/users'

	export let db: SupabaseClient<Database>

	let { warn, trace, fail } = getLogger('UserMgmt', 'warn')
	let textarea: string = ''
	let rows: InsertUserData[] = []
	let className = ''
	let selectedGrade = grades[0]
	let selectedSchool = 0
	let selectedSchoolId = 0
	let selectedClasses: number[] = []
	let selectedStudents: number[] = []
	let selectedTeachers: number[] = []
	let schoolName = ''
	let schoolCity = ''
	let schoolCountry = ''
	let schools = (get(user) as Admin).schools
	let classes: Classe[] = []
	let teachers: TeacherProfile[] = []
	let teacherFirstName = ''
	let teacherLastName = ''
	let teacherEmail = ''
	let students: Record<number, StudentProfile[]> = {}

	let pendingAddClass = false
	let pendingAddTeacher = false
	let pendingAddSchool = false
	let pendingAddStudents = false

	let popupAddClass: PopupSettings = {
		// Set the event as: click | hover | hover-click
		event: 'hover',
		// Provide a matching 'data-popup' value.
		target: 'popupAddClass',
	}

	$: processCells(textarea)

	$: selectedSchoolId =
		schools && schools.length > 0 ? schools[selectedSchool].id : 0

	$: getClasses(selectedSchoolId)

	$: getStudents(selectedClasses)

	$: getTeachers(selectedSchoolId)

	async function getTeachers(school_id: number) {
		const { data: teachersData, error: teachersError } =
			await DB_fetchSchoolTeachers(db, school_id)
		teachers = []
		if (teachersError) {
			fail(teachersError.message)
			toastStore.trigger({
				message: 'La récupération des professeurs a échoué.',
				background: 'bg-error-500',
			})
		} else if (!teachersData) {
			fail('No teachers found')
			toastStore.trigger({
				message: 'Aucun professeur trouvé.',
				background: 'bg-error-500',
			})
		} else {
			teachers = teachersData.map(
				(teacher) => cleanProfile(teacher) as TeacherProfile,
			)
		}
	}
	async function getStudents(classe_indexes: number[]) {
		console.log('classe_indexes', classe_indexes, 'classes', classes)
		const promises = classe_indexes
			.filter((classe_index) => !students[classes[classe_index].id])
			.map((classe_index) =>
				DB_fetchClasseStudents(db, classes[classe_index].id),
			)
		const results = await Promise.all(promises)
		console.log('results', results)
		results.forEach(({ data, error }, i) => {
			if (error) {
				fail(error.message)
				toastStore.trigger({
					message: `La récupération des élèves a échoué pour la classe ${classes[i].name}.`,
					background: 'bg-error-500',
				})
			} else if (!data) {
				fail('No students found')
				toastStore.trigger({
					message: `Aucun élève trouvé pour la classe ${classes[i].name}.`,
					background: 'bg-error-500',
				})
			} else {
				console.log('data', data)
				data.forEach((studentData) => {
					const classe_id = classes[i].id
					const studentProfile = cleanProfile(studentData) as StudentProfile
					if (students[classe_id]) {
						students[classe_id].push(studentProfile)
					} else {
						students[classe_id] = [studentProfile]
					}
				})
			}
		})
	}

	function toggleClasse(i: number) {
		if (selectedClasses.includes(i)) {
			selectedClasses = selectedClasses.filter((j) => j !== i)
		} else {
			selectedClasses = [...selectedClasses, i]
		}
	}

	async function getClasses(school_id: number) {
		const oldsSelectedClassesIds = selectedClasses.map((i) => classes[i].id)
		const { data: classesData, error: classesError } =
			await DB_fetchSchoolClasses(db, school_id)
		classes = []
		if (classesError) {
			fail(classesError.message)
			toastStore.trigger({
				message: 'La récupération des classes a échoué.',
				background: 'bg-error-500',
			})
		} else if (!classesData) {
			fail('No classes found')
			toastStore.trigger({
				message: 'Aucune classe trouvée.',
				background: 'bg-error-500',
			})
		} else {
			classes = classesData.sort((a, b) => a.name.localeCompare(b.name))
		}
		selectedClasses = classes
			.filter((classe) => oldsSelectedClassesIds.includes(classe.id))
			.map((classe) => classes.indexOf(classe))
	}

	function processCells(text: string) {
		if (text) {
			rows = text.split('\n').map((row) => {
				console.log('row', row)
				const cells = row.split('\t')
				console.log('cells', cells)
				return {
					email: cells[0],
					firstname: cells[1],
					lastname: cells[2],
					grade: cells[3],
					classe_ids: (JSON.parse(cells[4]) as string[]).map(
						(name) => classes.find((classe) => classe.name === name)!.id,
					) as number[],
					role: 'student',
					school_id: selectedSchoolId,
					teacher_id: teachers.find((teacher) => teacher.email === cells[5])
						?.id,
					teacher_uuid: teachers.find((teacher) => teacher.email === cells[5])
						?.auth_id,
					gidouilles: 0,
					vips: JSON.stringify({}),
				}
			})
			console.log('rows', rows)
		}
	}

	const submitAddClass: SubmitFunction = async ({ action, cancel }) => {
		pendingAddClass = true
		const { error } = await DB_insertClass(db, {
			name: className,
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
			getClasses(schools![selectedSchool].id)
		}
		pendingAddClass = false
		cancel()
	}
	const submitSchool: SubmitFunction = async ({ action, cancel }) => {
		pendingAddSchool = true
		const { data, error } = await db.from('schools').insert({
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
			// getSchools
		}
		pendingAddSchool = false
		cancel()
	}

	const submitAddTeacher: SubmitFunction = async ({ action, cancel }) => {
		pendingAddTeacher = true
		const { error } = await db.from('users').insert({
			email: teacherEmail,
			role: 'teacher',
			school_id: schools![selectedSchool].id,
			firstname: teacherFirstName,
			lastname: teacherLastName,
			classe_ids: selectedClasses.map((i) => classes[i].id),
		})

		if (error) {
			fail(error.message)
			toastStore.trigger({
				message: 'L’ajout du professeur a échoué.',
				background: 'bg-error-500',
			})
		} else {
			toastStore.trigger({
				message: 'Le professeur a été ajouté avec succès.',
				background: 'bg-success-500',
			})
			getTeachers(schools![selectedSchool].id)
		}
		pendingAddTeacher = false
		cancel()
	}

	const submitAddStudents: SubmitFunction = async ({ action, cancel }) => {
		pendingAddStudents = true
		const { error } = await db.from('users').insert(rows)
		if (error) {
			fail(error.message)
			toastStore.trigger({
				message: 'L’ajout des élèves a échoué.',
				background: 'bg-error-500',
			})
		} else {
			toastStore.trigger({
				message: 'Les élèves ont été ajoutés avec succès.',
				background: 'bg-success-500',
			})
			students = {}
			getStudents(selectedClasses)
		}
		pendingAddStudents = false
		cancel()
	}
</script>

<PageHeader title="Gestion des utilisateurs" />

<div class="mt-8 card">
	<header class="card-header"><h3 class="card-title">Ecole</h3></header>
	<section class="p-4">
		<select class="select" size="1" bind:value={selectedSchool}>
			{#each schools as school, i}
				{@const name =
					school.country + ' - ' + school.city + ' - ' + school.name}
				<option value={i}>{name}</option>
			{/each}
		</select>
		<Accordion class="mt-4">
			<AccordionItem open>
				<svelte:fragment slot="summary">Classes</svelte:fragment>
				<svelte:fragment slot="content"
					><div class="flex flex-wrap">
						{#each classes as classe, i}
							<button
								class={'m-1 btn ' +
									(selectedClasses.includes(i)
										? ' variant-filled-primary'
										: ' variant-filled-tertiary')}
								on:click={() => toggleClasse(i)}
							>
								{classe.name}</button
							>
						{/each}
					</div></svelte:fragment
				>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="summary">Professeurs</svelte:fragment>
				<svelte:fragment slot="content">
					<ListBox multiple>
						{#each teachers as teacher}
							<ListBoxItem
								bind:group={selectedTeachers}
								name="teachers"
								value={teacher.id}
								><svelte:fragment slot="lead" />
								{teacher.firstname}
								{teacher.lastname}
								{teacher.classe_ids
									.map((id) => classes.find((classe) => classe.id === id)?.name)
									.join(', ')}
								<svelte:fragment slot="trail">trail</svelte:fragment
								></ListBoxItem
							>
						{/each}
					</ListBox>
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="summary">Eleves</svelte:fragment>
				<svelte:fragment slot="content">
					<ListBox multiple>
						{#each selectedClasses.sort((a, b) => a - b) as classe_index}
							{@const classe_id = classes[classe_index].id}
							{#if students[classe_id]}
								{#each students[classe_id] as student}
									<ListBoxItem
										bind:group={selectedStudents}
										name={`student ${student.id}`}
										value={student.id}
										><svelte:fragment slot="lead"
											>{classes[classe_index].name}
										</svelte:fragment>
										{student.firstname + ' ' + student.lastname}
										<svelte:fragment slot="trail" /></ListBoxItem
									>
								{/each}
							{/if}
						{/each}
					</ListBox>
				</svelte:fragment>
			</AccordionItem>
			<!-- ... -->
		</Accordion>
	</section>
</div>

<div class="mt-8 card">
	<header class="card-header"><h3>Ajouter une classe</h3></header>
	<section class="p-4">
		<form method="post" use:enhance={submitAddClass}>
			<div class="flex flex-col">
				<label class="label">
					<span>Nom de la classe</span>
					<input
						class="input"
						class:input-error={classes.map((c) => c.name).includes(className)}
						type="text"
						bind:value={className}
					/>
				</label>
				<label class="label">
					<span>Grade</span>
					<select class="select" bind:value={selectedGrade}>
						{#each grades as grade}
							<option value={grade}>{grade}</option>
						{/each}
					</select>
				</label>
			</div>
			<div class="flex justify-center">
				{#if pendingAddClass}
					<span class="mt-8">
						<Pulse size="60" color="#ffc400" unit="px" duration="1s" />
					</span>
				{:else}
					<div class="p-1 inline-block" use:popup={popupAddClass}>
						<button
							disabled={!schools ||
								!schools.length ||
								!className ||
								!selectedGrade ||
								classes.map((c) => c.name).includes(className)}
							class="my-4 btn variant-filled-tertiary"
						>
							Créer la classe
						</button>
					</div>
				{/if}
			</div>
		</form>
	</section>
	<footer class="card-footer" />
</div>

<div class="mt-8 card">
	<header class="card-header"><h3>Ajouter un professeur</h3></header>
	<section class="p-4">
		<form method="post" use:enhance={submitAddTeacher}>
			<div class="flex flex-col">
				<label class="label">
					<span>Prénom</span>
					<input class="input" type="text" bind:value={teacherFirstName} />
				</label>
				<label class="label">
					<span>Nom</span>
					<input class="input" type="text" bind:value={teacherLastName} />
				</label>
				<label class="label">
					<span>Email</span>
					<input class="input" type="text" bind:value={teacherEmail} />
				</label>
			</div>
			<div class="flex justify-center">
				{#if pendingAddTeacher}
					<span class="mt-8">
						<Pulse size="60" color="#ffc400" unit="px" duration="1s" />
					</span>
				{:else}
					<button
						disabled={teachers.some(
							(teacher) => teacher.email === teacherEmail,
						) ||
							!selectedClasses.length ||
							!teacherFirstName ||
							!teacherLastName ||
							!teacherEmail}
						class="my-4 btn variant-filled-tertiary"
					>
						Ajouter le professeur
					</button>
				{/if}
			</div>
		</form>
	</section>
	<footer class="card-footer" />
</div>

<div class="mt-8 card">
	<header class="card-header"><h3>Ajouter des élèves</h3></header>
	<section class="p-4">
		<form method="post" use:enhance={submitAddStudents}>
			<div class="flex flex-col">
				<label class="label">
					<span>Coller les cellules contenant les profils élèves.</span>
					<textarea
						class="textarea"
						rows="4"
						placeholder="Coller les cellules contenant les profils élèves."
						bind:value={textarea}
					/>
					<div class="table-container">
						<table class="table table-hover">
							<thead>
								<tr>
									<th>Email</th>
									<th>Prénom</th>
									<th>Nom</th>
									<th>Grade</th>
									<th>Classes</th>
									<th>Professeur</th>
								</tr>
							</thead>
							<tbody>
								{#each rows as row}
									<tr>
										<td>{row.email}</td>
										<td>{row.firstname}</td>
										<td>{row.lastname}</td>
										<td>{row.grade}</td>
										<td
											>{row.classe_ids?.map(
												(id) => classes.find((c) => c.id === id)?.name,
											)}</td
										>
										<td
											>{teachers.find(
												(teacher) => teacher.id === row.teacher_id,
											)?.email}</td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</label>
			</div>
			<div class="flex justify-center">
				{#if pendingAddStudents}
					<span class="mt-8">
						<Pulse size="60" color="#ffc400" unit="px" duration="1s" />
					</span>
				{:else}
					<button disabled={!textarea} class="my-4 btn variant-filled-tertiary">
						Ajouter les élèves
					</button>
				{/if}
			</div>
		</form>
	</section>
</div>

<div class="mt-4 card">
	<header class="card-header"><h3>Ajouter une école</h3></header>
	<section class="p-4">
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
				{#if pendingAddSchool}
					<span class="mt-8">
						<Pulse size="60" color="#ffc400" unit="px" duration="1s" />
					</span>
				{:else}
					<button
						disabled={!schoolName || !schoolCity || !schoolCountry}
						class="my-4 btn variant-filled-tertiary"
					>
						Ajouter l'école
					</button>
				{/if}
			</div>
		</form>
	</section>
	<footer class="card-footer" />
</div>

<div class="card variant-filled-secondary p-4" data-popup="popupAddClass">
	Some text goes here.
	<!-- Append the arrow element -->
	<div class="arrow variant-filled-secondary" />
</div>

<style>
	button:disabled {
		pointer-events: auto;
	}
</style>
