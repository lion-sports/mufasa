<script lang="ts">
  import type { PageData } from './$types';
  import ScoringSystemForm from '$lib/components/scoringSystems/ScoringSystemForm.svelte';
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import type { ComponentProps } from 'svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
  import ScoringSystemsService, { type ScoringSystem } from '$lib/services/scoringSystems/scoringSystems.service';
	import { goto } from '$app/navigation'

  function isScoringSystemValid(
    ss: DeepPartial<ScoringSystem>
  ): ss is Parameters<ScoringSystemsService['update']>[0] {
    return !!ss.id
  }

  interface Props {
    data: PageData;
  }

  let { data = $bindable() }: Props = $props();

  let formValid: boolean = $state(false),
      loadingSave: boolean = $state(false)

  async function handleSubmit() {
    loadingSave = true

    if(isScoringSystemValid(data.scoringSystem)) {
      let service = new ScoringSystemsService({ fetch })
      await service.update(data.scoringSystem)
    }

    loadingSave = false
    goto('/profile/scoringSystems')
  }
</script>

<PageTitle
  title={data.scoringSystem.name || "Modifica sistema di punteggio"}
  prependVisible
></PageTitle>

<ScoringSystemForm
  bind:scoringSystem={data.scoringSystem}
  bind:formValid
></ScoringSystemForm>

<ConfirmOrCancelButtons
  confirmDisable={!formValid}
  confirmText="Salva"
  on:confirm-click={handleSubmit}
  loading={loadingSave}
></ConfirmOrCancelButtons>