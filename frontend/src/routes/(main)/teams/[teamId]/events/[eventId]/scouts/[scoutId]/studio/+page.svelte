<script lang="ts">
  import StudioPlayersList from '$lib/components/scouts/studio/StudioPlayersList.svelte'
  import type { PageData } from './$types';
  import * as Menubar from "$lib/components/ui/menubar";
	import { Drawer, Icon } from '@likable-hair/svelte'
	import StandardDialog from '$lib/components/common/StandardDialog.svelte'
	import StudioPlayerAdd from '$lib/components/scouts/studio/StudioPlayerAdd.svelte'
  import studio, { add, playerInPosition, reload } from '$lib/stores/scout/studio';
	import type { Player } from '@/lib/services/players/players.service'
	import StudioField from '@/lib/components/scouts/studio/StudioField.svelte'
	import StudioStartingSixSetter from '@/lib/components/scouts/studio/StudioStartingSixSetter.svelte'
	import type { VolleyballScoutEventPosition } from '@/lib/services/scouts/volleyball'
	import type { ScoutEventPlayer } from '@/lib/services/scouts/scouts.service'
	import StudioScoreBoard from '@/lib/components/scouts/studio/StudioScoreBoard.svelte'
  import { PaneGroup, Pane, PaneResizer } from "paneforge";

  export let data: PageData;
  $: $studio = data.studio

  let playersOpened: boolean = false,
    addPlayerDialog: boolean = false,
    addPlayerSelectedTab: string | undefined = undefined,
    newPlayer: Partial<Player> = {
      aliases: []
    },
    insertStartingSixDialog: boolean = false,
    insertStartingSixSelectedTab: string | undefined = undefined

  async function handleStartingSixSet(e: CustomEvent<{ position: VolleyballScoutEventPosition, player: ScoutEventPlayer | undefined }>) {
    if(!!e.detail.player)
    
    await playerInPosition({
      position: e.detail.position,
      player: e.detail.player
    })
  }
</script>

<div class="p-2">
  <Menubar.Root>
    <Menubar.Menu>
      <a 
        class="group mx-2"
        href={`/teams/${data.team.id}/events/${data.event.id}/scouts`}
      >
        <div class="group-hover:-translate-x-2 transition-all">
          <Icon name="mdi-arrow-left"></Icon>
        </div>
      </a>
      <div class=" px-5 text-xl font-semibold">{$studio.scout.name}</div>
      <Menubar.Trigger>Giocatori</Menubar.Trigger>
      <Menubar.Content>
        <Menubar.Item on:click={() => { playersOpened = true}}>Visualizza</Menubar.Item>
        <Menubar.Sub>
          <Menubar.SubTrigger>Nuovo</Menubar.SubTrigger>
          <Menubar.SubContent>
            <Menubar.Item on:click={() => {
              addPlayerSelectedTab = 'importConvocation'
              addPlayerDialog = true
            }}>Da convocazione</Menubar.Item>
            <Menubar.Item on:click={() => {
              addPlayerSelectedTab = 'create'
              addPlayerDialog = true
            }}>In aggiunta</Menubar.Item>
          </Menubar.SubContent>
        </Menubar.Sub>
        <Menubar.Sub>
          <Menubar.SubTrigger>Formazione</Menubar.SubTrigger>
          <Menubar.SubContent>
            <Menubar.Item on:click={() => {
              insertStartingSixDialog = true
              insertStartingSixSelectedTab = 'friends'
            }}>Amici</Menubar.Item>
            <Menubar.Item on:click={() => {
              insertStartingSixDialog = true
              insertStartingSixSelectedTab = 'opponents'
            }}>Avversari</Menubar.Item>
          </Menubar.SubContent>
        </Menubar.Sub>
      </Menubar.Content>
    </Menubar.Menu>
  </Menubar.Root>
</div>

<div class="w-full pb-4">
  <StudioScoreBoard
    points={$studio.scout.stash?.points}
    friendName={data.team.name}
    opponentName={data.studio.scout.scoutInfo.general.opponent?.name}
  ></StudioScoreBoard>
</div>

<div class="h-[100vh]">
  <PaneGroup direction="vertical">
	<Pane defaultSize={40} >
    <div class="w-full h-full">
      <StudioField
        scout={$studio.scout}
      ></StudioField>
    </div>
  </Pane>
	<PaneResizer class="relative flex h-2 items-center justify-center bg-[rgb(var(--global-color-background-400))]">
			<div class="z-10 flex h-5 w-7 items-center justify-center rounded-sm border bg-[rgb(var(--global-color-background-400))]">
        <Icon name="mdi-dots-horizontal"></Icon>
			</div>
		</PaneResizer>
	<Pane defaultSize={60}>

  </Pane>
</PaneGroup>
</div>

<Drawer 
  position={'right'}
  bind:open={playersOpened}
  _space={'80vw'}
  _overlayOpacity=".7"
>
  <div class="p-2">
    <StudioPlayersList 
      scout={$studio.scout}
      on:add={(e) => {
        addPlayerDialog = true
        addPlayerSelectedTab = e.detail.friendsOrOpponents == 'opponents' ? 'create' : 'importConvocation'
        newPlayer = {
          aliases: [],
          isOpponent: e.detail.friendsOrOpponents == 'opponents'
        }
      }}
    ></StudioPlayersList>
  </div>
</Drawer>

<StandardDialog
  title="Aggiungi giocatore"
  bind:open={addPlayerDialog}
>
  <StudioPlayerAdd
    scout={$studio.scout}
    bind:newPlayer
    bind:selectedTab={addPlayerSelectedTab}
    --autocomplete-background-color="rgb(var(--global-color-background-200))"
    on:create={() => {
      addPlayerDialog = false
    }}
  ></StudioPlayerAdd>
</StandardDialog>

<StandardDialog
  title="Inserisci formazione"
  bind:open={insertStartingSixDialog}
>
  <StudioStartingSixSetter
    bind:selectedTab={insertStartingSixSelectedTab}
    players={$studio.scout.players}
    playersPosition={$studio.scout.stash?.playersServePositions}
    on:change={handleStartingSixSet}
  ></StudioStartingSixSetter>
</StandardDialog>