<script lang="ts" context="module">
	import type { Team } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	import { DateTime } from 'luxon'

	export let team: Team
</script>

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
			{DateTime.fromJSDate(new Date(team.createdAt))
				.setLocale('it-IT')
				.toLocaleString(DateTime.DATETIME_FULL)}
		</td>
	</tr>
	<tr class="field-row">
		<td class="field-name">Proprietario</td>
		<td>
			{team.owner?.firstname}
			{team.owner?.lastname}
		</td>
	</tr>
</table>

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
