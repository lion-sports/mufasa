<script lang="ts">
	import { run } from 'svelte/legacy'

	import { createEventDispatcher, type ComponentProps } from 'svelte'
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import ScoutRoleAutocomplete from '$lib/components/scouts/ScoutRoleAutocomplete.svelte'
	import { VOLLEYBALL_ROLES, type Role } from '@/lib/services/scouts/scouts.service'

	let dispatch = createEventDispatcher<{
		input: {
			field: string
			value?: string
		}
	}>()

	interface Props {
		name?: string | undefined
		shirtNumber?: number | undefined
		shirtPrimaryColor?: string | null | undefined
		shirtSecondaryColor?: string | null | undefined
		isOpponent?: boolean | undefined
		role?: Role | undefined
	}

	let {
		name = $bindable(undefined),
		shirtNumber = $bindable(undefined),
		shirtPrimaryColor = $bindable(undefined),
		shirtSecondaryColor = $bindable(undefined),
		isOpponent = $bindable(undefined),
		role = $bindable(undefined)
	}: Props = $props()

	let selectedRoles: ComponentProps<typeof ScoutRoleAutocomplete>['values'] = $state([])
	run(() => {
		if (role !== undefined) {
			selectedRoles = [role]
		} else selectedRoles = []
	})
</script>

<div class="flex flex-col gap-2">
	<div>
		<LabelAndTextfield
			bind:value={name}
			name="player-name"
			label="Nome"
			oninput={() => {
				dispatch('input', {
					field: 'name',
					value: name
				})
			}}
		></LabelAndTextfield>
	</div>
	<div>
		<LabelAndTextfield
			bind:value={shirtNumber}
			type="number"
			name="player-shirt-number"
			label="Numero di maglia"
		></LabelAndTextfield>
	</div>
	<div class="my-2">
		<LabelAndCheckbox id="player-is-opponent" bind:value={isOpponent} label="Avversario"
		></LabelAndCheckbox>
	</div>
	<div class="my-2">
		<div class="font-medium mb-2">Ruolo</div>
		<ScoutRoleAutocomplete
			roles={[...VOLLEYBALL_ROLES]}
			values={selectedRoles}
			onchange={(e) => (role = e.detail.selection[0]?.value as Role)}
		></ScoutRoleAutocomplete>
	</div>
	<div class="flex gap-2">
		<div class="flex flex-col gap-2 basis-1/2">
			<label for="primary-color">Colore maglia primario</label>
			<input type="color" name="primary-color" bind:value={shirtPrimaryColor} />
		</div>
		<div class="flex flex-col gap-2">
			<label for="secondary-color">Colore maglia secondario</label>
			<input type="color" name="secondary-color" bind:value={shirtSecondaryColor} />
		</div>
	</div>
</div>
