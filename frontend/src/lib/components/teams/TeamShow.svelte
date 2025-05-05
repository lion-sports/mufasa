<script lang="ts" module>
	import type { Team } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">

	import StandardTabSwitcher from '$lib/components/common/StandardTabSwitcher.svelte'
	import GroupsList from '$lib/components/groups/GroupsList.svelte'
	import { DateTime } from 'luxon'
  interface Props {
    team: Team;
    selectedTab?: string;
  }

  let { team, selectedTab = $bindable('general') }: Props = $props();
</script>


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
        name: 'groups',
        label: 'Gruppi'
      }
    ]}
    marginTop="10px"
    marginBottom="10px"
    bind:selected={selectedTab}
  />
  {#if selectedTab == 'general'}
    <table>
      <tbody>
        <tr class="field-row">
          <td class="field-name">Note</td>
          <td>
            <div style:white-space="pre-wrap">{team.notes}</div>
          </td>
        </tr>
        <tr class="field-row">
          <td class="field-name">Creato il</td>
          <td>
            {DateTime.fromJSDate(new Date(team.createdAt)).toLocaleString(DateTime.DATETIME_MED)}
          </td>
        </tr>
        <tr class="field-row">
          <td class="field-name">Proprietario</td>
          <td>
            {team.owner?.firstname} {team.owner?.lastname}
          </td>
        </tr>
      </tbody>
    </table>
  {:else}
    <GroupsList {team} searchable={true} groups={team.groups} />
  {/if}
{/if}


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
