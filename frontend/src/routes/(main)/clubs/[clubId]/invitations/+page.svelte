<script lang="ts">
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
  import type { PageData } from './$types';
	import ClubsInviteMembers from '@/lib/components/clubs/ClubsInviteMembers.svelte'
	import StandardDialog from '@/lib/components/common/StandardDialog.svelte'
  import ClubsInvitationsTable from '@/lib/components/clubs/ClubsInvitationsTable.svelte';
	import { invalidate } from '$app/navigation'
	import { Icon } from '@likable-hair/svelte'

  let { data }: { data: PageData } = $props();

  let inviteMemberDialog: boolean = $state(false)

  async function invalidatePage() {
    await invalidate('club:settings:invitations')
  }
</script>

<div class="flex gap-2 mt-4">
  <div class="text-3xl font-semibold flex-grow"></div>
  <div>
    <StandardButton
      on:click={() => inviteMemberDialog = true}
    >
      <span class="mr-2">
        <Icon name="mdi-plus"></Icon>
      </span>
      Invita
    </StandardButton>
  </div>
</div>
<div class="mt-4">
  <ClubsInvitationsTable
    invitations={data.paginatedInvitations.data}
    ondiscard={invalidatePage}
  ></ClubsInvitationsTable>
</div>

<StandardDialog
  bind:open={inviteMemberDialog}
  title="Invita utente"
>
  <div class="w-[400px] max-w-[90vh]">
    <ClubsInviteMembers
      club={data.club}
      oninvite={invalidatePage}
    ></ClubsInviteMembers>
  </div>
</StandardDialog>