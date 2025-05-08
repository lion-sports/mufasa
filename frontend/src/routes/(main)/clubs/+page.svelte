<script lang="ts">
  import PageTitle from '@/lib/components/common/PageTitle.svelte'
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<PageTitle title="Clubs"></PageTitle>
{data.paginatedClubs}