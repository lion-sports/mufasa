<script lang="ts">
  import PageTitle from '$lib/components/common/PageTitle.svelte'
  import type { PageData } from './$types';
  import TeammatesService from '$lib/services/teammates/teammates.service';
  import ShirtService from '$lib/services/shirts/shirts.service';
	import ShirtsForm from '$lib/components/shirts/ShirtsForm.svelte'
	import type { Shirt } from '$lib/services/shirts/shirts.service'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
	import { invalidate } from '$app/navigation'
  
  export let data: PageData;

  let loading: boolean = false

  let shirt: DeepPartial<Shirt> = {
    teammateId: data.teammate.id
  }

  async function handleSubmit() {
    if(shirt.number === undefined || !shirt.teammateId) return

    loading = true
    let shirtService = new ShirtService({ fetch })
    await shirtService.create({
      number: shirt.number,
      name: shirt.name,
      teammateId: shirt.teammateId,
      primaryColor: shirt.primaryColor,
      secondaryColor: shirt.secondaryColor
    })

    await invalidate('shirts:list')
    loading = false
    window.history.back()
  }
</script>

<PageTitle
  title="Nuova maglia"
  prependVisible
  subtitle={TeammatesService.getTeammateName({ teammate: data.teammate })}
></PageTitle>

<ShirtsForm
  bind:shirt={shirt}
></ShirtsForm>

<ConfirmOrCancelButtons
  on:confirm-click={handleSubmit}
></ConfirmOrCancelButtons>