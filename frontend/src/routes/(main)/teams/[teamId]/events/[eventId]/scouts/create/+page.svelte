<script lang="ts">
  import ConfirmOrCancelButtons from '$lib/components/common/ConfirmOrCancelButtons.svelte'
  import PageTitle from '$lib/components/common/PageTitle.svelte'
	import ScoutForm from '$lib/components/scouts/ScoutForm.svelte'
	import type { Scout } from '$lib/services/scouts/scouts.service'
	import ScoutsService from '$lib/services/scouts/scouts.service'
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let scout: Partial<Scout> = $state({
      startedAt: data.event.start,
      eventId: data.event.id
    }),
    loading: boolean = $state(false)

  async function handleSubmit() {
    if(!!scout.eventId && !!scout.sport && !!scout.startedAt && !!scout.scoringSystemId && !!scout.name) {
      loading = true

      let service = new ScoutsService({ fetch })
      await service.create({
        ...scout,
        sport: scout.sport,
        name: scout.name,
        eventId: scout.eventId,
        startedAt: scout.startedAt,
        scoringSystemId: scout.scoringSystemId
      })

      window.history.back()
      loading = false
    }
  }

  let valid = $derived(!!scout.eventId && !!scout.sport && !!scout.startedAt && !!scout.scoringSystemId)
</script>

<PageTitle
  title="Nuovo scout"
  subtitle={data.event.name}
  prependVisible
></PageTitle>

<ScoutForm
  bind:scout
></ScoutForm>

<ConfirmOrCancelButtons
  confirmDisable={!valid}
  on:confirm-click={handleSubmit}
  on:cancel-click={() => window.history.back()}
  bind:loading={loading}
></ConfirmOrCancelButtons>