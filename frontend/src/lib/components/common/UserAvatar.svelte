<script lang="ts">
	export let username: string,
		description: string = '',
		showTitleAndDescription: boolean = true,
    direction: ComponentProps<DescriptiveAvatar>['direction'] = 'row',
    reverse: ComponentProps<DescriptiveAvatar>['reverse'] | undefined = undefined,
		src: string | undefined

	import { DescriptiveAvatar } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'
</script>

<DescriptiveAvatar
  title={showTitleAndDescription ? username : undefined}
  subtitle={showTitleAndDescription ? description : undefined}
  src={src || ''}
  {reverse}
  {direction}
  on:click
></DescriptiveAvatar>
