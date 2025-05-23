<script lang="ts">
  import type { PageData } from './$types';
	import ClubsTeamsList from '@/lib/components/clubs/ClubsTeamsList.svelte'

  let { data }: { data: PageData } = $props();
</script>

<ClubsTeamsList
  teams={data.club.teams || []}
></ClubsTeamsList>