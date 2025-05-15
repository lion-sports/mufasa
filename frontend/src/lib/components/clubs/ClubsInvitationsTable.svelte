<script lang="ts">
	import type { Invitation } from "@/lib/services/invitations/invitations.service"
	import type { Member } from "@/lib/services/members/members.service"
	import type { ComponentProps, Snippet } from "svelte"
	import InvitationTable from "../invitations/InvitationTable.svelte"
	import InvitationsService from "@/lib/services/invitations/invitations.service"

  type Props = {
    invitations: Invitation[],
    append?: Snippet<[ { member: Member } ]>
    ondiscard?: ComponentProps<typeof InvitationTable>['ondiscard']
  }

  let { invitations, append, ondiscard }: Props = $props()

  async function handleInvitationDiscard(params: { invitation: Invitation }) {
    let service = new InvitationsService({ fetch })
    await service.discardInvitation({
      invitation: params.invitation
    })

    if(!!ondiscard) {
      ondiscard(params)
    }
	}
</script>

<InvitationTable
  {invitations}
  ondiscard={handleInvitationDiscard}
></InvitationTable>