<script lang="ts">
  import type { LayoutData } from './$types';
  import UserAvatar from '$lib/components/common/UserAvatar.svelte';
  import user from '$lib/stores/auth/user'
  import StandardTabSwitcher from '$lib/components/common/StandardTabSwitcher.svelte';
	import type { ComponentProps } from 'svelte'
  import { page } from '$app/stores';
  
  export let data: LayoutData;

  let tabs: ComponentProps<StandardTabSwitcher>['tabs'] = [
      {
        name: 'scoringSystems',
        label: 'Sistemi di punteggio',
        icon: 'mdi-scoreboard'
      }
    ],
    selectedTab: string = 'scoringSystems'

  $: if ($page.url.href.endsWith('scoringSystems')) {
		selectedTab = 'scoringSystems'
	}

  $: headerHidden =
		$page.url.pathname.endsWith('/scoringSystems/create') ||
		/\/scoringSystems\/\d+\/edit$/.test($page.url.pathname)
</script>

{#if !headerHidden}
  <div class="flex justify-center items-center flex-col">
    <UserAvatar
      username={$user?.firstname + ' ' + $user?.lastname}
      description={$user?.email}
      src={$user?.avatarUrl}
      showTitleAndDescription={false}
      --avatar-width="166px"
      --avatar-height="166px"
      --user-avatar-font-size="3rem"
    />
    <div class="mt-4 text-4xl font-bold">
      {$user?.firstname + ' ' + $user?.lastname}
    </div>
  </div>

  <StandardTabSwitcher
    tabs={tabs}
    selected={selectedTab}
  ></StandardTabSwitcher>
{/if}

<slot></slot>