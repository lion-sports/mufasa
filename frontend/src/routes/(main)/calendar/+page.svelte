<script lang="ts">
  import type { PageData } from './$types'
  import GlobalCalendarWithSidebar from '$lib/components/profile/GlobalCalendarWithSidebar.svelte'
  import PageTitle from '$lib/components/common/PageTitle.svelte';
  
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<PageTitle
  title="Calendario"
></PageTitle>

<GlobalCalendarWithSidebar
  events={data.events}
></GlobalCalendarWithSidebar>