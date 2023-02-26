<script lang="ts">
	export let handleClick: () => void
</script>

<button class=" ${$$props.class}" on:click={handleClick}>
	<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
		<rect width="100" height="20" />
		<rect y="30" width="100" height="20" />
		<rect y="60" width="100" height="20" />
	</svg>
</button>
