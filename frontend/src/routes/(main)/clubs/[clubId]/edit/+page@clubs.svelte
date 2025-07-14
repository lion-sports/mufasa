<script lang="ts">
	import PageTitle from '@/lib/components/common/PageTitle.svelte'
  import type { PageData } from './$types';
	import { ClubState } from '@/lib/services/clubs/clubs.svelte'
	import ClubsForm from '@/lib/components/clubs/ClubsForm.svelte'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import { addErrorToast } from '@/lib/components/ui/sonner'
	import ClubsService from '@/lib/services/clubs/clubs.service'
	import { goto } from '$app/navigation'

  let { data }: { data: PageData } = $props();

  let clubState = $state(new ClubState({ club: data.club })),
    loading: boolean = $state(false)

  async function handleSave() {
    if(!clubState.validatedClub) return

    loading = true
    let service = new ClubsService({ fetch })
    try {
      await service.update({
        id: data.club.id,
        ...clubState.validatedClub
      })

      if(!!clubState.club.header?.[0] || !!clubState.club.logo?.[0]) {
        await service.uploadMedia({
          clubId: data.club.id,
          header: clubState.club.header?.[0],
          logo: clubState.club.logo?.[0]
        })
      }

      goto('/clubs/' + data.club.id)
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
  title={data.club.completeName}
  prependVisible
  prependRoute={`/clubs/${data.club.id}`}
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
          on:click={handleSave}
          {loading}
          disabled={!clubState.isValid}
        >
          <Icon name="mdi-floppy"></Icon>
          <span class="ml-2">
            Salva
          </span>
        </StandardButton>
      </div>
      <div class="w-full">
        <a class="w-full block p-2 text-center" href={`/clubs/${data.club.id}`}>
          Annulla
        </a>
      </div>
    </div>
  </div>
</div>