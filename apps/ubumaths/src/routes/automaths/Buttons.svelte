<script lang="ts">
	import type { Basket } from '$lib/type'
	import { tooltip } from '@skeletonlabs/skeleton'

	export let showBasket = false
	export let basket: Basket
	export let copyLink: () => void
	export let fillBasket: () => void
	export let launchTest: () => void
	export let classroom = false
	export let flash = false
	export let displayExemple = false
	export let flushBasket: () => void
	export let courseAuxNombres = false
	export let generateExoTexmacs: () => void

	const toggleExemple = () => (displayExemple = !displayExemple)
	const toggleBasket = () => (showBasket = !showBasket)
	const toggleClassroom = () => (classroom = !classroom)
	const toggleFlash = () => (flash = !flash)
	const toggleCourseAuxNombres = () => (courseAuxNombres = !courseAuxNombres)

	const classSelected = 'ml-1 btn-icon variant-filled-primary text-2xl'
	const classNotSelected = 'ml-1 btn-icon variant-filled-tertiary text-2xl'
	// $: isLoggedIn = $user.id != 'guest'
	// $: isTeacher = isLoggedIn && $user.roles.includes('teacher')
	// $: isStudent = isLoggedIn && $user.roles.includes('student')
</script>

<div class="py-3 flex flex-wrap sticky top-0 bg-surface-50-900-token">
	<div class="grow" />

	<button
		use:tooltip={{
			content: 'Obtenir le lien vers la série de questions',
			position: 'bottom',
		}}
		on:click={copyLink}
		class={classNotSelected}><iconify-icon icon="mdi:link" /></button
	>

	<button
		use:tooltip={{
			content: 'Générer un exercice pour texmacs',
			position: 'bottom',
		}}
		on:click={generateExoTexmacs}
		class={classNotSelected}
		><iconify-icon icon="mdi:newspaper-variant-outline" /></button
	>

	<button
		use:tooltip={{
			content: 'Passer au mode <i>Course aux nombres</i>',
			position: 'bottom',
		}}
		on:click={toggleCourseAuxNombres}
		class={courseAuxNombres ? classSelected : classNotSelected}
		><iconify-icon icon="mdi:run-fast" /></button
	>

	<button
		use:tooltip={{
			content: 'Activer le mode projection en classe',
			position: 'bottom',
		}}
		on:click={toggleClassroom}
		class={classroom ? classSelected : classNotSelected}
		><iconify-icon icon="mdi:projector-screen" /></button
	>

	<button
		on:click={toggleFlash}
		class={flash ? classSelected : classNotSelected}
		><iconify-icon icon="mdi:flash" /></button
	>

	<button
		use:tooltip={{
			content: 'Afficher un exemple de question',
			position: 'bottom',
		}}
		on:click={toggleExemple}
		class={displayExemple ? classSelected : classNotSelected}
		><iconify-icon icon="mdi:help" /></button
	>

	<button
		use:tooltip={{
			content: 'Ajouter cette question au panier',
			position: 'bottom',
		}}
		on:click={fillBasket}
		class={classNotSelected}><iconify-icon icon="mdi:basket-plus" /></button
	>

	<button
		use:tooltip={{
			content: 'Vider le panier',
			position: 'bottom',
		}}
		on:click={flushBasket}
		class={classNotSelected}
		><iconify-icon icon="mdi:trash-can-outline" /></button
	>

	<div class="relative inline-block">
		{#if basket.length}
			<span class={'badge variant-filled-error absolute -top-2 -right-1 z-1'}
				>{basket.reduce((acc, item) => acc + item.count, 0)}</span
			>
		{/if}
		<span>
			<button
				use:tooltip={{
					content: 'Afficher le panier',
					position: 'bottom',
				}}
				on:click={toggleBasket}
				class={showBasket ? classSelected : classNotSelected}
				><iconify-icon icon="mdi:basket" /></button
			>
		</span>
	</div>

	<button
		use:tooltip={{
			content: 'Lancer la série de questions',
			position: 'left',
		}}
		on:click={launchTest}
		class={classNotSelected}
		><iconify-icon icon="mdi:rocket-launch-outline" /></button
	>
</div>
