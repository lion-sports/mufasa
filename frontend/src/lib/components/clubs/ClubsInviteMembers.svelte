<script lang="ts">
	import type { Member } from "@/lib/services/members/members.service"
	import { CircularLoader, Icon } from "@likable-hair/svelte"
	import type { Snippet } from "svelte"
	import StandardTextfield from "../common/StandardTextfield.svelte"
	import UsersSelectableVerticalList from "../users/UsersSelectableVerticalList.svelte"
	import type { User } from "@/lib/services/auth/auth.service"
	import UserService from "@/lib/services/users/user.service"

  type Props = {
  }

  let {  }: Props = $props()

  let searchText: string | undefined = $state(),
    foundUsers: User[] = $state([]),
    loadingSearch: boolean = $state(false)

  let debounceTimeout: NodeJS.Timeout | undefined = undefined
  async function handleSearchInput() {
    loadingSearch = true
    if(debounceTimeout) clearTimeout(debounceTimeout)

    debounceTimeout = setTimeout(async () => {
      if(!!searchText) {
        let service = new UserService({ fetch })
        foundUsers = await service.search({ searchText })
      }
      loadingSearch = false
    }, 500)
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
      <div class="h-full w-full text-xs flex justify-center items-center text-center">
        Nessun utente trovato
      </div>
    {:else}
      <UsersSelectableVerticalList
        users={foundUsers}
      ></UsersSelectableVerticalList>
    {/if}
  </div>
</div>

<style>
  .search-results {
    height: var(--clubs-invite-members-search-results-height, 200px)
  }
</style>
