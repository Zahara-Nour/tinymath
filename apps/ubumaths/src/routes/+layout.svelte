<script>
	// import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
	import '../theme.postcss'
	import '@skeletonlabs/skeleton/styles/all.css'
	import '../app.postcss'
	import { AppShell, AppBar } from '@skeletonlabs/skeleton'
	import { LightSwitch } from '@skeletonlabs/skeleton'
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
	<meta />
</svelte:head>
