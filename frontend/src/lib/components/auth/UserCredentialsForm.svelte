<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	import LabelAndTextfield from '../common/LabelAndTextfield.svelte'
	import StandardDatepicker from '../common/StandardDatepicker.svelte'
	import StandardTextfield from '../common/StandardTextfield.svelte'
	import LabelAndCheckbox from '../common/LabelAndCheckbox.svelte'
	import { slide } from 'svelte/transition'

	interface Props {
		firstname: string | undefined
		lastname: string | undefined
		errorMessage: string | undefined
		birthday: Date | undefined
		email: string
		error: boolean
		disabled: boolean
		password: string
		passwordConfirmation: string
		acceptPrivacy: boolean
	}

	let {
		firstname = $bindable(),
		lastname = $bindable(),
		birthday = $bindable(),
		email = $bindable(''),
		password = $bindable(''),
		passwordConfirmation = $bindable(''),
		acceptPrivacy = $bindable(false),
		error = $bindable(false),
		errorMessage = $bindable('')
	}: Props = $props()

	let showPassword: boolean = $state(false)
	let showPasswordConfirmation: boolean = $state(false)
</script>

<div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mt-2 text-left">
	Per favore, inserisci i tuoi dati per creare un account.
</div>
<div class="w-full flex flex-col gap-1 mt-1">
	<div class="w-full flex gap-1.5">
		<div class="w-full">
			<LabelAndTextfield
				error={error && !firstname}
				placeholder="Nome"
				name="firstname"
				bind:value={firstname}
				--simple-textfield-width="100%"
			/>
		</div>
		<div class="w-full">
			<LabelAndTextfield
				error={error && !lastname}
				placeholder="Cognome"
				name="lastname"
				bind:value={lastname}
				--simple-textfield-width="100%"
			/>
		</div>
	</div>

	<div
		class="h-fit mb-1 m-0 p-0 rounded-full"
		style:border={error && !birthday ? '1px solid rgb(var(--global-color-error-500))' : ''}
	>
		<StandardDatepicker
			class={{ textfield: { row: '!mb-0 !pb-0', field: 'flex items-center' } }}
			bind:value={birthday}
			placeholder="Data di nascita"
			--simple-textfield-height="40px"
			--simple-textfield-default-width="100%"
			--simple-textfield-max-width="100%"
			--simple-text-field-width="100%"
		/>
	</div>

	<StandardTextfield
		error={error && !email}
		type="text"
		bind:value={email}
		placeholder="Email"
		--simple-textfield-width="100%"
	/>

	<StandardTextfield
		error={error && (!password || password !== passwordConfirmation)}
		type={showPassword ? 'text' : 'password'}
		bind:value={password}
		placeholder="Password"
		--simple-textfield-width="100%"
	>
		{#snippet appendInner()}
			<button onclick={() => (showPassword = !showPassword)} class="flex items-center">
				<Icon name={showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'} />
			</button>
		{/snippet}
	</StandardTextfield>

	<StandardTextfield
		error={error && (!passwordConfirmation || password !== passwordConfirmation)}
		type={showPasswordConfirmation ? 'text' : 'password'}
		bind:value={passwordConfirmation}
		placeholder="Conferma Password"
		--simple-textfield-width="100%"
	>
		{#snippet appendInner()}
			<button
				onclick={() => (showPasswordConfirmation = !showPasswordConfirmation)}
				class="flex items-center"
			>
				<Icon name={showPasswordConfirmation ? 'mdi-eye-off-outline' : 'mdi-eye-outline'} />
			</button>
		{/snippet}
	</StandardTextfield>
</div>

<div class="mb-2 flex items-center w-full text-xs">
	{#if error && errorMessage}
		<span transition:slide={{ axis: 'y' }} class="text-[rgb(var(--global-color-error-500))]"
			>{errorMessage}</span
		>
	{/if}
</div>

<div class="w-full mt-1 text-xs {error && !acceptPrivacy ? "text-[rgb(var(--global-color-error-500))]" : "text-[rgb(var(--global-color-foreground))]"}">
	<LabelAndCheckbox
		bind:value={acceptPrivacy}
		id="accept-privacy"
		label="Accetto tutti i termini e le condizioni sulla privacy"
	/>
</div>
