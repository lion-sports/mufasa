<script lang="ts">
	import PageTitle from '@/lib/components/common/PageTitle.svelte'
  import type { PageData } from './$types';
	import ClubsForm from '@/lib/components/clubs/ClubsForm.svelte'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
  import { addErrorToast } from '@/lib/components/ui/sonner';
	import ClubsService from '@/lib/services/clubs/clubs.service'
  import { ClubState } from '@/lib/services/clubs/clubs.svelte';
	import { goto } from '$app/navigation'

  let { data }: { data: PageData } = $props();

  let clubState = $state(new ClubState()),
    loading: boolean = $state(false)

  async function handleCreate() {
    if(!clubState.validatedClub) return

    loading = true
    let service = new ClubsService({ fetch })
    try {
      await service.create({
        ...clubState.validatedClub
      })
      goto('/clubs')
    } catch(err) {
      addErrorToast({
        title: 'Operazione fallita',
        options: {
          description: 'L\'operazione non è andata a buon fine'
        }
      })
    }

    loading = false
  }
</script>

<PageTitle
  title="Nuovo club"
  prependVisible
  prependRoute="/clubs"
></PageTitle>

<div class="flex justify-center">
  <div style:max-width="min(100vw,800px)" class="w-full">
    <div>
      <ClubsForm
        bind:clubState={clubState}
      ></ClubsForm>
    </div>
    <div class="flex flex-col gap-2 w-full mt-4">
      <div class="w-full">
        <StandardButton
          --button-width="100%"
          on:click={handleCreate}
          {loading}
          disabled={!clubState.isValid}
        >
          <span class="mr-2">
            Crea
          </span>
          <Icon name="mdi-arrow-right"></Icon>
        </StandardButton>
      </div>
      <div class="w-full">
        <a class="w-full block p-2 text-center" href="/clubs">
          Annulla
        </a>
      </div>
    </div>
  </div>
</div>
