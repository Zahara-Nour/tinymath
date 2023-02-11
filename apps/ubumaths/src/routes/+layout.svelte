<script>
	// import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
	import '../theme.postcss'
	import '@skeletonlabs/skeleton/styles/all.css'
	import '../app.postcss'
	import { AppShell, AppBar } from '@skeletonlabs/skeleton'
	import { LightSwitch } from '@skeletonlabs/skeleton'
	import { touchDevice, mathliveReady, mathfieldElement } from '$lib/stores'
	import { onMount } from 'svelte'
	onMount(() => {
		// detects a touche screen device at the first touch
		//  https://codeburst.io/the-only-way-to-detect-touch-with-javascript-7791a3346685
		window.addEventListener(
			'touchstart',
			function onFirstTouch() {
				touchDevice.set(true)
				window.removeEventListener('touchstart', onFirstTouch, false)
			},
			false,
		)

		import('tinymathlive')
			.then((m) => {
				mathliveReady.set(true)
				console.log('m', m)
				mathfieldElement.set(m.MathfieldElement)
				// toMarkup.set(m.convertLatexToMarkup)
				// const regex = /\$\$(.*?)\$\$/g
				// const replacement = (_, p1) => m.convertLatexToMarkup(p1)
				// const _formatToHtml = (o) => {
				// 	if (!o) {
				// 		return ''
				// 	}

				// 	if (Array.isArray(o)) {
				// 		return o.map((elmt) => _formatToHtml(elmt))
				// 	} else if (o.text) {
				// 		return { ...o, text: _formatToHtml(o.text) }
				// 	} else if (typeof o === 'string') {
				// 		return o.replace(regex, replacement)
				// 	} else {
				// 		return o
				// 	}
				// }
				// formatToHtml.set(_formatToHtml)
			})
			.catch((e) => {
				fail('erreur while importing mathlive', e)
			})
	})
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase text-primary-500">Ubumaths</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://discord.gg/EXqV7W8MtY"
					target="_blank"
					rel="noreferrer"
				>
					Discord
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://twitter.com/SkeletonUI"
					target="_blank"
					rel="noreferrer"
				>
					Twitter
				</a>
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->

	<slot />
</AppShell>

<svelte:head>
	<title>UbuMaths - Les maths de la chandelle verte</title>
</svelte:head>
