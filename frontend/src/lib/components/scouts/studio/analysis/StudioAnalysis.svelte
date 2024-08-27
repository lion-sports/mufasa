<script lang="ts">
	import type { ScoutAnalysis } from "$lib/services/scouts/scouts.service"
	import StudioAnalysisPointsMadeSection from "./StudioAnalysisPointsMadeSection.svelte"

  export let analysis: ScoutAnalysis | undefined
</script>

{#if analysis}
  <StudioAnalysisPointsMadeSection
    {analysis}
  ></StudioAnalysisPointsMadeSection>
{:else}
  <div class="h-[400px] flex justify-center items-center">
    <div class="font-light">Nessun dato</div>
  </div>
{/if}