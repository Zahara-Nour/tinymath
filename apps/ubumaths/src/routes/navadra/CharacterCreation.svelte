<script lang="ts">
	import { player } from '$lib/navadraStore'
	import { getLogger, getRandomIntInclusive } from '$lib/utils'
	import { tuto } from '$lib/navadraState'
	import { defaultPlayerProfile, playersManager } from './js/player'
	import { monstersManager } from './js/monsters'
	import { user } from '$lib/stores'
	import type { MonsterCaracs, Sex, Tutor } from '../../types/navadra_types'
	import chevron1 from '$lib/images/navadra/icones/chevron1.png'
	import chevron2 from '$lib/images/navadra/icones/chevron2.png'
	import play from '$lib/images/navadra/icones/play.png'

	let { info, fail, warn } = getLogger('CharacterCreation', 'info')
	let pseudo = ''
	let sex: Sex = 'fille'
	let num = 1
	let eyes = 'bleu'
	let skin = 'asi'
	let hair = 'blond'

	$: avatar = `${sex}_${num}_${hair}_${eyes}_${skin}`
	$: avatar_head = `tete_${avatar}`

	function checkPseudo() {}

	async function createPlayer() {
		let profile = {
			...defaultPlayerProfile,
			pseudo,
			avatar,
			sex,
			user_id: $user.id,
			monsters_ids: [],
			tutor: ['Namuka', 'Katillys', 'Sivem', 'Leorn'][
				getRandomIntInclusive(0, 3)
			] as Tutor,
		}

		const p = playersManager.createPlayer(profile)
		p.definePosition()
		tuto.start() // l'automate gérant le tutoriel
		p.profile.tuto = JSON.stringify($tuto)

		// création du premier monstre
		// initialiasition avec le feu pour element
		let caracs: MonsterCaracs = {
			name: 'Vipère',
			element: 'feu',
			category: 'offensif',
		}
		switch (p.element) {
			case 'eau':
				caracs = {
					name: 'Couleuvre',
					element: 'eau',
					category: 'offensif',
				}
				break
			case 'vent':
				caracs = {
					name: 'Vautour',
					element: 'vent',
					category: 'equilibre',
				}
				break
			case 'terre':
				caracs = {
					name: 'Cobra',
					element: 'terre',
					category: 'offensif',
				}
				break
		}
		const monster = monstersManager.createMonster({ caracs })
		monster.definePosition()
		await monstersManager.insertDB(monster)

		console.log('premier monster', monster)
		p.profile.monsters_ids.push(monster.profile.id)
		p.monsters = [monster]
		console.log('profile', p.profile)
		await playersManager.insertDB(p)
		player.set(p)
	}
</script>

<!-- Fond contenant le formulaire -->
<div class="fond l70 mh2 prolonge_moyen">
	<div class="titre">Création du personnage</div>

	<!-- Début première page formulaire -->
	<div id="partie1">
		<div class="col50">
			<p>
				<span class="label">Pseudo :</span>
				<input
					class="champ navadra-input"
					autocomplete="off"
					type="text"
					title="Entre 3 et 15 caractères : lettres, chiffres, espace et certains caractères spéciaux (' -@_)"
					name="pseudo"
					bind:value={pseudo}
				/>
			</p>
		</div>

		<!-- Fin première page formulaire -->
	</div>

	<!-- Début deuxième page formulaire -->
	<div id="partie2">
		<div class="col50">
			<div class="label">
				<span>Tu es :</span>
			</div>
			<div id="sex" class="navadra-input">
				<input
					type="radio"
					name="sex"
					id="fille"
					value="fille"
					bind:group={sex}
				/><label for="fille">une fille</label>
				<input
					type="radio"
					name="sex"
					id="gars"
					value="gars"
					bind:group={sex}
				/><label for="gars">un gars</label>
			</div>
			<div class="label">Cheveux :</div>
			<div class="navadra-input">
				{#each ['blond', 'roux', 'brun', 'noir'] as c}
					<span
						on:keyup={() => {}}
						on:click={() => {
							hair = c
						}}
						class:selected={hair === c}
						class="case_coul"
						id={`cheveux_${c}`}
					/>
				{/each}
			</div>
			<div class="label">Yeux :</div>
			<div class="navadra-input">
				{#each ['bleu', 'vert', 'marron', 'noir'] as y}
					<span
						on:keyup={() => {}}
						on:click={() => {
							eyes = y
						}}
						class:selected={eyes === y}
						class="case_coul"
						id={`yeux_${y}`}
					/>
				{/each}
			</div>
			<div class="label">Peau :</div>
			<div class="navadra-input">
				{#each ['occ', 'asi', 'met', 'noi'] as p}
					<span
						on:keyup={() => {}}
						on:click={() => {
							skin = p
						}}
						class:selected={skin === p}
						class="case_coul"
						id={`peau_${p}`}
					/>
				{/each}
			</div>
		</div>
		<div class="col50">
			<div class="navadra-input">
				<div class="ib l10 align_milieu devant">
					<img
						on:keyup={() => {}}
						on:click={() => {
							num = num === 1 ? 8 : num - 1
						}}
						id="chevron1"
						alt="avatar suivant"
						src={chevron1}
					/>
				</div>
				<div class="ib l70 align_milieu derriere">
					<img
						id="modele_avatar"
						alt="avatar"
						src={`/images/navadra/avatars/${avatar}.png`}
					/>
				</div>
				<div class="ib l10 align_milieu devant">
					<img
						on:keyup={() => {}}
						on:click={() => {
							num = num === 8 ? 1 : num + 1
						}}
						id="chevron2"
						alt="avatar précédent"
						src={chevron2}
					/>
				</div>
			</div>
			<!-- <input type="hidden" name="avatarHead" value="<?= $_POST["avatarHead"]; ?>"> -->
			<!-- <input type="hidden" name="avatar" value="<?= $_POST["avatar"]; ?>"> -->
		</div>

		<!-- Bouton pour valider le formulaire -->
		<span on:keyup={() => {}} on:click={createPlayer} class="bouton form_droite"
			>C'est parti !</span
		>
		<img
			on:keyup={() => {}}
			on:click={createPlayer}
			alt="valider personnage"
			class="icone_form_droite"
			src={play}
		/>

		<!-- Fin deuxième page formulaire -->
	</div>

	<!-- Fin du fond -->
</div>

<style>
	.selected {
		border: 3px solid #1c9500;
	}
</style>
