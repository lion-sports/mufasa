<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	import LabelAndTextfield from '../common/LabelAndTextfield.svelte'
	import StandardDatepicker from '../common/StandardDatepicker.svelte'
	import StandardTextfield from '../common/StandardTextfield.svelte'
	import LabelAndCheckbox from '../common/LabelAndCheckbox.svelte'
	import { slide } from 'svelte/transition'
	import type { SignupState } from '@/lib/services/auth/signup.svelte'

	interface Props {
    signupState: SignupState
	}

	let {
		signupState = $bindable(),
	}: Props = $props()

	let showPassword: boolean = $state(false)
	let showPasswordConfirmation: boolean = $state(false)
</script>

<div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mb-2 text-left">
	Inserisci i tuoi dati per creare un account.
</div>
<div class="w-full flex flex-col gap-1 mt-1">
	<div class="w-full flex gap-1.5">
		<div class="w-full">
			<LabelAndTextfield
				error={signupState.validationData.firstname?.error}
        hint={signupState.validationData.firstname?.message}
				placeholder="Nome"
				name="firstname"
				bind:value={signupState.signup.firstname}
				--simple-textfield-width="100%"
			/>
		</div>
		<div class="w-full">
			<LabelAndTextfield
				error={signupState.validationData.lastname?.error}
        hint={signupState.validationData.lastname?.message}
				placeholder="Cognome"
				name="lastname"
				bind:value={signupState.signup.lastname}
				--simple-textfield-width="100%"
			/>
		</div>
	</div>

	<div
		class="h-fit mb-1 m-0 p-0 rounded-full"
		style:border={signupState.validationData.birthday?.error ? '1px solid rgb(var(--global-color-error-500))' : ''}
	>
		<StandardDatepicker
			class={{ textfield: { row: '!mb-0 !pb-0', field: 'flex items-center' } }}
			bind:value={signupState.signup.birthday}
			placeholder="Data di nascita"
			--simple-textfield-height="40px"
			--simple-textfield-default-width="100%"
			--simple-textfield-max-width="100%"
			--simple-text-field-width="100%"
		/>
	</div>

	<StandardTextfield
		error={signupState.validationData.email?.error}
    hint={signupState.validationData.email?.message}
		type="text"
		bind:value={signupState.signup.email}
		placeholder="Email"
		--simple-textfield-width="100%"
	/>

  <div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mb-2 mt-8 text-left">
    Inserisci la password del tuo account
  </div>

	<StandardTextfield
		error={signupState.validationData.password?.error}
    hint={signupState.validationData.password?.message}
		type={showPassword ? 'text' : 'password'}
		bind:value={signupState.signup.password}
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
		error={signupState.validationData.passwordConfirmation?.error}
    hint={signupState.validationData.passwordConfirmation?.message}
		type={showPasswordConfirmation ? 'text' : 'password'}
		bind:value={signupState.signup.passwordConfirmation}
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

<!-- <div class="mb-2 flex items-center w-full text-xs">
	{#if error && errorMessage}
		<span transition:slide={{ axis: 'y' }} class="text-[rgb(var(--global-color-error-500))]"
			>{errorMessage}</span
		>
	{/if}
</div> -->

<div class="w-full mt-1 text-xs {signupState.validationData.acceptTermsAndCondition?.error ? "text-[rgb(var(--global-color-error-500))]" : "text-[rgb(var(--global-color-foreground))]"}">
	<LabelAndCheckbox
		bind:value={signupState.signup.acceptTermsAndCondition}
		id="accept-privacy"
		label="Accetto tutti i termini e le condizioni sulla privacy"
	/>
</div>
