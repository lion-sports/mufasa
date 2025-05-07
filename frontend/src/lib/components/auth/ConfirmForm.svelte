<script lang="ts">
	import type { Sport } from '@/lib/services/scouts/scouts.service'
	import ReviewCard from './ReviewCard.svelte'
	import { Icon } from '@likable-hair/svelte'
	import { DateTime } from 'luxon'

	interface Props {
		email: string
		firstname: string
		lastname: string
		birthday: Date | undefined
		sport: Sport | undefined
		teamName: string
		notes: string
	}

	let { email, firstname, lastname, birthday, sport, teamName, notes }: Props = $props()
</script>

<div class="text-sm text-[rgb(var(--global-color-contrast-300))] mt-2">
	Riepilogo dei dati inseriti per la creazione dell'account.
</div>
<div class="w-full flex flex-col gap-2 mt-1 text-xs">
	<!-- User Card -->
	<ReviewCard>
		{#snippet icon()}
			<div class="w-16 text-4xl flex items-center justify-center">
				<Icon name="mdi-account-circle" />
			</div>
			<div class="text-xs text-center">User Info</div>
		{/snippet}
		{#snippet reviewContent()}
			<div class="flex items-center justify-between">
				<div class="font-medium">Name:</div>
				<div>{firstname}{lastname}</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="font-medium">Birthday:</div>
				<div>
					{birthday ? birthday.toLocaleString().split(',')[0] : 'N/A'}
				</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="font-medium">Email:</div>
				<div>{email}</div>
			</div>
		{/snippet}
	</ReviewCard>

	<!-- Team Card -->
	<ReviewCard>
		{#snippet icon()}
			<div class="w-16 text-4xl flex items-center justify-center">
				<Icon name="mdi-account-group" />
			</div>
			<div class="text-xs text-center">Team Info</div>
		{/snippet}
		{#snippet reviewContent()}
			<div class="flex items-center justify-between">
				<div class="font-medium">Team Name:</div>
				<div>{teamName}</div>
			</div>
			<div class="flex items-center justify-between">
				<div class="font-medium">Sport:</div>
				<div>{sport || 'N/A'}</div>
			</div>
			<div class="w-full flex items-center">
				<div class="w-full flex-grow font-medium mr-1">Notes:</div>
				<span class="line-clamp-1">{notes || 'N/A'}</span>
			</div>
		{/snippet}
	</ReviewCard>

	<!-- Some Other -->
	<ReviewCard>
		{#snippet icon()}
			<div class="w-16 text-4xl flex items-center justify-center">
				<Icon name="mdi-information" />
			</div>
			<div class="text-xs text-center">Other Info</div>
		{/snippet}
		{#snippet reviewContent()}
			...
		{/snippet}
	</ReviewCard>
</div>
