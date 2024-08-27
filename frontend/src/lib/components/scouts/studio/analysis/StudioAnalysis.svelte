<script lang="ts">
	import type { ScoutAnalysis } from "$lib/services/scouts/scouts.service"
	import StudioAnalysisPointsMadeSection from "./StudioAnalysisPointsMadeSection.svelte"
  import StudioAnalysisErrorsMadeSection from "./StudioAnalysisErrorsMadeSection.svelte";

  export let analysis: ScoutAnalysis | undefined
</script>

{#if analysis}
  <div class="flex flex-col gap-2">
    <div>
      <StudioAnalysisPointsMadeSection
        {analysis}
      ></StudioAnalysisPointsMadeSection>
    </div>
    <div>
      <StudioAnalysisErrorsMadeSection
        {analysis}
      ></StudioAnalysisErrorsMadeSection>
    </div>
  </div>
{:else}
  <div class="h-[400px] flex justify-center items-center">
    <div class="font-light">Nessun dato</div>
  </div>
{/if}