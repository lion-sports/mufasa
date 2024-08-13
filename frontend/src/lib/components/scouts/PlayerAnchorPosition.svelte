<script lang="ts">
	import type { VolleyballScoutEventAnchor } from "@/lib/services/scouts/volleyball"
  
  let clazz: string | undefined = undefined
  export { clazz as class };

  type PropertyMapper = {
    [Direction in typeof direction]?: {
      [Anchor in VolleyballScoutEventAnchor]?: string
    }
  }

  export let direction: 'leftToRight' | 'rightToLeft' = 'leftToRight',
    anchor: VolleyballScoutEventAnchor = 13

  const rightMapper: PropertyMapper = {
    'rightToLeft': {
      1: "-20%",
      2: "-20%",
      3: "-20%",
      4: "-20%",
      5: "-20%",
      6: "0%",
      7: "0%",
      8: "0%",
      9: "0%",
      10: "0%",
      11: "45%",
      12: "45%",
      13: "45%",
      14: "45%",
      15: "45%",
      16: "70%",
      17: "70%",
      18: "70%",
      19: "70%",
      20: "70%",
      21: "100%",
      22: "100%",
      23: "100%",
      24: "100%",
      25: "100%"
    },
  }

  const leftMapper: PropertyMapper = {
    'leftToRight': {
      1: "-20%",
      2: "-20%",
      3: "-20%",
      4: "-20%",
      5: "-20%",
      6: "0%",
      7: "0%",
      8: "0%",
      9: "0%",
      10: "0%",
      11: "45%",
      12: "45%",
      13: "45%",
      14: "45%",
      15: "45%",
      16: "70%",
      17: "70%",
      18: "70%",
      19: "70%",
      20: "70%",
      21: "100%",
      22: "100%",
      23: "100%",
      24: "100%",
      25: "100%"
    }
  }

  const topMapper: PropertyMapper = {
    'rightToLeft': {
      21: "-20%",
      16: "-20%",
      11: "-20%",
      6: "-20%",
      1: "-20%",
      22: "0%",
      17: "0%",
      12: "0%",
      7: "0%",
      2: "0%",
      23: "45%",
      18: "45%",
      13: "45%",
      8: "45%",
      3: "45%",
      24: "70%",
      19: "70%",
      14: "70%",
      9: "70%",
      4: "70%",
      25: "100%",
      20: "100%",
      15: "100%",
      10: "100%",
      5: "100%"
    },
  }

  const bottomMapper: PropertyMapper = {
    'leftToRight': {
      21: "-20%",
      16: "-20%",
      11: "-20%",
      6: "-20%",
      1: "-20%",
      22: "0%",
      17: "0%",
      12: "0%",
      7: "0%",
      2: "0%",
      23: "45%",
      18: "45%",
      13: "45%",
      8: "45%",
      3: "45%",
      24: "70%",
      19: "70%",
      14: "70%",
      9: "70%",
      4: "70%",
      25: "100%",
      20: "100%",
      15: "100%",
      10: "100%",
      5: "100%"
    }
  }

  let marker: HTMLElement | undefined = undefined
</script>

<div class="w-full h-full relative">
  <div 
    class="absolute {clazz || ''}"
    style:right={
      anchor === 13 ? 
      `calc(${rightMapper[direction]?.[anchor]} - (${marker?.offsetWidth}px / 2))` :
      rightMapper[direction]?.[anchor]
    }
    style:left={
      anchor === 13 ? 
      `calc(${leftMapper[direction]?.[anchor]} - (${marker?.offsetWidth}px / 2))` :
      leftMapper[direction]?.[anchor]
    }
    style:top={
      anchor === 13 ? 
      `calc(${topMapper[direction]?.[anchor]} - (${marker?.offsetHeight}px / 2))` :
      topMapper[direction]?.[anchor]
    }
    style:bottom={
      anchor === 13 ? 
      `calc(${bottomMapper[direction]?.[anchor]} - (${marker?.offsetHeight}px / 2))` :
      bottomMapper[direction]?.[anchor]
    }
    bind:this={marker}
  >
    <slot></slot>
  </div>
</div>