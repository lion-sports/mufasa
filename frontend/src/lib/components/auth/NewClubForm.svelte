<script lang="ts">
	import { type Sport } from 'lionn-common'
	import LabelAndTextfield from '../common/LabelAndTextfield.svelte'
	import { Icon } from '@likable-hair/svelte'
	import SportAutocomplete from '../common/SportAutocomplete.svelte'
	import type { SignupState } from '@/lib/services/auth/signup.svelte'

	interface Props {
		signupState: SignupState
	}

	let { signupState = $bindable() }: Props = $props()
</script>

<div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mt-2 text-left">
	Si prega di fornire i dettagli per creare la tua squadra.
</div>
<div class="h-full w-full flex flex-col gap-2 mt-1">
	<div class="grid grid-cols-1 @lg:grid-cols-2 gap-3">
		<div>
			<LabelAndTextfield
				bind:value={signupState.signup.clubName}
				error={signupState.dirtyValidationData.clubName?.error}
				hint={signupState.dirtyValidationData.clubName?.message}
				placeholder="Nome"
				name="name"
				oninput={() => {
					if (!signupState.dirtyFields.includes('clubName')) {
						signupState.dirtyFields = [...signupState.dirtyFields, 'clubName']
					}
				}}
				--simple-textfield-width="100%"
				--simple-textfield-hint-margin-left="4px"
			>
				{#snippet prependInner()}
					<div class="flex items-center">
						<Icon name="mdi-at"></Icon>
					</div>
				{/snippet}
			</LabelAndTextfield>
			<div
				class="text-xs opacity-40 mt-1 ml-1 {signupState.dirtyValidationData.clubName?.error
					? 'hidden'
					: ''}"
			>
				Nome univoco del club, con cui verrai cercato
			</div>
		</div>
		<div>
			<LabelAndTextfield
				placeholder="Nome completo"
				bind:value={signupState.signup.clubCompleteName}
				error={signupState.dirtyValidationData.clubCompleteName?.error}
				hint={signupState.dirtyValidationData.clubCompleteName?.message}
				name="complete-name"
				--simple-textfield-width="100%"
				--simple-textfield-hint-margin-left="4px"
				oninput={() => {
					if (!signupState.dirtyFields.includes('completeClubName')) {
						signupState.dirtyFields = [...signupState.dirtyFields, 'completeClubName']
					}
				}}
			></LabelAndTextfield>
			<div
				class="text-xs opacity-40 mt-1 ml-1 {signupState.dirtyValidationData.clubCompleteName?.error
					? 'hidden'
					: ''}"
			>
				Nome reale della società, che verrà visualizzato
			</div>
		</div>
	</div>
	<div class="mt-3">
		<!-- <div class="font-medium mt-4 mb-0.5 ml-2">Sport</div> -->
		<div
			class="rounded-full {signupState.dirtyValidationData.clubSport?.error
				? 'border border-red-600'
				: ''}"
		>
			<SportAutocomplete
				placeholder="Sport"
				bind:sport={signupState.signup.clubSport}
				onchange={() => {
					if (!signupState.dirtyFields.includes('clubSport')) {
						signupState.dirtyFields = [...signupState.dirtyFields, 'clubSport']
					}
				}}
			/>
		</div>
		{#if signupState.dirtyValidationData.clubSport?.error}
			<div class="text-xs mt-1 ml-1 text-red-600">
				{signupState.dirtyValidationData.clubSport?.message}
			</div>
		{:else}
			<div class="text-xs opacity-40 mt-1 ml-1">Sport della società</div>
		{/if}
	</div>
	<div>
		<!-- <div class="font-medium mt-4 mb-2 ml-2">Bio</div>
		<TipTapEditor bind:content={notes}></TipTapEditor> -->
		<div class="w-full text-xs opacity-40 mt-5 ml-1">
			Potrai inserire la bio e la foto profilo una volta effettuato il login.
		</div>
	</div>
</div>
