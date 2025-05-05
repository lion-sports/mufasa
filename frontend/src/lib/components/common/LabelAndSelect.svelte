<script lang="ts" module>
	import type { Option } from '$lib/components/common/StandardSelect.svelte'
</script>

<script lang="ts">
import type { ComponentProps } from 'svelte'


	import StandardSelect from './StandardSelect.svelte'
	interface Props {
		value?: string | number | undefined;
		label: string;
		name: string;
		options: Option[];
		disabled?: boolean;
    onchange?: ComponentProps<typeof StandardSelect>['onchange']
	}

	let {
		value = $bindable(undefined),
		label,
		name,
		options,
		disabled = false,
    onchange
	}: Props = $props();
</script>

<label style:font-weight="500" style:margin-left="3px" for={name}>{label}</label>
<div style:margin-top="5px">
	<StandardSelect bind:value {options} {disabled} {onchange} />
</div>
