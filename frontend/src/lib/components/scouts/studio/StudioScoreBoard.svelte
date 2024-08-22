<script lang="ts">
	import { FIRST_POINT, type VolleyballPoints } from "@/lib/services/scouts/volleyball"
	import { Icon } from "@likable-hair/svelte"
	import { createEventDispatcher } from "svelte"

  let dispatch = createEventDispatcher<{
    'increment': {
      opponent: boolean
    }
  }>()

  export let points: VolleyballPoints | undefined = FIRST_POINT,
    friendName: string = "Amici",
    opponentName: string = "Avversari"
</script>

<div class="flex w-full gap-4">
  <div class="basis-1/2 flex justify-end gap-4 pr-4 items-center">
    <div>
      <button 
        class="text-2xl hover:bg-[rgb(var(--global-color-background-200))] rounded-full h-[56px] w-[56px]"
        on:click={() => dispatch('increment', { opponent: false })}
      >
        <Icon name="mdi-plus"></Icon>
      </button>
    </div>
    <div class="flex flex-col items-end">
      <div class="flex gap-4 items-end">
        <div class="text-lg">{friendName}</div>
        <div class="text-5xl">{points?.friends?.sets || FIRST_POINT.friends.sets}</div>
      </div>
      <div class="text-2xl">{points?.friends?.points || FIRST_POINT.friends.points}</div>
    </div>
  </div>
  <div class="flex gap-4 items-center">
    <div class="flex flex-col">
      <div class="flex gap-4 items-end">
        <div class="text-5xl">{points?.enemy?.sets || FIRST_POINT.enemy.sets}</div>
        <div class="text-lg">{opponentName}</div>
      </div>
      <div class="text-2xl">{points?.enemy?.points || FIRST_POINT.enemy.points}</div>
    </div>
    <button 
      class="text-2xl hover:bg-[rgb(var(--global-color-background-200))] rounded-full h-[56px] w-[56px]"
      on:click={() => dispatch('increment', { opponent: true })}
    >
      <Icon name="mdi-plus"></Icon>
    </button>
  </div>
</div>