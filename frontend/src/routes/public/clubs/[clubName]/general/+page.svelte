<script lang="ts">
	import ClubGeneral from '@/lib/components/clubs/ClubGeneral.svelte'
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<ClubGeneral club={data.club}></ClubGeneral>