<script lang="ts">
	import ReviewCard from './ReviewCard.svelte'
	import { Icon } from '@likable-hair/svelte'
	import type { SignupState } from '@/lib/services/auth/signup.svelte'

	interface Props {
		signupState: SignupState
	}

	let { signupState = $bindable() }: Props = $props()
</script>

<div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mt-2 text-left">
	Riepilogo dei dati inseriti per la creazione dell'account.
</div>

<div class="h-full w-full flex flex-col gap-2 my-1 mb-1 text-xs justify-center">
	<!-- User Card -->
	<ReviewCard onclick={() => (signupState.step = 'credentials')}>
		{#snippet icon()}
			<div class="w-20 text-4xl flex items-center justify-center">
				<Icon name="mdi-account-circle" />
			</div>
			<div class="text-xs text-center">User Info</div>
		{/snippet}
		{#snippet reviewContent()}
			<div class="flex items-center justify-between">
				<div class="font-medium">Nome:</div>
				<div>
					{signupState.signup.firstname && signupState.signup.lastname
						? `${signupState.signup.firstname} ${signupState.signup.lastname}`
						: '-'}
				</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="font-medium">Data di nascita:</div>
				<div>
					{signupState.signup.birthday
						? signupState.signup.birthday.toLocaleString().split(',')[0]
						: '-'}
				</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="font-medium">Email:</div>
				<div>{signupState.signup.email || '-'}</div>
			</div>
		{/snippet}
	</ReviewCard>

	{#if !signupState.isAthleteSignup}
		<!-- Team Card -->
		<ReviewCard onclick={() => (signupState.step = 'club')}>
			{#snippet icon()}
				<div class="w-20 text-4xl flex items-center justify-center">
					<Icon name="mdi-account-group" />
				</div>
				<div class="text-xs text-center">Team Info</div>
			{/snippet}
			{#snippet reviewContent()}
				<div class="flex items-center justify-between">
					<div class="font-medium">Handle:</div>
					<div>{signupState.signup.clubName || '-'}</div>
				</div>
				<div class="flex items-center justify-between">
					<div class="font-medium">Nome Completo:</div>
					<div>{signupState.signup.clubCompleteName || '-'}</div>
				</div>
				<div class="flex items-center justify-between">
					<div class="font-medium">Sport:</div>
					<div>{signupState.signup.clubSport || '-'}</div>
				</div>
			{/snippet}
		</ReviewCard>

		<!-- Some Other -->
		<ReviewCard onclick={() => (signupState.step = 'inviteEmail')}>
			{#snippet icon()}
				<div class="w-20 text-4xl flex items-center justify-center">
					<Icon name="mdi-information" />
				</div>
				<div class="text-xs text-center">Other info</div>
			{/snippet}
			{#snippet reviewContent()}
				<div class="flex items-center justify-between">
					<div class="font-medium">Collaboratori n.:</div>
					<div>
						<!-- {collaborators ? collaborators.length : 0} -->
						0
					</div>
				</div>
			{/snippet}
		</ReviewCard>

		<div class="w-full text-left opacity-50">
			Puoi rivedere ogni step cliccando sulle schede qui sopra.
		</div>
	{/if}
</div>
