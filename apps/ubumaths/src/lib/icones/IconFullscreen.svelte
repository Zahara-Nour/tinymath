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
			d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z"
		/>
	</svg>
</div>
