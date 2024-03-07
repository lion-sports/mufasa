<script lang="ts" context="module">
	import type { Team } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	export let team: Team,
		selectedTab: string = 'general'

	import MediaQuery from '@likable-hair/svelte/common/MediaQuery.svelte'
	import StandardTabSwitcher from '$lib/components/common/StandardTabSwitcher.svelte'
	import DateTimeFormattor from '$lib/components/common/DateTimeFormattor.svelte'
	import RolesList from '$lib/components/roles/RolesList.svelte'
</script>

<MediaQuery let:mAndDown>
	{#if team.notes}
		<StandardTabSwitcher
			tabs={[
				{
					name: 'general',
					label: 'Generale'
				},
				{
					name: 'teammates',
					label: 'Partecipanti'
				},
				{
					name: 'roles',
					label: 'Ruoli'
				}
			]}
			marginTop="10px"
			marginBottom="10px"
			bind:selected={selectedTab}
		/>
		{#if selectedTab == 'general'}
			<table>
				<tr class="field-row">
					<td class="field-name">Note</td>
					<td>
						<div style:white-space="pre-wrap">{team.notes}</div>
					</td>
				</tr>
				<tr class="field-row">
					<td class="field-name">Creato il</td>
					<td>
						<DateTimeFormattor datetime={new Date(team.createdAt)} />
					</td>
				</tr>
				<tr class="field-row">
					<td class="field-name">Proprietario</td>
					<td>
						{team.owner?.name}
					</td>
				</tr>
			</table>
		{:else}
			<RolesList {team} searchable={true} roles={team.roles} />
		{/if}
	{/if}
</MediaQuery>

<style>
	table {
		border-collapse: separate;
		border-spacing: 0 1em;
	}

	.field-name {
		font-weight: 900;
		padding-right: 15px;
		vertical-align: top;
		white-space: nowrap;
	}
</style>
