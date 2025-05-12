<script lang="ts">
	import { Icon } from '@likable-hair/svelte'

  type Props = {
    mediaId: number | undefined,
    files: FileList | undefined,
    noImageText: string | undefined,
    fetchBlob: (params: { mediaId: number }) => Promise<Blob | undefined>
    onchange?: (e: Event) => void
  }

  let {
    mediaId = $bindable(),
    files = $bindable(),
    noImageText,
    fetchBlob,
    onchange
  }: Props = $props()

  let fileUploader: HTMLElement | undefined = undefined

  $effect(() => {
		if (mediaId !== undefined && mediaId !== null && mediaId !== 0) {
      fetchBlob({ mediaId }).then((mediaBlob) => {
        let reader = new FileReader()
        reader.onload = function (e) {
          imageSrc = e.target?.result?.toString()
        }
        if(!!mediaBlob)
          reader.readAsDataURL(mediaBlob)
      })
		}
	})

  let imageSrc: string | undefined = $state(undefined)
	function transformFilesInUrl(e: Event) {
    if(!files || files.length == 0) return

    let reader = new FileReader()
    reader.onload = function (e) {
      imageSrc = e.target?.result?.toString()
    }

    reader.readAsDataURL(files.item(0)!)

    if(!!onchange) onchange(e)
  }
</script>

<input
  bind:this={fileUploader}
  bind:files={files}
  onchange={transformFilesInUrl}
  class="file-upload" 
  type="file"
  accept="image/*"
/>
{#if !!imageSrc}
  <button 
    class="avatar-wrapper"
    onclick={() => fileUploader?.click()}
  >
    <img 
      class="profile-pic" 
      src={imageSrc}
      alt="company profile"
    />
    <div class="upload-button">
    </div>
  </button>
{:else}
  <button class="avatar-wrapper primary-color 
    flex justify-center items-center flex-col gap-4"
    onclick={() => fileUploader?.click()}
  >
    {noImageText || ''}
    <div>
      <Icon name="mdi-upload" --icon-size="24px"></Icon>
    </div>
  </button>
{/if}

<style>
  .file-upload {
    display: none;
  }
  .primary-color {
    background-color: var(--media-image-upload-background-color, rgb(var(--global-color-primary-500), .8));
  }
  .profile-pic {
    object-fit: cover;
    height: var(--media-image-upload-height, 200px);
    width: var(--media-image-upload-width, 200px);
    min-width: var(--media-image-upload-min-width, 200px);
  }
	.avatar-wrapper {
		position: relative;
		height: var(--media-image-upload-height, 200px);
		width: var(--media-image-upload-width, 200px);
    min-width: var(--media-image-upload-min-width, 200px);
    font-size: var(--media-image-upload-font-size, inherit);
    line-height: var(--media-image-upload-font-size, inherit);
		border-radius: var(--media-image-upload-border-radius, 50%);
		overflow: hidden;
    padding: 0;
		transition: all 0.3s ease;
	}
	.avatar-wrapper .profile-pic {
		transition: all 0.3s ease;
	}
	.avatar-wrapper .profile-pic:after {
    content: 'Carica';
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
		font-size: inherit;
		background: rgb(var(--global-color-primary-500), .5);
		color: rgb(var(--global-color-grey-50));
		text-align: center;
	}
	.avatar-wrapper .upload-button {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}
</style>
