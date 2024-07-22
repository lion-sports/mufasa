<script lang="ts">
  import StudioPlayersList from '$lib/components/scouts/studio/StudioPlayersList.svelte'
  import type { PageData } from './$types';
  import * as Menubar from "$lib/components/ui/menubar";
	import { Drawer, Icon } from '@likable-hair/svelte'
	import StandardDialog from '$lib/components/common/StandardDialog.svelte'
	import StudioPlayerAdd from '$lib/components/scouts/studio/StudioPlayerAdd.svelte'
  import studio from '$lib/stores/scout/studio';

  export let data: PageData;
  $: $studio = data.studio

  let playersOpened: boolean = false,
    addPlayerDialog: boolean = false,
    addPlayerSelectedTab: string | undefined = undefined

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
      </Menubar.Content>
    </Menubar.Menu>
  </Menubar.Root>
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
      on:add={() => {
        addPlayerDialog = true
        addPlayerSelectedTab = 'importConvocation'
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
    bind:selectedTab={addPlayerSelectedTab}
  ></StudioPlayerAdd>
</StandardDialog>