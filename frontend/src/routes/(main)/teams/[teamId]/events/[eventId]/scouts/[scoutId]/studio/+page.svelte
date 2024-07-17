<script lang="ts">
  import StudioPlayersList from '$lib/components/scouts/studio/StudioPlayersList.svelte'
  import type { PageData } from './$types';
  import socketService from '$lib/services/common/socket.service';
	import { onMount } from 'svelte'
  import { add } from '$lib/stores/scout/studio';

  export let data: PageData;

  onMount(() => {
    setTimeout(async () => {
      await add({
        event: {
          type: 'timeout',
          date: new Date(),
          scoutId: data.studio.scout.id,
          teamId: data.team.id,
          sport: 'volleyball'
        }
      })
    }, 1000);
  })
</script>

<div class="p-4">
  <!-- <StudioPlayersList 
    scout={data.studio.scout}
  ></StudioPlayersList> -->
</div>