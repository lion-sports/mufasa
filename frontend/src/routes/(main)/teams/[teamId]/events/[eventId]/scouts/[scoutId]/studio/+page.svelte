<script lang="ts">
  import StudioPlayersList from '$lib/components/scouts/studio/StudioPlayersList.svelte'
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<div class="p-4">
  <StudioPlayersList 
    scout={data.studio.scout}
  ></StudioPlayersList>
</div>