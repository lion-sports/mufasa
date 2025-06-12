<script lang="ts">
	import PageTitle from '@/lib/components/common/PageTitle.svelte'
  import type { PageData } from './$types';
	import GroupForm from '@/lib/components/groups/GroupForm.svelte'
	import StandardButton from '@/lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import { addErrorToast, addSuccessToast } from '@/lib/components/ui/sonner'
	import GroupsService from '@/lib/services/groups/groups.service'
	import { goto } from '$app/navigation'

  let { data }: { data: PageData } = $props();

  let loading: boolean = $state(false)
  async function handleSaveGroup() {
    loading = true

    try {
      let service = new GroupsService({ fetch })
      await service.update({
        ...data.group
      })

      addSuccessToast({
        title: 'Operazione completata',
        options: {
          description: "L'operazione è andata a buon fine"
        }
      })

      await goto(`/clubs/${data.club.id}/settings/groups`)
    } catch(e) {
      addErrorToast({
        title: 'Operazione fallita',
        options: {
          description: "L'operazione non è andata a buon fine"
        }
      })
    }

    loading = false
  }
</script>

<PageTitle
  title={data.group.name}
  prependVisible
>
  {#snippet append()}
    <StandardButton
      on:click={handleSaveGroup}
    >
      <span class="mr-2">
        <Icon name="mdi-floppy"></Icon>
      </span>
      Salva
    </StandardButton>
  {/snippet}
</PageTitle>

<GroupForm
  bind:group={data.group}
  view="club"
></GroupForm>