<script lang="ts">
	import metamaskLogo from '$lib/assets/phantom-logo.svg';

	export let width: string = '30',
		height: string = '30';
</script>

<img src={metamaskLogo} alt={''} class="button-icon" {width} {height} />
