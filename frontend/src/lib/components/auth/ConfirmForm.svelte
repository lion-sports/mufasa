<script lang="ts">
	import type { Sport } from 'lionn-common'
	import ReviewCard from './ReviewCard.svelte'
	import { Icon } from '@likable-hair/svelte'
	import type { RegistrationStep } from '@/lib/services/auth/auth.service'

	interface Props {
		email: string
		firstname: string
		lastname: string
		birthday: Date | undefined
		sport: Sport | undefined
		teamName: string
		notes: string
		collaborators?: string[]
		step: RegistrationStep
		token: string
	}

	let {
		email,
		firstname,
		lastname,
		birthday,
		sport,
		teamName,
		notes,
		collaborators,
		token,
		step = $bindable()
	}: Props = $props()
</script>

<div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mt-2 text-left">
	Riepilogo dei dati inseriti per la creazione dell'account.
</div>

<div class="h-full w-full flex flex-col gap-2 my-1 mb-1 text-xs justify-center">
	<!-- User Card -->
	<ReviewCard onclick={() => (step = 'credentials')}>
		{#snippet icon()}
			<div class="w-20 text-4xl flex items-center justify-center">
				<Icon name="mdi-account-circle" />
			</div>
			<div class="text-xs text-center">User Info</div>
		{/snippet}
		{#snippet reviewContent()}
			<div class="flex items-center justify-between">
				<div class="font-medium">Name:</div>
				<div>{firstname && lastname ? `${firstname} ${lastname}` : '-'}</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="font-medium">Birthday:</div>
				<div>
					{birthday ? birthday.toLocaleString().split(',')[0] : '-'}
				</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="font-medium">Email:</div>
				<div>{email || '-'}</div>
			</div>
		{/snippet}
	</ReviewCard>

	<!-- Team Card -->
	<ReviewCard onclick={() => (step = 'team')}>
		{#snippet icon()}
			<div class="w-20 text-4xl flex items-center justify-center">
				<Icon name="mdi-account-group" />
			</div>
			<div class="text-xs text-center">Team Info</div>
		{/snippet}
		{#snippet reviewContent()}
			<div class="flex items-center justify-between">
				<div class="font-medium">Team Name:</div>
				<div>{teamName || '-'}</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="font-medium">Sport:</div>
				<div>{sport || '-'}</div>
			</div>
			<div class="w-full flex items-center">
				<div class="w-full flex-grow font-medium mr-1 text-left">Notes:</div>
				<span class="line-clamp-1">{notes || '-'}</span>
			</div>
		{/snippet}
	</ReviewCard>

	<!-- Some Other -->
	<ReviewCard onclick={() => (step = 'invite-email')}>
		{#snippet icon()}
			<div class="w-20 text-4xl flex items-center justify-center">
				<Icon name="mdi-information" />
			</div>
			<div class="text-xs text-center">Other info</div>
		{/snippet}
		{#snippet reviewContent()}
			<div class="flex items-center justify-between">
				<div class="font-medium">Collaborators n.:</div>
				<div>{collaborators ? collaborators.length : 0}</div>
			</div>

			<div class="flex items-center justify-between">
				<div class="font-medium">Invite token:</div>
				<div>{token || '-'}</div>
			</div>
		{/snippet}
	</ReviewCard>

	<div class="w-full text-left opacity-50">Click on the card to review each step</div>
</div>
