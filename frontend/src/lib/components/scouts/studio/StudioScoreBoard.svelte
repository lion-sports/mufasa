<script lang="ts">
	import { FIRST_POINT, type VolleyballPoints } from "@/lib/services/scouts/volleyball"

  export let points: VolleyballPoints = FIRST_POINT,
    friendName: string = "Amici",
    opponentName: string = "Avversari"
</script>

<div class="flex w-full gap-4">
  <div class="basis-1/2 flex flex-col items-end pr-4">
    <div class="flex gap-4 items-end">
      <div class="text-lg">{friendName}</div>
      <div class="text-5xl">{points.friends.sets}</div>
    </div>
    <div class="text-2xl">{points.friends.points}</div>
  </div>
  <div class="flex flex-col">
    <div class="flex gap-4 items-end">
      <div class="text-5xl">{points.enemy.sets}</div>
      <div class="text-lg">{opponentName}</div>
    </div>
    <div class="text-2xl">{points.enemy.points}</div>
  </div>
</div>