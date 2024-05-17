<script lang="ts">
  import type { PageData } from './$types';
  import ScoutSimpleTable from '$lib/components/scouts/ScoutSimpleTable.svelte';
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
  
  export let data: PageData;
</script>

<div class="flex justify-end mb-2">
  <StandardButton>
    <Icon name="mdi-plus"></Icon>
    Aggiungi scout
  </StandardButton>
</div>

<ScoutSimpleTable
  scouts={data.event.scouts}
></ScoutSimpleTable>