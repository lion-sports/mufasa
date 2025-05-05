<script lang="ts">
	import { Textarea } from '@likable-hair/svelte'

	interface Props {
		label?: string;
		placeholder?: string;
		value?: string;
	}

	let { label = '', placeholder = '', value = $bindable('') }: Props = $props();
</script>

<Textarea
	{label}
	{placeholder}
	bind:value
	backgroundColor="transparent"
	paddingBottom="8px"
	paddingTop="6px"
	paddingRight="10px"
	paddingLeft="10px"
	fontSize="1rem"
	width="90%"
	height="130px"
	textColor="rgb(var(--global-color-contrast-900))"
	focusedBoxShadow="rgb(149 157 165 / 20%) 2px 2px 10px"
	on:input
/>
