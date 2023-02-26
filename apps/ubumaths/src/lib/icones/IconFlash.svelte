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
		<path d="M7,2V13H10V22L17,10H13L17,2H7Z" />
	</svg>
</div>
