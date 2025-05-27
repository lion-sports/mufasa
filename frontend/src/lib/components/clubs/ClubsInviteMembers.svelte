<script lang="ts">
	import { CircularLoader, Icon } from '@likable-hair/svelte'
	import StandardTextfield from '../common/StandardTextfield.svelte'
	import UsersSelectableVerticalList from '../users/UsersSelectableVerticalList.svelte'
	import type { User } from '@/lib/services/auth/auth.service'
	import UserService from '@/lib/services/users/user.service'
	import ConfirmOrCancelDialog from '../common/ConfirmOrCancelDialog.svelte'
	import InvitationsService from '@/lib/services/invitations/invitations.service'
	import { addErrorToast, addSuccessToast } from '../ui/sonner'
	import { scale, slide } from 'svelte/transition'
	import GroupsAutocomplete from '../groups/GroupsAutocomplete.svelte'
	import type { Group } from '@/lib/services/groups/groups.service'
	import type { ComponentProps } from 'svelte'
	import TeamsAutocomplete from '../teams/TeamsAutocomplete.svelte'
	import type { Team } from '@/lib/services/teams/teams.service'

	type Props = {
    club: {
      id: number
    },
    groups?: Group[]
    teams?: Team[]
    oninvite?: (params: { user: User }) => void
  }

	let { club, oninvite, groups, teams }: Props = $props()

	let searchText: string | undefined = $state(),
		foundUsers: User[] = $state([]),
		loadingSearch: boolean = $state(false),
    selectedGroups: NonNullable<ComponentProps<typeof GroupsAutocomplete>['values']> = $state([]),
    selectedTeams: NonNullable<ComponentProps<typeof TeamsAutocomplete>['values']> = $state([])

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

  let additionalFieldVisible: boolean = $state(false)
</script>

<div class="flex flex-col gap-2 @container">
  <div>
    <div class="flex gap-2 items-start">
      <div class="grow">
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
      </div>
      <div class="relative">
        {#if selectedGroups.length > 0}
          <div class="absolute right-0 top-0 w-[12px] h-[12px] bg-red-500 rounded-full" transition:scale></div>
        {/if}
        <button 
          class="h-[44px] w-[44px] flex items-center justify-center rounded-full hover:bg-[rgb(var(--global-color-contrast-900),.1)]"
          onclick={() => additionalFieldVisible = !additionalFieldVisible}
        >
          {#if additionalFieldVisible}
            <Icon name="mdi-chevron-up"></Icon>
          {:else}
            <Icon name="mdi-chevron-down"></Icon>
          {/if}
        </button>
      </div>
    </div>
    {#if additionalFieldVisible}
      <div transition:slide={{duration: 200}} class="mt-2 flex flex-col gap-2">
        <div>
          <GroupsAutocomplete
            {groups}
            bind:values={selectedGroups}
          ></GroupsAutocomplete>
        </div>
        <div>
          <TeamsAutocomplete
            {teams}
            multiple
            bind:values={selectedTeams}
          ></TeamsAutocomplete>
        </div>
      </div>
    {/if}
  </div>
	<div class="search-results">
		{#if loadingSearch}
			<div class="h-full w-full text-xs flex justify-center items-center text-center">
				<CircularLoader></CircularLoader>
			</div>
		{:else if foundUsers.length === 0}
			<div class="h-full w-full text-xs flex flex-col justify-center items-center text-center">
        {#if !!searchText}
          <div>Nessun utente trovato</div>
          <button 
            class="underline text-[rgb(var(--global-color-primary-500))]"
          >Invita lo stesso per email</button>
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
