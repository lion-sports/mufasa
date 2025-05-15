<script lang="ts">
	import { CircularLoader, Icon } from '@likable-hair/svelte'
	import StandardTextfield from '../common/StandardTextfield.svelte'
	import UsersSelectableVerticalList from '../users/UsersSelectableVerticalList.svelte'
	import type { User } from '@/lib/services/auth/auth.service'
	import UserService from '@/lib/services/users/user.service'
	import ConfirmOrCancelDialog from '../common/ConfirmOrCancelDialog.svelte'
	import InvitationsService from '@/lib/services/invitations/invitations.service'
	import { addErrorToast, addSuccessToast } from '../ui/sonner'

	type Props = {
    club: {
      id: number
    },
    oninvite?: (params: { user: User }) => void
  }

	let { club, oninvite }: Props = $props()

	let searchText: string | undefined = $state(),
		foundUsers: User[] = $state([]),
		loadingSearch: boolean = $state(false)

	let debounceTimeout: NodeJS.Timeout | undefined = undefined
	async function handleSearchInput() {
		loadingSearch = true
		if (debounceTimeout) clearTimeout(debounceTimeout)

		debounceTimeout = setTimeout(async () => {
			if (!!searchText) {
				let service = new UserService({ fetch })
				foundUsers = await service.search({ searchText })
			}
			loadingSearch = false
		}, 500)
	}

  let userToInvite: User | undefined = $state(),
    confirmationDialog: boolean = $state(false),
    loadingInvitation: boolean = $state(false)

	function handleSelect(e: {
		detail: {
			element: {
				data?: {
					user: User
				}
			}
		}
	}) {
    if(!e.detail.element.data?.user) return
    userToInvite = e.detail.element.data.user
    confirmationDialog = true
  }

  async function handleConfirmInvitation() {
    if(!userToInvite) return
    loadingInvitation = true

    try {
      let service = new InvitationsService({ fetch })
      await service.inviteUser({
        club,
        user: userToInvite,
      })

      addSuccessToast({
        title: 'Operazione conclusa',
        options: {
          description: "L'operazione è andata buon fine"
        }
      })

      if(!!oninvite) oninvite({ user: userToInvite })

      confirmationDialog = false
    } catch(e) {
      addErrorToast({
        title: 'Operazione non riuscita',
        options: {
          description: "L'operazione non è andata a buon fine"
        }
      })
      confirmationDialog = false
    }

    loadingInvitation = false
  }
</script>

<div class="flex flex-col gap-2 @container">
	<StandardTextfield
		placeholder="Continua a scrivere ..."
		bind:value={searchText}
		hint="Cerca utenti per nome, email o username"
		--simple-textfield-width="100%"
		oninput={handleSearchInput}
	>
		{#snippet prependInner()}
			<span class="mr-2">
				<Icon name="mdi-magnify"></Icon>
			</span>
		{/snippet}
	</StandardTextfield>
	<div class="search-results">
		{#if loadingSearch}
			<div class="h-full w-full text-xs flex justify-center items-center text-center">
				<CircularLoader></CircularLoader>
			</div>
		{:else if foundUsers.length === 0}
			<div class="h-full w-full text-xs flex flex-col justify-center items-center text-center">
        {#if !searchText}
          Nessun utente trovato
        {:else}
          <div>Nessun utente trovato</div>
          <button class="underline text-[rgb(var(--global-color-primary-500))]">Invita lo stesso per email</button>
        {/if}
			</div>
		{:else}
			<UsersSelectableVerticalList 
        users={foundUsers} 
        onselect={handleSelect}
			></UsersSelectableVerticalList>
		{/if}
	</div>
</div>

<ConfirmOrCancelDialog
  bind:open={confirmationDialog}
  confirmButtonStyle="primary"
  confirmText="Invita"
  title="Invita utente"
  description={`Vuoi davvero invitare l'utente ${userToInvite?.fullname}?`}
  confirm={handleConfirmInvitation}
  loading={loadingInvitation}
></ConfirmOrCancelDialog>

<style>
	.search-results {
		height: var(--clubs-invite-members-search-results-height, 200px);
	}
</style>
