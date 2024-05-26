<script lang="ts">
  import type { PageData } from './$types';
  import ScoringSystemForm from '$lib/components/scoringSystems/ScoringSystemForm.svelte';
	import PageTitle from '$lib/components/common/PageTitle.svelte'
	import type { ComponentProps } from 'svelte'
	import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
  import ScoringSystemsService from '$lib/services/scoringSystems/scoringSystems.service';
	import { goto } from '$app/navigation'

  function isScoringSystemValid(
    ss: NonNullable<ComponentProps<ScoringSystemForm>['scoringSystem']>
  ): ss is Parameters<ScoringSystemsService['create']>[0] {
    return !!ss.name
      && !!ss.sport
      && !!ss.config
      && !!ss.config.set
      && !!ss.config.set.mode
      && (
        (ss.config.set.mode == 'totalSet' && !!ss.config.set.totalSets)
        || (ss.config.set.mode == 'winSet' && !!ss.config.set.winSets)
      )
      && !!ss.config.points
      && (
        (ss.config.points.mode == 'totalPoints' && !!ss.config.points.totalPoints)
        || (
          ss.config.points.mode == 'winPoints' 
          && !!ss.config.points.winPoints
        )
      )
  }

  export let data: PageData;

  let scoringSystem: NonNullable<ComponentProps<ScoringSystemForm>['scoringSystem']> = {},
      formValid: boolean = false,
      loadingSave: boolean = false

  async function handleSubmit() {
    loadingSave = true

    if(isScoringSystemValid(scoringSystem)) {
      let service = new ScoringSystemsService({ fetch })
      await service.create(scoringSystem)
    }

    loadingSave = false
    goto('/profile/scoringSystems')
  }
</script>

<PageTitle
  title={scoringSystem.name || "Nuovo sistema di punteggio"}
  prependVisible
></PageTitle>

<ScoringSystemForm
  bind:scoringSystem={scoringSystem}
  bind:formValid
></ScoringSystemForm>

<ConfirmOrCancelButtons
  confirmDisable={!formValid}
  confirmText="Salva"
  on:confirm-click={handleSubmit}
  loading={loadingSave}
></ConfirmOrCancelButtons>