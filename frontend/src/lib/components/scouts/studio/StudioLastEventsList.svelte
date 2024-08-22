<script lang="ts">
	import type { VolleyballScoutEventJson } from "@/lib/services/scouts/volleyball"
  import { EVENT_TYPE_TRANSLATIONS } from "@/lib/services/scouts/volleyball";
	import { DateTime } from "luxon"

  export let events: VolleyballScoutEventJson[] = []
</script>

{#if events.length > 0}
  <div 
    class="events-container flex flex-col gap-2 snap-y overflow-y-auto"
  >
    {#each events as event}
      <div class="p-1 snap-start">
        <div class="text-md font-medium">{EVENT_TYPE_TRANSLATIONS[event.type]}</div>
        <div class="text-xs font-thin">
          {DateTime.fromJSDate(new Date(event.date)).setLocale('it-IT').toLocaleString(DateTime.DATETIME_MED)}
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