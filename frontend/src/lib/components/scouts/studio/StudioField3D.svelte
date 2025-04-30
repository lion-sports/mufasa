<script lang="ts">
  import { Canvas } from '@threlte/core'
  import StudioField3DScene from './StudioField3DScene.svelte';
	import type { Scout } from '@/lib/services/scouts/scouts.service'
	import type { ScoutEventPlayer, VolleyballPhase } from 'lionn-common'

  export let scout: Scout,
		phase: VolleyballPhase = 'serve',
    selectedPlayer: ScoutEventPlayer | undefined = undefined,
    friendSides: 'right' | 'left' = 'left'
</script>

<div class="overflow-auto h-full">
  <div class="min-h-[40dvh] relative">
    <Canvas>
      <StudioField3DScene 
        bind:scout
        bind:phase
        bind:selectedPlayer
        bind:friendSides
        on:playerClick
      />
    </Canvas>
  </div>
</div>