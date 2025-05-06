<script lang="ts">
	import StandardTextfield from '../common/StandardTextfield.svelte'
	import { SPORTS, type Sport } from '@/lib/services/scouts/scouts.service'
	import StandardSelect, { type Option } from '../common/StandardSelect.svelte'

	interface Props {
		sport: Sport | undefined
		name: string
		notes?: string
		error: boolean
	}

	let {
		sport = $bindable(undefined),
		name = $bindable(''),
		notes = $bindable(''),
		error = $bindable(false)
	}: Props = $props()

	const sportOptions: Option[] = SPORTS.map((sport) => ({
		text: sport[0].toUpperCase() + sport.substring(1),
		value: sport
	}))
</script>

<div class="w-full flex flex-col gap-2 mt-5">
	<select
		bind:value={sport}
		class="w-full p-2.5 px-3 text-[rgb(var(--global-color-contrast-900))] capitalize hover:cursor-pointer"
		style:border-radius="999px"
		style:background="rgb(var(--global-color-background-200))"
		style:font-family="inherit"
		style:font-size="inherit"
	>
		{#each sportOptions as option}
			<option value={option.value}>
				{option.text}
			</option>
		{/each}
	</select>

	<div class="mt-1">
		<StandardTextfield
			error={error && !name}
			type="text"
			bind:value={name}
			placeholder="Name"
			--simple-textfield-width="100%"
		/>
	</div>

	<div
		style:background="rgb(var(--global-color-background-200))"
		class="rounded-2xl overflow-hidden w-full flex justify-center"
	>
		<textarea
			name="notes"
			id="notes"
			bind:value={notes}
			placeholder="Notes..."
			class="h-32 w-full resize-none bg-transparent p-1.5 px-3"
		></textarea>
	</div>
</div>
