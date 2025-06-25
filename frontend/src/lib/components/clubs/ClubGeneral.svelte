<script lang="ts">
	import type { Club } from "@/lib/services/clubs/clubs.service"
	import { SPORT_ICON, SPORT_TRANSLATIONS } from "@/lib/services/sport"
	import { Icon } from "@likable-hair/svelte"

  type Props = {
    club: Club
  }

  let { club }: Props = $props()

</script>

<div class="grid grid-cols-12 mt-6 gap-4">
  <div class="col-span-12 md:col-span-8">
    <div class="flex flex-col gap-2">
      <div class="ring-1 ring-[rgb(var(--global-color-background-300))] rounded p-4">
        <div class="prose">
          {@html club.bio}
        </div>
      </div>
    </div>
  </div>
  <div class="col-span-12 md:col-span-4">
    <div class="ring-1 ring-[rgb(var(--global-color-background-300))] rounded p-4">
      <div class="font-bold text-lg">Informazioni</div>
      <div class="flex flex-col gap-2 mt-2 text-xs opacity-70">
        <div class="">
          <span class="mr-1">
            <Icon name="mdi-account"></Icon>
          </span>
          {club.owner.firstname} {club.owner.lastname}
        </div>
        <div class="">
          <span class="mr-1">
            <Icon name={SPORT_ICON[club.sport || 'none']}></Icon>
          </span>
          {SPORT_TRANSLATIONS[club.sport || 'none']}
        </div>
        <div class="">
          {#if club.members?.length == 0}
            Nessun membro
          {:else if club.members?.length == 1}
          <span class="mr-1">1</span> membro
          {:else}
          <span class="mr-1">
            {club.members?.length}
          </span> membri
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>