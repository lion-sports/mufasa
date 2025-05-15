<script lang="ts">
	import { type ComponentProps } from 'svelte'
	import StandardDialog from './StandardDialog.svelte'
	import { Icon } from '@likable-hair/svelte'
	import StandardButton from './StandardButton.svelte'

  type Props = {
    open: boolean
		title?: string
		description?: string
		confirmButtonStyle?: ComponentProps<StandardButton>['style']
		confirmText?: string
		cancelButtonStyle?: ComponentProps<StandardButton>['style']
		cancelText?: string
    icon?: string
		loading?: boolean
    children?: import('svelte').Snippet
    confirm?: () => void
    cancel?: () => void
  }

  let {
    open = $bindable(),
		title = 'Sei sicuro?',
		description = undefined,
		confirmButtonStyle = 'danger',
		confirmText = 'Elimina',
		cancelButtonStyle = 'secondary',
		cancelText = 'Annulla',
    icon = 'mdi-alert-circle',
		loading = false,
    children,
    confirm,
    cancel
  }: Props = $props()
</script>

<StandardDialog bind:open>
	<div class="px-4 pt-6 pb-4 flex flex-col items-center gap-2">
    
		<Icon class="mb-6" name={icon} --icon-size="50px" />
		<div class="font-bold text-2xl">{title}</div>
		<div class="max-w-md text-lg mb-2">
      {#if !!children}
        {@render children()}
      {:else}
        {description || ''}
      {/if}
		</div>
		<div class="w-full grid gap-2">
			<div class="w-full">
				<StandardButton
					--button-width="100%"
					style={confirmButtonStyle}
					bind:loading
					on:click={() => {
            if(!!confirm) {
              confirm()
            }
          }}
				>
					{confirmText}
				</StandardButton>
			</div>
			<div class="w-full">
				<StandardButton
					--button-width="100%"
					style={cancelButtonStyle}
					on:click={() => {
            open = false
            if(!!cancel) {
              cancel()
            }
					}}>{cancelText}</StandardButton
				>
			</div>
		</div>
	</div>
</StandardDialog>
