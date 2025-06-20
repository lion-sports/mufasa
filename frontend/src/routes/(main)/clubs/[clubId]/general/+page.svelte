<script lang="ts">
  import type { PageData } from './$types';
	import ClubGeneral from '@/lib/components/clubs/ClubGeneral.svelte'

  let { data }: { data: PageData } = $props();
</script>

<ClubGeneral club={data.club}></ClubGeneral>