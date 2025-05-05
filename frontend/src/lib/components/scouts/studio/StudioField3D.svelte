<script lang="ts">
  import { Canvas } from '@threlte/core'
  import StudioField3DScene from './StudioField3DScene.svelte';
	import type { Scout } from '@/lib/services/scouts/scouts.service'
	import type { ScoutEventPlayer, VolleyballPhase } from 'lionn-common'

  interface Props {
    scout: Scout;
    phase?: VolleyballPhase;
    selectedPlayer?: ScoutEventPlayer | undefined;
    friendSides?: 'right' | 'left';
  }

  let {
    scout = $bindable(),
    phase = $bindable('serve'),
    selectedPlayer = $bindable(undefined),
    friendSides = $bindable('left')
  }: Props = $props();
</script>

<div class="overflow-auto h-full">
  <div class="min-h-[40dvh] relative">
    <Canvas>
      <StudioField3DScene 
        {scout}
        {phase}
        bind:selectedPlayer
        {friendSides}
        on:playerClick
      />
    </Canvas>
  </div>
</div>