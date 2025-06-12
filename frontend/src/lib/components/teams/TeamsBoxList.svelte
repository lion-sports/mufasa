<script lang="ts" module>
	export type Team = {
		name: string
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { CircularLoader, Icon } from '@likable-hair/svelte'
	import StandardTextfield from '$lib/components/common/StandardTextfield.svelte'

	const dispatch = createEventDispatcher<{
		'teams-click': {
			nativeEvent: MouseEvent
			team: Team
		}
	}>()

	interface Props {
		teams?: Team[]
		loading?: boolean
		searchable?: boolean
		marginTop?: string | undefined
		marginBottom?: string | undefined
	}

	let {
		teams = [],
		loading = false,
		searchable = false,
		marginTop = undefined,
		marginBottom = undefined
	}: Props = $props()

	function handleTeamClick(event: MouseEvent, team: Team) {
		dispatch('teams-click', {
			nativeEvent: event,
			team: team
		})
	}

	let searchText: string | undefined = $state()
	let filteredTeams = $derived(
		!!searchText
			? teams.filter((team) => {
					return (
						!searchText || team.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
					)
				})
			: teams
	)
</script>

<div style:margin-top={marginTop} style:margin-bottom={marginBottom}>
	{#if searchable}
		<div style:max-width="100%" style:width="400px" style:margin-bottom="10px">
			<StandardTextfield bind:value={searchText} placeholder="Cerca team ...">
				{#snippet prependInner()}
					<div style:margin-right="10px">
						<Icon name="mdi-search-web" --icon-color="rgb(var(--global-color-background-400))" />
					</div>
				{/snippet}
			</StandardTextfield>
		</div>
	{/if}
	<div class="teams-container">
		{#if loading}
			<CircularLoader />
		{:else if teams?.length > 0}
			{#each filteredTeams as team}
				<div
					style:background-color="rgb(var(--global-color-background-400))"
					style:padding="15px"
					style:font-weight="600"
					style:font-size="1.3rem"
					style:border-radius="5px"
					style:display="flex"
					style:cursor="pointer"
					onclick={(event) => handleTeamClick(event, team)}
					role="presentation"
				>
					<div>
						{team.name}
					</div>
					<div style:margin-left="10px">
						<Icon name="mdi-arrow-right" />
					</div>
				</div>
			{/each}
		{:else}
			Nessun team trovato,
			<a href="/teams/new">crea il tuo</a>
		{/if}
	</div>
</div>

<style>
	.teams-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
</style>
