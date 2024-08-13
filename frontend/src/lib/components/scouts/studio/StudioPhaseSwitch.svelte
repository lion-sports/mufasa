<script lang="ts">
	import type { VolleyballPhase } from "@/lib/services/scouts/volleyball"
	import { Autocomplete, Icon } from "@likable-hair/svelte"
	import { createEventDispatcher } from "svelte"
  let phases: VolleyballPhase[] = [ 'serve', 'defenseBreak', 'receive', 'defenseSideOut' ] as const

  export let phase: VolleyballPhase = 'serve',
    disabled: boolean = false,
    width: string | undefined = undefined,
    minWidth: string | undefined = "auto",
    menuWidth: string | undefined = "150px"

  $: phaseItems = phases.map(p => ({
    value: p,
    label: p
  }))

  let dispatch = createEventDispatcher<{
    'change': {
      phase: VolleyballPhase
    }
  }>()

  function handleChange(e: CustomEvent<{ selection: { value: string }[]}>) {
    if(!!e.detail.selection && e.detail.selection.length > 0) {
      phase = e.detail.selection[0].value as VolleyballPhase
      dispatch('change', {
        phase
      })
    }

  }

  function nextPhase() {
    let currentIndex = phases.findIndex((e) => e == phase)
    phase = phases[(currentIndex + 1) % 4]

    dispatch('change', {
      phase
    })
  }
</script>

<Autocomplete
  items={phaseItems}
  placeholder=""
  bind:disabled
  values={[
    { value: phase, label: phase }
  ]}
  on:change={handleChange}
  {width}
  {minWidth}
  {menuWidth}
  mobileDrawer
>
  <svelte:fragment slot="selection-container" let:openMenu let:handleKeyDown let:values>
    <button
      on:click={openMenu}
      on:keydown={(event) => {
        handleKeyDown(event)
        if(event.key == 'ArrowDown' || event.key == 'ArrowUp') {
          event.stopPropagation()
          event.preventDefault()
        }
      }}
      class="
        flex justify-center align-center w-full 
        py-1 bg-[rgb(var(--global-color-background-300))] rounded-sm
        relative
      "
    >
      <div class="px-2 flex-grow">
        {phase}
      </div>
      <button 
        class="border-l-2 px-2 border-l-[rgb(var(--global-color-contrast-800))]"
        on:click|stopPropagation={nextPhase}
      >
        <Icon name="mdi-chevron-right"></Icon>
      </button>
    </button>
  </svelte:fragment>
</Autocomplete>