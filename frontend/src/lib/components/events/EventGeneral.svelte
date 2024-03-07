<script lang="ts">
	import { DateTime } from 'luxon'
	import type { Event } from '$lib/services/events/events.service'

	export let event: Event
</script>

<table>
	<tr class="field-row">
		<td class="field-name">Descrizione</td>
		<td>
			<div style:white-space="pre-wrap">{event.description}</div>
		</td>
	</tr>
	<tr class="field-row">
		<td class="field-name">Inizio</td>
		<td>
			{DateTime.fromJSDate(new Date(event.start))
				.setLocale('it')
				.toLocaleString(DateTime.DATETIME_MED)}
		</td>
	</tr>
	<tr class="field-row">
		<td class="field-name">Fine</td>
		<td>
			{DateTime.fromJSDate(new Date(event.end))
				.setLocale('it')
				.toLocaleString(DateTime.DATETIME_MED)}
		</td>
	</tr>
	<tr class="field-row">
		<td class="field-name">Creato da</td>
		<td>
			{event.createdBy.firstname}
			{event.createdBy.lastname}
		</td>
	</tr>
	<tr class="field-row">
		<td class="field-name">Creato il</td>
		<td>
			{DateTime.fromJSDate(new Date(event.createdAt))
				.setLocale('it')
				.toLocaleString(DateTime.DATETIME_MED)}
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
