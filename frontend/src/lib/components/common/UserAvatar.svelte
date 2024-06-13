<script lang="ts">
	export let username: string,
		description: string = '',
		showTitleAndDescription: boolean = true,
    direction: ComponentProps<DescriptiveAvatar>['direction'] = 'row',
    reverse: ComponentProps<DescriptiveAvatar>['reverse'] | undefined = undefined,
		src: string | undefined

	import { Avatar, DescriptiveAvatar } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'
</script>

{#if showTitleAndDescription}
  <DescriptiveAvatar
    title={username}
    subtitle={description}
    src={src || ''}
    {reverse}
    {direction}
    on:click
    --avatar-min-width="40px"
  ></DescriptiveAvatar>
{:else}
  <Avatar
    text={username.substring(0, 2).toUpperCase()}
  ></Avatar>
{/if}
