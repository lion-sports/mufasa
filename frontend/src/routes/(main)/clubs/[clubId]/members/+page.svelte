<script lang="ts">
	import ClubsMemberList from '@/lib/components/clubs/ClubsMemberList.svelte'
  import type { PageData } from './$types';
	import { Icon, SimpleTextField } from '@likable-hair/svelte'
	import StandardTextfield from '@/lib/components/common/StandardTextfield.svelte'
	import type { Player } from '@/lib/services/players/players.service'
	import type { Member } from '@/lib/services/members/members.service'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import StandardDialog from '@/lib/components/common/StandardDialog.svelte'
	import ClubsInviteMembers from '@/lib/components/clubs/ClubsInviteMembers.svelte'

  let { data }: { data: PageData } = $props();

  let selectedMember: Member | undefined = $state(),
    inviteMemberDialog: boolean = $state(false)
</script>

<div class="grid grid-cols-12 mt-4 gap-8">
  <div class="col-span-12 lg:col-span-3">
    <div class="flex mb-2 justify-end gap-2">
      <div class="flex-grow">
        <StandardTextfield
          placeholder="Cerca ..."
          --simple-textfield-width="100%"
        >
          {#snippet prependInner()}
            <Icon name="mdi-magnify"></Icon>
          {/snippet}
        </StandardTextfield>
      </div>
      <button onclick={() => {
        inviteMemberDialog = true
      }}>
        <Icon name="mdi-plus" --icon-size="24px"></Icon>
      </button>
    </div>
    {#if !!data.club.members}
      <ClubsMemberList
        members={data.club.members}
        bind:selected={selectedMember}
      ></ClubsMemberList>
    {/if}
  </div>
  <div class="col-span-9 hidden lg:block">
    {#if !selectedMember}
      <div class="flex justify-center w-full">Seleziona un giocatore per visualizzarlo</div>
    {:else}
      <div class="flex flex-col">
        <div class="flex items-start">
          <div class="flex-grow">
            <div class="text-3xl font-semibold">{selectedMember.fullname}</div>
            <div class="mt-1 text-base opacity-50">
              {#if selectedMember.group}
                {selectedMember.group.name}
              {:else}
                Nessun gruppo
              {/if}
            </div>
          </div>
          <div class="mr-2 flex gap-4">
            <button class="text-[rgb(var(--global-color-error-500))]">
              <Icon name="mdi-delete"></Icon>
            </button>
            <StandardButton style="secondary">
              <span class="mr-2"><Icon name="mdi-pencil"></Icon></span>
              Modifica
            </StandardButton>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<StandardDialog
  bind:open={inviteMemberDialog}
  title="Invita utente"
>
  <div class="w-[400px] max-w-[90vh]">
    <ClubsInviteMembers
      club={data.club}
      groups={data.club.groups}
      teams={data.club.teams}
    ></ClubsInviteMembers>
  </div>
</StandardDialog>