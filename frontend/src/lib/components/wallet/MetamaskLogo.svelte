<script lang="ts">
	import metamaskLogo from '$lib/assets/metamask.svg';

	export let width: string = '50',
		height: string = '50';
</script>

<img src={metamaskLogo} alt={''} class="button-icon" {width} {height} />
