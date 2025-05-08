<script lang="ts">
	import StandardTextfield from '../common/StandardTextfield.svelte'
	import { SPORTS, type Sport } from 'lionn-common'
	import type { Option } from '../common/StandardSelect.svelte'

	interface Props {
		sport: Sport | undefined
		name: string
		notes?: string
		error: boolean
	}

	let {
		sport = $bindable(),
		name = $bindable(''),
		notes = $bindable(''),
		error = $bindable(false)
	}: Props = $props()

	const sportOptions: Option[] = SPORTS.map((sport) => ({
		text: sport[0].toUpperCase() + sport.substring(1),
		value: sport
	}))
</script>

<div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mt-2 text-left">
	Si prega di fornire i dettagli per creare la tua squadra.
</div>
<div class="h-full w-full flex flex-col gap-2 mt-1">
	<div class="mt-1">
		<StandardTextfield
			class={{ row: '!m-0 !p-0' }}
			error={error && !name}
			type="text"
			bind:value={name}
			placeholder="Nome"
			--simple-textfield-width="100%"
		/>
	</div>

	<select
		bind:value={sport}
		class="w-full p-2.5 px-3 text-[rgb(var(--global-color-contrast-900))] hover:cursor-pointer {!sport
			? 'text-[rgb(var(--global-color-contrast-300))]'
			: ''}"
		style:border-radius="999px"
		style:background="rgb(var(--global-color-background-200))"
		style:font-family="inherit"
		style:font-size="inherit"
		placeholder="Sport"
	>
		{#each sportOptions as option}
			<option selected={false} value={option.value}>{option.text}</option>
		{/each}
		<option value="" disabled selected hidden>Sport</option>
	</select>

	<div
		style:background="rgb(var(--global-color-background-200))"
		class="flex-grow h-full rounded-2xl overflow-hidden w-full flex justify-center mb-5"
	>
		<textarea
			name="notes"
			id="notes"
			bind:value={notes}
			placeholder="Note..."
			class="h-full rounded-2xl w-full resize-none bg-transparent p-1.5 px-[16px]"
		></textarea>
	</div>
</div>
