<script lang="ts">
	import GroupForm from '@/lib/components/groups/GroupForm.svelte'
  import type { PageData } from './$types';
	import { Icon } from '@likable-hair/svelte'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import PageTitle from '@/lib/components/common/PageTitle.svelte'
	import type { Group } from '@/lib/services/groups/groups.service'
	import { addErrorToast, addSuccessToast } from '@/lib/components/ui/sonner'
	import GroupsService from '@/lib/services/groups/groups.service'
	import { goto } from '$app/navigation'

  let { data }: { data: PageData } = $props();

  let group: Partial<Group> = $state({}),
    loadingSave: boolean = $state(false)

  async function handleSave() {
    if(!group.name) return
    loadingSave = true

    try {
      let service = new GroupsService({ fetch })
      await service.create({
        name: group.name,
        convocable: group.convocable,
        cans: group.cans,
        club: {
          id: data.club.id
        }
      })

      addSuccessToast({
        title: 'Operazione completata',
        options: {
          description: 'L\'operazione è andata a buon fine'
        }
      })
      await goto(`/clubs/${data.club.id}/settings/groups`)
    } catch(e) {
      addErrorToast({
        title: 'Operazione fallita',
        options: {
          description: 'L\'operazione non è andata a buon fine'
        }
      })
    }

    loadingSave = false
  }

  $effect(() => {
    console.log($state.snapshot(group))
  })
</script>

<PageTitle
  title="Nuovo gruppo"
  titleClass="text-3xl font-semibold"
  prependVisible
>
  {#snippet append()}
    <StandardButton
      on:click={handleSave}
      disabled={!group.name}
    >
      <span class="mr-2">
        <Icon name="mdi-floppy"></Icon>
      </span>
      Salva
    </StandardButton>
  {/snippet}
</PageTitle>

<GroupForm
  view="club"
  bind:group
></GroupForm>