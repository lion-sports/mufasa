<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
  import type { PageData } from './$types';
	import { SPORT_ICON, SPORT_TRANSLATIONS } from '@/lib/services/sport'

  let { data }: { data: PageData } = $props();
</script>

<div class="grid grid-cols-12 mt-6 gap-4">
  <div class="col-span-8">
    <div class="flex flex-col gap-2">
      <div class="ring-1 ring-[rgb(var(--global-color-background-300))] rounded p-4">
        <div class="prose">
          {@html data.club.bio}
        </div>
      </div>
    </div>
  </div>
  <div class="col-span-4">
    <div class="ring-1 ring-[rgb(var(--global-color-background-300))] rounded p-4">
      <div class="font-bold text-lg">Informazioni</div>
      <div class="flex flex-col gap-2 mt-2 text-xs opacity-70">
        <div class="">
          <span class="mr-1">
            <Icon name="mdi-account"></Icon>
          </span>
          {data.club.owner.firstname} {data.club.owner.lastname}
        </div>
        <div class="">
          <span class="mr-1">
            <Icon name={SPORT_ICON[data.club.sport || 'none']}></Icon>
          </span>
          {SPORT_TRANSLATIONS[data.club.sport || 'none']}
        </div>
        <div class="">
          {#if data.club.members.length == 0}
            Nessun membro
          {:else if data.club.members.length == 1}
          <span class="mr-1">1</span> membro
          {:else}
          <span class="mr-1">
            {data.club.members.length}
          </span> membri
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>