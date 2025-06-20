<script lang="ts">
	import ClubGeneral from "@/lib/components/clubs/ClubGeneral.svelte"
	import type { PageData } from "./$types"
	import ClubHeader from "@/lib/components/clubs/ClubHeader.svelte"
	import { TabSwitcher } from "@likable-hair/svelte"

  let { data }: { data: PageData } = $props()
</script>

<div class="p-4">
  <ClubHeader
    club={data.club}
    prependVisible={false}
  ></ClubHeader>
</div>

<div class="px-4">
  <TabSwitcher
    tabs={[
      { name: 'general', icon: 'mdi-card-account-details', label: 'Generale'},
    ]}
  ></TabSwitcher>
</div>

<div class="p-4">
  <ClubGeneral club={data.club}></ClubGeneral>
</div>