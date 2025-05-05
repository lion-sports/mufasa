<script lang="ts">
	import metamaskLogo from '$lib/assets/metamask.svg';

	interface Props {
		width?: string;
		height?: string;
	}

	let { width = '50', height = '50' }: Props = $props();
</script>

<img src={metamaskLogo} alt={''} class="button-icon" {width} {height} />
