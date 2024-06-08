<script lang="ts">
	import UserAvatar from "$lib/components/common/UserAvatar.svelte"
	import type { Scout } from "$lib/services/scouts/scouts.service"
	import TeammatesService from "$lib/services/teammates/teammates.service"

  export let scout: Scout


  $: if(!scout.scoutInfo.general.opponent) scout.scoutInfo.general.opponent = {}

  function getPlayerFullname(params: { player: Scout['players'][0] }): string {
    return TeammatesService.getTeammateName({
      teammate: params.player.teammate
    })
  }
</script>

<div class="flex gap-2">
  <div class="basis-5/12">
    <div class="text-right text-2xl font-bold">{scout.event.team.name}</div>
    <div class="flex flex-col gap-2 mt-8">
      {#each scout.players as player}
        <div class="flex justify-end">
          <div>{player.shirtNumber}</div>
          <UserAvatar
            src={player.teammate.user.avatarUrl}
            username={getPlayerFullname({ player })}
            description={player.role}
            reverse
            --descriptive-avatar-image-gap="16px"
          />
        </div>
      {/each}
    </div>
  </div>
  <div class="w-[24px] text-center basis-2/12 mt-2">
    vs
  </div>
  <div class="basis-5/12 text-2xl font-bold">
    {#if !!scout.scoutInfo.general.opponent}
      <input 
        type="text"
        placeholder="Avversari"
        class="bg-transparent border-none outline-none"
        bind:value={scout.scoutInfo.general.opponent.name}
      />
    {/if}
  </div>
</div>