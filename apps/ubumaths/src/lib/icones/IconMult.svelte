<script>
	export let size = '1.1em'
	export let stroke = 'currentColor'
</script>

<div class="${$$props.class}">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xml:space="preserve"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		version="1.1"
		viewBox="0 0 24 24"
		height={size}
		width={size}
		{stroke}
		fill={stroke}
		stroke-width="0.2"
	>
		<path
			d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
		/>
	</svg>
</div>
