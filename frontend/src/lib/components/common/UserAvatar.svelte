<script lang="ts">

	import { Avatar, DescriptiveAvatar } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'
  interface Props {
    username: string;
    description?: string;
    solanaPublicKey?: string;
    showTitleAndDescription?: boolean;
    direction?: ComponentProps<typeof DescriptiveAvatar>['direction'];
    reverse?: ComponentProps<typeof DescriptiveAvatar>['reverse'] | undefined;
    onclick?: ComponentProps<typeof DescriptiveAvatar>['onclick'] | undefined;
    src?: string | undefined;
  }

  let {
    username,
    description = '',
    solanaPublicKey = '',
    showTitleAndDescription = true,
    direction = 'row',
    reverse = undefined,
    src = undefined,
    onclick = undefined
  }: Props = $props();
</script>

{#if showTitleAndDescription}
  <DescriptiveAvatar
    title={username}
    subtitle={description}
    src={src || ''}
    {reverse}
    {direction}
    {onclick}
    --avatar-min-width="40px"
  ></DescriptiveAvatar>

  {#if solanaPublicKey}
    <div>
      Solana wallet: {solanaPublicKey}
    </div>
  {/if}
{:else}
  <Avatar
    text={username.substring(0, 2).toUpperCase()}
  ></Avatar>
{/if}
