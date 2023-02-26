<script lang="ts">
	import { addUsers } from '$lib/db'
	import PageHeader from '$lib/ui/PageHeader.svelte'
	let textarea: string = ''
	let rows: UserInfo[] = []
	type UserInfo = {
		email: string
		role: string
		grade: string
		classes: string[]
	}
	$: processCells(textarea)

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
</script>

<PageHeader title="Gestion des utilisateurs" />
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
