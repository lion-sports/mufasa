<script lang="ts">
  import StudioPlayersList from '$lib/components/scouts/studio/StudioPlayersList.svelte'
  import type { PageData } from './$types';
  import * as Menubar from "$lib/components/ui/menubar";
	import { Drawer, Icon } from '@likable-hair/svelte'
	import StandardDialog from '$lib/components/common/StandardDialog.svelte'
	import StudioPlayerAdd from '$lib/components/scouts/studio/StudioPlayerAdd.svelte'
  import studio, { manualPhase, playerInPosition, pointScored, restart, selectPlayer, teamRotation, undo, updateFriendsFieldSide } from '$lib/stores/scout/studio';
	import type { Player } from '@/lib/services/players/players.service'
	import StudioField from '@/lib/components/scouts/studio/StudioField.svelte'
	import StudioStartingSixSetter from '@/lib/components/scouts/studio/StudioStartingSixSetter.svelte'
	import type { VolleyballScoutEventPosition } from '@/lib/services/scouts/volleyball'
  import type { ScoutEventPlayer, VolleyballPlayersPosition } from 'lionn-common'
	import StudioScoreBoard from '@/lib/components/scouts/studio/StudioScoreBoard.svelte'
  import { PaneGroup, Pane, PaneResizer } from "paneforge";
	import StudioPhaseSwitch from '@/lib/components/scouts/studio/StudioPhaseSwitch.svelte'
  import * as Tabs from "$lib/components/ui/tabs";
	import StudioBenches from '@/lib/components/scouts/studio/StudioBenches.svelte'
	import StudioPlayerView from '@/lib/components/scouts/studio/StudioPlayerView.svelte'
	import StudioAnalysis from '@/lib/components/scouts/studio/analysis/StudioAnalysis.svelte'
	import ScoutsService from '@/lib/services/scouts/scouts.service'
	import StudioSettings from '@/lib/components/scouts/studio/StudioSettings.svelte'

  export let data: PageData;
  $: $studio = data.studio

  let playersOpened: boolean = false,
    settingsOpened: boolean = false,
    addPlayerDialog: boolean = false,
    addPlayerSelectedTab: string | undefined = undefined,
    newPlayer: Partial<Player> = {
      aliases: []
    },
    insertStartingSixDialog: boolean = false,
    insertStartingSixSelectedTab: string | undefined = undefined,
    reloadFirstSetStartingSix: boolean = false,
    selectedSection: 'benches' | 'player' | 'analysis' = 'benches'

  async function handleStartingSixSet(e: CustomEvent<{ position: VolleyballScoutEventPosition, player: ScoutEventPlayer | undefined }>) {
    if(!!e.detail.player)
    
    await playerInPosition({
      position: e.detail.position,
      player: e.detail.player
    })
  }

  async function changeSides() {
    await updateFriendsFieldSide({
      side: $studio?.scout.scoutInfo.general?.friendsFieldSide == 'right' ? 'left' : 'right'
    })
  }

  async function openStartingSixDialog(tab: 'friends' | 'opponents') {
    insertStartingSixDialog = true
    insertStartingSixSelectedTab = tab
    reloadFirstSetStartingSix = true

    startingSixPositions = {
      friends: {},
      enemy: {}
    }
  }

  let startingSixPositions: VolleyballPlayersPosition = {
    friends: {},
    enemy: {}
  }
</script>


{#if !!$studio}
  <div class="p-2">
    <Menubar.Root class="overflow-auto">
      <a 
        class="group mx-2"
        href={`/teams/${data.team.id}/events/${data.event.id}/scouts`}
      >
        <div class="group-hover:-translate-x-2 transition-all">
          <Icon name="mdi-arrow-left"></Icon>
        </div>
      </a>
      <div class=" px-5 text-xl font-semibold">{$studio.scout.name}</div>
      <Menubar.Menu>
        <Menubar.Trigger>Scout</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item on:click={() => { undo() }}>
            <Icon name="mdi-undo"></Icon>
            <span class="ml-2">
              Undo
            </span>
          </Menubar.Item>
          <Menubar.Item on:click={() => {
            let confirmed = confirm('Sei sicuro di voler ripartire con lo scout?')
            if(confirmed) {
              restart()
            }
          }}>
            <Icon name="mdi-refresh"></Icon>
            <span class="ml-2">
              Restart
            </span>
          </Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item on:click={() => {
            settingsOpened = !settingsOpened
          }}>
            <Icon name="mdi-cog"></Icon>
            <span class="ml-2">
              Impostazioni
            </span>
          </Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item on:click={() => {
            if(!$studio) return
            let service = new ScoutsService({ fetch })
            service.exportXlsx({ id: $studio.scout.id })
          }}>
            <Icon name="mdi-microsoft-excel"></Icon>
            <span class="ml-2">
              Esporta
            </span>
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Layout</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item on:click={() => { changeSides() }}>
            <Icon name="mdi-swap-horizontal"></Icon>
            <span class="ml-2">
              Cambia lato
            </span>
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
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
                openStartingSixDialog('friends')
              }}>Amici</Menubar.Item>
              <Menubar.Item on:click={() => {
                openStartingSixDialog('opponents')
              }}>Avversari</Menubar.Item>
            </Menubar.SubContent>
          </Menubar.Sub>
          <Menubar.Sub>
            <Menubar.SubTrigger>Rotazione</Menubar.SubTrigger>
            <Menubar.SubContent>
              <Menubar.Item on:click={() => {
                  teamRotation({
                    opponent: false,
                    rotationType: 'forward'
                  })
              }}>
                <Icon name="mdi-rotate-right"></Icon> 
                <span class="ml-2">
                  Amici avanti
                </span>
              </Menubar.Item>
              <Menubar.Item on:click={() => {
                teamRotation({
                  opponent: false,
                  rotationType: 'backward'
                })
              }}>
                <Icon name="mdi-rotate-left"></Icon> 
                <span class="ml-2">
                  Amici indietro
                </span>
              </Menubar.Item>
              <Menubar.Separator />
              <Menubar.Item on:click={() => {
                teamRotation({
                  opponent: true,
                  rotationType: 'forward'
                })
              }}>
                <Icon name="mdi-rotate-right"></Icon> 
                <span class="ml-2">
                  Avversari avanti
                </span>
              </Menubar.Item>
              <Menubar.Item on:click={() => {
                teamRotation({
                  opponent: true,
                  rotationType: 'backward'
                })
              }}>
                <Icon name="mdi-rotate-left"></Icon> 
                <span class="ml-2">
                  Avversari indietro
                </span>
              </Menubar.Item>
            </Menubar.SubContent>
          </Menubar.Sub>
        </Menubar.Content>
        <div class="flex-grow flex justify-end">
          <div class="py-1">
            <StudioPhaseSwitch
              phase={$studio?.scout.stash?.phase || 'serve'}
              on:change={(e) => {
                manualPhase({ phase: e.detail.phase })
              }}
            ></StudioPhaseSwitch>
          </div>
        </div>
      </Menubar.Menu>
    </Menubar.Root>
  </div>

  {#if selectedSection !== 'analysis'}
    <div class="w-full pb-4">
      <StudioScoreBoard
        points={$studio?.scout.stash?.points}
        friendName={data.team.name}
        opponentName={data.studio.scout.scoutInfo.general?.opponent?.name}
        on:increment={(e) => {
          pointScored({ opponent: e.detail.opponent })
        }}
      ></StudioScoreBoard>
    </div>
  {/if}

  <div class={selectedSection !== 'analysis' ? "h-[calc(100dvh-155px)]" : "h-[calc(100dvh-60px)]"}>
    {#key selectedSection !== 'analysis'}
      <PaneGroup direction="vertical">
        {#if selectedSection !== 'analysis'}
          <Pane defaultSize={40} class="!overflow-visible">
            <div class="w-full h-full">
              <StudioField
                scout={$studio?.scout}
                phase={$studio?.scout.stash?.phase || 'serve'}
                friendSides={$studio?.scout.scoutInfo.general?.friendsFieldSide}
                on:playerClick={(e) => {
                  selectPlayer({ player: e.detail.player })
                  selectedSection = 'player'
                }}
                selectedPlayer={$studio?.selectedPlayer}
              ></StudioField>
            </div>
          </Pane>
          <PaneResizer class="relative flex h-2 items-center justify-center bg-[rgb(var(--global-color-background-400))]">
            <div class="z-20 flex h-5 w-7 items-center justify-center rounded-sm border bg-[rgb(var(--global-color-background-400))]">
              <Icon name="mdi-dots-horizontal"></Icon>
            </div>
          </PaneResizer>
        {/if}
        <Pane defaultSize={60} class="!overflow-auto">
          <div class="flex justify-center w-full">
            <Tabs.Root bind:value={selectedSection} class="w-full relative">
              <div class="flex w-full justify-center sticky top-0 p-2 z-10">
                <Tabs.List>
                  <Tabs.Trigger value="benches">
                    <Icon name="mdi-format-list-bulleted"></Icon>
                    <span class="ml-2">Benches</span>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="player" disabled={!$studio?.selectedPlayer}>
                    <Icon name="mdi-account"></Icon>
                    <span class="ml-2">Player</span>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="analysis">
                    <Icon name="mdi-chart-line"></Icon>
                    <span class="ml-2">Analysis</span>
                  </Tabs.Trigger>
                </Tabs.List>
              </div>
              <Tabs.Content value="benches" class="w-full overflow-auto py-2 px-4">
                <StudioBenches
                  scout={$studio?.scout}
                ></StudioBenches>
              </Tabs.Content>
              <Tabs.Content value="player" class="w-full overflow-auto py-2 px-4">
                <StudioPlayerView
                  studio={$studio}
                ></StudioPlayerView>
              </Tabs.Content>
              <Tabs.Content value="analysis" class="w-full overflow-auto py-2 px-4">
                {#if selectedSection === 'analysis'}
                  <StudioAnalysis
                    analysis={$studio?.analysis}
                    dashboard={data.dashboard}
                  ></StudioAnalysis>
                {/if}
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </Pane>
      </PaneGroup>
    {/key}
  </div>

  <Drawer 
    position={'right'}
    bind:open={playersOpened}
    _space={'80vw'}
    _overlayOpacity=".7"
  >
    <div class="p-2">
      <StudioPlayersList 
        scout={$studio?.scout}
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

  <Drawer 
    position={'right'}
    bind:open={settingsOpened}
    _space={'80vw'}
    _overlayOpacity=".7"
  >
    <div class="p-4">
      <StudioSettings
        scout={$studio?.scout}
      ></StudioSettings>
    </div>
  </Drawer>

  <StandardDialog
    title="Aggiungi giocatore"
    bind:open={addPlayerDialog}
  >
    <StudioPlayerAdd
      scout={$studio?.scout}
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
      bind:reloadFirstSetStartingSix
      players={$studio?.scout.players}
      playersPosition={startingSixPositions}
      on:change={handleStartingSixSet}
    ></StudioStartingSixSetter>
  </StandardDialog>
{/if}
