<script lang="ts">
	import { DateTime } from 'luxon'
	import { DatePickerTextField } from '@likable-hair/svelte'

	export let value: Date | undefined = undefined,
		placeholder: string | undefined = undefined
</script>

<DatePickerTextField
	selectedDate={value}
	bind:placeholder
	--simple-text-field-width="fit-content"
	on:day-click
	on:input
/>
