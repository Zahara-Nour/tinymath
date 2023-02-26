<script lang="ts">
	import IconBasket from '$lib/icones/IconBasket.svelte'
	import IconBasketPlus from '$lib/icones/IconBasketPlus.svelte'
	import IconFlash from '$lib/icones/IconFlash.svelte'
	import IconLink from '$lib/icones/IconLink.svelte'
	import IconNewspaper from '$lib/icones/IconNewspaper.svelte'
	import IconProjector from '$lib/icones/IconProjector.svelte'
	import IconQuestion from '$lib/icones/IconQuestion.svelte'
	import IconRocket from '$lib/icones/IconRocket.svelte'
	import IconRun from '$lib/icones/IconRun.svelte'
	import IconTrash from '$lib/icones/IconTrash.svelte'
	import type { Basket } from '$lib/type'

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

<div class="py-3 flex flex-wrap sticky   bg-surface-50-900-token  top-0">
	<div class="grow" />

	<button on:click={copyLink} class={classNotSelected}><IconLink /></button>

	<button on:click={generateExoTexmacs} class={classNotSelected}
		><IconNewspaper /></button
	>

	<button
		on:click={toggleCourseAuxNombres}
		class={courseAuxNombres ? classSelected : classNotSelected}
		><IconRun /></button
	>

	<button
		on:click={toggleClassroom}
		class={classroom ? classSelected : classNotSelected}
		><IconProjector /></button
	>

	<button
		on:click={toggleFlash}
		class={flash ? classSelected : classNotSelected}><IconFlash /></button
	>

	<button
		on:click={toggleExemple}
		class={displayExemple ? classSelected : classNotSelected}
		><IconQuestion /></button
	>

	<button on:click={fillBasket} class={classNotSelected}
		><IconBasketPlus /></button
	>

	<button on:click={flushBasket} class={classNotSelected}><IconTrash /></button>

	<div class="relative inline-block">
		{#if basket.length}
			<span class={'badge variant-filled-error absolute -top-2 -right-1 z-1'}
				>{basket.reduce((acc, item) => acc + item.count, 0)}</span
			>
		{/if}
		<span>
			<button
				on:click={toggleBasket}
				class={showBasket ? classSelected : classNotSelected}
				><IconBasket /></button
			>
		</span>
	</div>

	<button on:click={launchTest} class={classNotSelected}><IconRocket /></button>
</div>
