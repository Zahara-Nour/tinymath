<script>
	import { player } from '$lib/navadraStore'
	import CharacterCreation from './CharacterCreation.svelte'
	import { user } from '$lib/stores'

	// async function updatePlayer(connected) {
	// if (connected) {
	// 	const p = await playersManager.loadDB()
	// 	if (p) {
	// 		player.set(p)
	// 		console.log('tuto', JSON.parse(p.profile.tuto))
	// 		const previousState = State.create(JSON.parse(p.profile.tuto))
	// 		tuto.start(previousState)
	// 	}
	// } else {
	// 	player.set(null)
	// 	tuto.stop()
	// }

	// création des monstres enregistrés
	// newUser.navadra.profile.monstres = []
	// if (newUser.navadra.profile.monstres_ids.length) {
	// 	newUser.navadra.profile.monstres_ids.forEach(async (id) => {
	// 		const monstre_params = await selectDB({
	// 			table: 'navadra_monstres',
	// 			eqs: [['id', id]],
	// 			single: true,
	// 		})
	// 		const monstre = hydrateMonstre(monstre_params)
	// 		newUser.navadra.profile.monstres.push(monstre)
	// 		console.log('monstre', monstre)
	// 	})
	// }
	// }

	// $: updatePlayer($connected)
</script>

<svelte:head>
	<link rel="stylesheet" href="/css/navadra/basic_styles.css?nvd_r=xxx" />
	<link
		rel="stylesheet"
		href="/css/navadra/styles_grands_ordis.css?nvd_r=xxx"
		media="only screen and (min-width: 1751px)"
	/>
	<link
		rel="stylesheet"
		href="/css/navadra/styles_ordis.css?nvd_r=xxx"
		media="only screen and (min-width: 992px) and (max-width: 1750px)"
	/>
	<link
		rel="stylesheet"
		href="/css/navadra/styles_tablettes.css?nvd_r=xxx"
		media="only screen and (min-width: 769px) and (max-width: 991px)"
	/>
	<link
		rel="stylesheet"
		href="/css/navadra/styles_mobiles.css?nvd_r=xxx"
		media="only screen and (max-width: 768px)"
	/>
</svelte:head>

{#if !$user.isGuest() && $player.profile.pseudo !== ''}
	<slot />
{:else if !$user.isGuest()}
	<CharacterCreation />
{:else}
	<p>
		Le jeu Navadra a été initialement créé par l'équipe de Michel Ferry qui a
		publié les sources du projet et l'a mis sous license libre. Merci à eux pour
		ce travail formidable ! Je l'ai complètement réécrit (en Javascript) afin
		qu'il s'incorpore au sein d'Ubumaths et que je puisse le modifier et
		l'étendre comme je veux. Pour pouvoir y jouer, il faut d'abord se connecter
		avec le compte du lycée.
	</p>
	<div class="flex justify-center">
		<a class="btn variant-filled-primary" href="/login-navadra">Se connecter</a>
	</div>
{/if}
