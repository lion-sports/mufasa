<script lang="ts">
	import type { VolleyballScoutEventJson } from "@/lib/services/scouts/volleyball"
  import { EVENT_TYPE_TRANSLATIONS, FIRST_POINT } from "@/lib/services/scouts/volleyball";
	import { DateTime } from "luxon"

  export let events: VolleyballScoutEventJson[] = [],
    opponent: boolean = false
</script>

{#if events.length > 0}
  <div 
    class="events-container flex flex-col gap-1 snap-y overflow-y-auto"
    style:--hover-background-color={opponent ? '#fca5a51f' : '#93c5fd1f'}
  >
    {#each events as event}
      <div class="p-1 px-2 snap-start flex justify-between rounded-md gap-2 items-center hover:bg-[var(--hover-background-color)]">
        <div>
          <div class="text-md font-medium">{EVENT_TYPE_TRANSLATIONS[event.type]}</div>
          <div class="text-xs font-thin">
            {DateTime.fromJSDate(new Date(event.date)).setLocale('it-IT').toLocaleString(DateTime.DATETIME_MED)}
          </div>
        </div>
        <div class="text-xs font-thin">
          {event.points?.friends?.points || FIRST_POINT.friends.points} - 
          {event.points?.enemy?.points || FIRST_POINT.enemy.points}
        </div>
      </div>
    {/each}
  </div>
{:else}
{/if}

<style>
  .events-container {
    height: var(--studio-last-events-list-height);
    max-height: var(--studio-last-events-list-max-height);
  }
</style>