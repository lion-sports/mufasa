<script lang="ts">
	import type { Club } from "@/lib/services/clubs/clubs.service"
	import LabelAndTextfield from "../common/LabelAndTextfield.svelte"
	import { Icon } from "@likable-hair/svelte"
	import TipTapEditor from "../common/TipTapEditor.svelte"
	import SportAutocomplete from "../common/SportAutocomplete.svelte"
	import type { ClubState } from "@/lib/services/clubs/clubs.svelte"
	import MediaImageUpload from "../media/MediaImageUpload.svelte"
	import ClubsMediaService from "@/lib/services/media/clubsMedia.service"
	import LabelAndCheckbox from "../common/LabelAndCheckbox.svelte"

  type Props = {
    clubState: ClubState
  }

  let {
    clubState = $bindable()
  }: Props = $props()

  let dirtyValues: (keyof Club)[] = $state([])

  async function getBlob(params: { mediaId: number }): Promise<Blob | undefined> {
    let service = new ClubsMediaService({ fetch })
    return await service.getBlob(params)
  }
</script>

<div class="@container">
  <div class="flex flex-col gap-3 w-full">
    <div class="flex justify-center -mb-[80px]">
      <MediaImageUpload
        mediaId={clubState.club.headerMediaId}
        bind:files={clubState.club.header}
        noImageText=""
        --media-image-upload-border-radius="8px"
        --media-image-upload-width="100%"
        --media-image-upload-background-color="rgb(var(--global-color-primary-500),.5)"
        fetchBlob={getBlob}
      ></MediaImageUpload>
    </div>
    <div class="flex justify-center mb-4">
      <MediaImageUpload
      mediaId={clubState.club.logoMediaId}
        bind:files={clubState.club.logo}
        noImageText="Clicca per caricare"
        --media-image-upload-background-color="rgb(var(--global-color-primary-500))"
        fetchBlob={getBlob}
      ></MediaImageUpload>
    </div>
    <div class="grid @lg:grid-cols-2 grid-cols-1 gap-3">
      <div>
        <LabelAndTextfield
          label="Nome *"
          bind:value={clubState.club.name}
          name="name"
          --simple-textfield-width="100%"
          --simple-textfield-hint-margin-left="4px"
          error={dirtyValues.includes('name') && clubState.validationData.name?.error}
          hint={dirtyValues.includes('name') ? clubState.validationData.name?.message : undefined}
          oninput={() => {
            dirtyValues.push('name')
          }}
        >
          {#snippet appendInner()}
            <Icon name="mdi-at"></Icon>
          {/snippet}
        </LabelAndTextfield>
        <div class="text-xs opacity-40 mt-1 ml-1">Nome univoco del club, con cui verrai cercato</div>
      </div>
      <div>
        <LabelAndTextfield
          label="Nome completo *"
          bind:value={clubState.club.completeName}
          name="complete-name"
          --simple-textfield-width="100%"
          --simple-textfield-hint-margin-left="4px"
          error={dirtyValues.includes('completeName') && clubState.validationData.completeName?.error}
          hint={dirtyValues.includes('completeName') ? clubState.validationData.completeName?.message : undefined}
          oninput={() => {
            dirtyValues.push('completeName')
          }}
        ></LabelAndTextfield>
        <div class="text-xs opacity-40 mt-1 ml-1">Nome reale della società, che verrà visualizzato</div>
      </div>
    </div>
    <div>
      <div class="font-medium mt-4 mb-2 ml-2">Sport</div>
      <SportAutocomplete
        bind:sport={clubState.club.sport}
      ></SportAutocomplete>
    </div>
    <div class="pt-4">
      <LabelAndCheckbox
        label="Pubblico"
        bind:value={clubState.club.public}
        id="public"
      ></LabelAndCheckbox>
      <div class="text-xs opacity-40 mt-1 ml-[32px]">Seleziona per rendere visualizzabile il tuo club a tutti</div>
    </div>
    <div>
      <div class="font-medium mt-4 mb-2 ml-2">Bio</div>
      <TipTapEditor
        bind:content={clubState.club.bio}
      ></TipTapEditor>
    </div>
  </div>
</div>