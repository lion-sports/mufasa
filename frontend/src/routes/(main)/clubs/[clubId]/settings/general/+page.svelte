<script lang="ts">
	import ClubSettingService from '@/lib/services/clubSettings/clubSettings.service'
  import type { PageData } from './$types';
  import { Switch } from '@likable-hair/svelte';
	import { addErrorToast, addSuccessToast } from '@/lib/components/ui/sonner'
	import { invalidate } from '$app/navigation'

  let { data }: { data: PageData } = $props();

  let clubSetting = $derived(data.club.setting)

  async function handleBookingsActiveChange(e: {
    detail: {
      value: boolean
    }
  }) {
    let service = new ClubSettingService({ fetch })

    try {
      await service.set({ clubId: data.club.id, key: 'bookingsActive', value: e.detail.value })
      await reloadClub()
      showSuccessToast()
    } catch(e) {
      showErrorToast()
    }
  }

  async function handleBookingsConfirmationRequiredChange(e: {
    detail: {
      value: boolean
    }
  }) {
    let service = new ClubSettingService({ fetch })

    try {
      await service.set({ clubId: data.club.id, key: 'bookingsActive', value: e.detail.value })
      await reloadClub()
      showSuccessToast()
    } catch(e) {
      showErrorToast()
    }
  }

  async function reloadClub() {
    await invalidate('club:detail')
  }

  function showSuccessToast() {
    addSuccessToast({
      title: 'Impostazione salvata con successo',
      options: {
        description: "L\'impostazione è stata salvata con successo"
      }
    })
  }

  function showErrorToast() {
    addErrorToast({
      title: 'Salvataggio fallito',
      options: {
        description: "L\'impostazione non è stata salvata"
      }
    })
  }
</script>

<div class="text-3xl font-semibold mb-4">Generali</div>
<div class="flex flex-col gap-3">
  <div class="opacity-70 text-xs my-2">Prenotazioni</div>
  <div class="flex justify-between gap-4 items-center">
    <div class="flex flex-col gap-1">
      <div class="text-xl font-bold">Attiva prenotazioni</div>
      <div class="text-sm opacity-50">Attiva la sezione prenotazioni, dove i membri del club potranno prenotare o richiedere i campi e palestre a disposizione.</div>
    </div>
    <div>
      <Switch 
        onchange={handleBookingsActiveChange} 
        value={clubSetting?.settings.bookingsActive || false}
      ></Switch>
    </div>
  </div>
  <div class="h-[1px] bg-[rgb(var(--global-color-background-300))] w-full"></div>
  <div class="flex justify-between gap-4 items-center">
    <div class="flex flex-col gap-1">
      <div class="text-xl font-bold">Conferma richiesta per prenotazioni</div>
      <div class="text-sm opacity-50">Quando un membro effettua una prenotazione questa deve essere confermata da un amministratore.</div>
    </div>
    <div>
      <Switch 
        onchange={handleBookingsConfirmationRequiredChange} 
        value={clubSetting?.settings.bookingsConfirmationRequired || false}
      ></Switch>
    </div>
  </div>
</div>