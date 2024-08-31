<script lang="ts">
	import type { ScoutAnalysis } from "$lib/services/scouts/scouts.service"
	import StudioAnalysisPointsMadeSection from "./StudioAnalysisPointsMadeSection.svelte"
  import StudioAnalysisErrorsMadeSection from "./StudioAnalysisErrorsMadeSection.svelte";
	import StudioAnalysisReceiveSection from "./StudioAnalysisReceiveSection.svelte"

  export let analysis: ScoutAnalysis | undefined
</script>

{#if analysis}
  <div class="flex flex-col gap-2">
    <div class="flex justify-center items-center">
      <div class="text-center font-bold text-3xl">Generale</div>
    </div>
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
    <div class="flex justify-center items-center">
      <div class="text-center font-bold text-3xl">Ricezione</div>
    </div>
    <div>
      <StudioAnalysisReceiveSection
        {analysis}
      ></StudioAnalysisReceiveSection>
    </div>
  </div>
{:else}
  <div class="h-[400px] flex justify-center items-center">
    <div class="font-light">Nessun dato</div>
  </div>
{/if}