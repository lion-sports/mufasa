<script lang="ts" module>
	import type { Convocation } from '$lib/services/convocations/convocations.service'
</script>

<script lang="ts">
	import { run } from 'svelte/legacy';

	import user from '$lib/stores/auth/user'
	import UserAvatar from '$lib/components/common/UserAvatar.svelte'
	import StandardChip from '$lib/components/common/StandardChip.svelte'
	import { Icon, CircularLoader, MediaQuery, HorizontalStackedProgress } from '@likable-hair/svelte'
	import { createEventDispatcher, type ComponentProps } from 'svelte'
	import ConvocationsService from '$lib/services/convocations/convocations.service'
	import Divider from '$lib/components/common/Divider.svelte'
	import StandardDialog from '$lib/components/common/StandardDialog.svelte'
	import GroupMultipleSelectorChip from '$lib/components/groups/GroupMultipleSelectorChip.svelte'
	import type { Group } from '$lib/services/groups/groups.service'
	import OptionSelector from '$lib/components/common/OptionSelector.svelte'

	interface Props {
		convocations?: Convocation[];
		team: { id: number } | undefined;
		groups?: Group[];
		canConfirm?: boolean;
		canConvocate?: boolean;
		canDeny?: boolean;
	}

	let {
		convocations = [],
		team,
		groups = [],
		canConfirm = false,
		canConvocate = false,
		canDeny = false
	}: Props = $props();

	let dispatch = createEventDispatcher<{
		confirm: {
			convocation: Convocation
		}
		deny: {
			convocation: Convocation
		}
		unConvocate: {
			convocation: Convocation
		}
		convocate: {
			convocation: Convocation
		}
	}>()

	let editConvocationsOptions: ComponentProps<OptionSelector>['options'] = $state()

	function handleConvocationOptionClick(e: CustomEvent<{ option: any }>) {
		if (!!editingConvocation) {
			if (e.detail.option.name == 'confirm') confirmConvocation(editingConvocation)
			else if (e.detail.option.name == 'deny') denyConvocation(editingConvocation)
			else if (e.detail.option.name == 'delete') unConvocate(editingConvocation)

			convocationDetailDialogOpen = false
		}
	}

	function translateConfirmationStatus(confirmationStatus: string | undefined) {
		if (!confirmationStatus) return 'Non specificato'

		let mappers: any = {
			pending: 'Non specificato',
			confirmed: 'Presenza confermata',
			denied: 'Presenza rifiutata'
		}
		return mappers[confirmationStatus]
	}

	let loading: boolean = $state(false)
	function confirmConvocation(convocation: Convocation) {
		loading = true
		let service = new ConvocationsService({ fetch })
		service
			.confirm({ id: convocation.id })
			.then((newConvocation) => {
				loading = false
				dispatch('confirm', { convocation: newConvocation })
			})
			.finally(() => {
				loading = false
			})
	}

	function denyConvocation(convocation: Convocation) {
		loading = true

		let service = new ConvocationsService({ fetch })
		service
			.deny({ id: convocation.id })
			.then((newConvocation) => {
				loading = false
				dispatch('deny', { convocation: newConvocation })
			})
			.finally(() => {
				loading = false
			})
	}

	function unConvocate(convocation: Convocation) {
		loading = true
		let service = new ConvocationsService({ fetch })
		service
			.unConvocate({
				event: {
					id: convocation.eventId
				},
				teammates: [
					{
						id: convocation.teammateId
					}
				]
			})
			.then(() => {
				loading = false
				dispatch('unConvocate', { convocation: convocation })
			})
	}


	let convocationDetailDialogOpen: boolean = $state(false),
		editingConvocation: Convocation | undefined = $state()
	function handleMobileConvocationRowClick(convocation: Convocation) {
		editingConvocation = convocation
		convocationDetailDialogOpen = true
	}

	let selectedGroups: ComponentProps<typeof GroupMultipleSelectorChip>['value'] = $state([])

	run(() => {
		if (!!editingConvocation) {
			editConvocationsOptions = []
			if (
				canConfirm ||
				editingConvocation.teammate.userId == $user?.id
			) {
				editConvocationsOptions.push({
					label: 'Conferma',
					name: 'confirm',
					icon: 'mdi-check'
				})
			}

			if (
				canDeny ||
				editingConvocation.teammate.userId == $user?.id
			) {
				editConvocationsOptions.push({
					label: 'Rifiuta',
					name: 'deny',
					icon: 'mdi-close'
				})
			}

			if (canConvocate) {
				editConvocationsOptions.push({
					label: 'Elimina',
					name: 'delete',
					icon: 'mdi-delete'
				})
			}

			editConvocationsOptions = [...editConvocationsOptions]
		}
	});
	let totalConvocations = $derived(convocations.length)
	let deniedConvocations = $derived(convocations.filter((c) => c.confirmationStatus == 'denied').length)
	let confirmedConvocations = $derived(convocations.filter((c) => c.confirmationStatus == 'confirmed').length)
	let filteredConvocations = $derived(convocations.filter((c) => {
		if (!selectedGroups || selectedGroups.length == 0) return true
		else if (!!c.teammate.groupId)
			return selectedGroups.map((chip) => chip.value).includes(c.teammate.groupId?.toString())
		else return false
	}))
</script>

<MediaQuery >
	{#snippet defaultSnippet({ lAndUp })}
		<div>
			<div class="summary">
				<HorizontalStackedProgress
					progresses={[
						{
							label: 'Non specificato',
							value: totalConvocations - deniedConvocations - confirmedConvocations,
							color: 'grey'
						},
						{
							label: 'Rifiutate',
							value: deniedConvocations,
							color: 'rgb(var(--global-color-error-500))'
						},
						{
							label: 'Confermate',
							value: confirmedConvocations,
							color: 'rgb(var(--global-color-primary-500))'
						}
					]}
				/>
			</div>

			<div>
				{#if !!team}
					<div style:margin-top="10px" style:margin-bottom="20px">
						<GroupMultipleSelectorChip groups={groups} bind:value={selectedGroups} onlyConvocable={true} />
					</div>
				{/if}

				{#if lAndUp}
					<div class="convocations-list">
						{#each filteredConvocations as convocation}
							<div style:display="flex" class="convocation-container">
								<div class="info-container">
									<div class="name-column">
										<UserAvatar
											src={convocation.teammate.user.avatarUrl}
											username={convocation.teammate.alias ||
												convocation.teammate.user.firstname +
													' ' +
													convocation.teammate.user.lastname}
											description={!!convocation.teammate.group
												? convocation.teammate.group.name
												: undefined}
										/>
									</div>
									<div class="chip-column">
										<StandardChip
											--chip-hover-background-color={convocation.confirmationStatus == 'denied'
												? 'red'
												: convocation.confirmationStatus == 'confirmed'
												? 'rgb(var(--global-color-primary-500))'
												: 'rgb(var(--global-color-background-400))'}
											--chip-background-color={convocation.confirmationStatus == 'denied'
												? 'red'
												: convocation.confirmationStatus == 'confirmed'
												? 'rgb(var(--global-color-primary-500))'
												: 'rgb(var(--global-color-background-400))'}
										>
											<span style:font-weight="700"
												>{translateConfirmationStatus(convocation.confirmationStatus)}</span
											>
										</StandardChip>
									</div>
								</div>
								{#if convocation.teammate.userId == $user?.id || canConfirm || canDeny}
									<div class="confirm-button-container">
										{#if !loading}
											{#if canConfirm || convocation.teammate.userId == $user?.id}
												<Icon
													name="mdi-check"
													onclick={() => confirmConvocation(convocation)}
												/>
											{/if}
											{#if canDeny || convocation.teammate.userId == $user?.id}
												<Icon name="mdi-close" onclick={() => denyConvocation(convocation)} />
											{/if}
											{#if canConvocate}
												<Icon name="mdi-delete" onclick={() => unConvocate(convocation)} />
											{/if}
										{:else}
											<CircularLoader />
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div style:display="flex" style:flex-direction="column">
						{#each filteredConvocations as convocation}
							<button
								class="flex justify-between items-center mb-2"
								onclick={() => handleMobileConvocationRowClick(convocation)}
							>
								<UserAvatar
									src={convocation.teammate.user.avatarUrl}
									username={convocation.teammate.alias ||
										convocation.teammate.user.firstname + ' ' + convocation.teammate.user.lastname}
									description={!!convocation.teammate.group
										? convocation.teammate.group.name
										: undefined}
								/>
								<div class="status-container">
									<div
										class="dot"
										class:dot-confirmed={convocation.confirmationStatus == 'confirmed'}
										class:dot-denied={convocation.confirmationStatus == 'denied'}
										class:dot-pending={convocation.confirmationStatus == 'pending'}
									></div>
								</div>
							</button>
							<Divider marginBottom="8px" marginLeft="0px" marginRight="0px" marginTop="8px" />
						{/each}
					</div>

					{#if !!editingConvocation}
						<StandardDialog
							bind:open={convocationDetailDialogOpen}
							title={editingConvocation.teammate.alias ||
								editingConvocation.teammate.user.firstname +
									' ' +
									editingConvocation.teammate.user.lastname}
						>
							<div style:display="flex" style:margin-bottom="10px">
								<StandardChip
									--chip-hover-background-color={editingConvocation.confirmationStatus == 'denied'
										? 'red'
										: editingConvocation.confirmationStatus == 'confirmed'
										? 'rgb(var(--global-color-primary-500))'
										: 'rgb(var(--global-color-background-400))'}
									--chip-background-color={editingConvocation.confirmationStatus == 'denied'
										? 'red'
										: editingConvocation.confirmationStatus == 'confirmed'
										? 'rgb(var(--global-color-primary-500))'
										: 'rgb(var(--global-color-background-400))'}
								>
									<span style:font-weight="700"
										>{translateConfirmationStatus(editingConvocation.confirmationStatus)}</span
									>
								</StandardChip>
							</div>
							<OptionSelector
								options={editConvocationsOptions}
								on:option-click={handleConvocationOptionClick}
							/>
						</StandardDialog>
					{/if}
				{/if}
			</div>
		</div>
	{/snippet}
</MediaQuery>

<style>
	@media (max-width: 1024px) {
		.convocation-container {
			flex-direction: column;
			gap: 10px;
			align-items: flex-start;
			background-color: var(--global-thin-contrast-color);
			padding: 10px;
			border-radius: 10px;
		}

		.confirm-button-container {
			width: 100%;
			margin-top: 20px;
		}
	}

	@media (min-width: 1025px) {
		.convocation-container {
			align-items: center;
		}

		.name-column {
			width: 300px;
		}

		.chip-column {
			width: 200px;
			display: flex;
		}
	}

	.summary {
		font-weight: 300;
		color: var(--global-light-contrast-color);
		margin-bottom: 20px;
	}

	.convocations-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.status-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dot {
		border-radius: 50%;
		height: 10px;
		width: 10px;
	}

	.dot-confirmed {
		background-color: rgb(var(--global-color-primary-500));
	}

	.dot-pending {
		background-color: rgb(var(--global-color-background-400));
	}

	.dot-denied {
		background-color: rgb(var(--global-color-error-500));
	}

	.info-container {
		display: flex;
	}

	.confirm-button-container {
		margin-left: 20px;
		display: flex;
		justify-content: center;
		gap: 20px;
	}
</style>
