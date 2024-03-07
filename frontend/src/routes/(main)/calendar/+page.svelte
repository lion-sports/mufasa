<script lang="ts">
  import type { PageData } from './$types'
  import GlobalCalendarWithSidebar from '$lib/components/profile/GlobalCalendarWithSidebar.svelte'
  import PageTitle from '$lib/components/common/PageTitle.svelte';
  
  export let data: PageData;
</script>

<PageTitle
  title="Calendario"
></PageTitle>

<GlobalCalendarWithSidebar
  events={data.events}
></GlobalCalendarWithSidebar>