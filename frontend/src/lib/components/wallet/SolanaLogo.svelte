<script lang="ts">
	import metamaskLogo from '$lib/assets/phantom-logo.svg';

	interface Props {
		width?: string;
		height?: string;
	}

	let { width = '30', height = '30' }: Props = $props();
</script>

<img src={metamaskLogo} alt={''} class="button-icon" {width} {height} />
