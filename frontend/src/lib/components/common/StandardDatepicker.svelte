<script lang="ts">
	import { DatePickerTextField } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	type Props = {
		value?: Date | undefined
		placeholder?: string | undefined
	} & ComponentProps<typeof DatePickerTextField>

	let {
		value = $bindable(undefined),
		placeholder = $bindable(undefined),
		...rest
	}: Props = $props()
</script>

<DatePickerTextField
	bind:selectedDate={value}
	{placeholder}
	--simple-text-field-width="fit-content"
  --simple-textfield-height="40px"
	{...rest}
/>
