<script lang="ts">
	import { DatePickerTextField, SimpleTextField } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	let clazz: {
		activator?: string | undefined
		textfield?: ComponentProps<SimpleTextField>['class']
	} = {}
	export { clazz as class }

	export let value: Date | undefined = undefined
	export let placeholder: string | undefined = undefined
</script>

<DatePickerTextField
	class={clazz}
	selectedDate={value}
	bind:placeholder
	--simple-text-field-width="fit-content"
	on:day-click
	on:input
/>
