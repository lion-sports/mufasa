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
	selectedDate={value}
	{placeholder}
	--simple-text-field-width="fit-content"
	{...rest}
/>
