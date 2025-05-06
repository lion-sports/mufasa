<script lang="ts">
	import { run } from 'svelte/legacy'

	import type { LayoutData } from './$types'
	import UserAvatar from '$lib/components/common/UserAvatar.svelte'
	import user from '$lib/stores/auth/user'
	import StandardTabSwitcher from '$lib/components/common/StandardTabSwitcher.svelte'
	import type { ComponentProps } from 'svelte'
	import { page } from '$app/stores'

	interface Props {
		data: LayoutData
		children?: import('svelte').Snippet
	}

	let { data, children }: Props = $props()

	let tabs: ComponentProps<typeof StandardTabSwitcher>['tabs'] = [
			{
				name: 'scoringSystems',
				label: 'Sistemi di punteggio',
				icon: 'mdi-scoreboard'
			}
		],
		selectedTab: string = $state('scoringSystems')

	run(() => {
		if ($page.url.href.endsWith('scoringSystems')) {
			selectedTab = 'scoringSystems'
		}
	})

	let headerHidden = $derived(
		$page.url.pathname.endsWith('/scoringSystems/create') ||
			/\/scoringSystems\/\d+\/edit$/.test($page.url.pathname)
	)
</script>

{#if !headerHidden}
	<div class="flex justify-center items-center flex-col">
		<UserAvatar
			username={$user?.firstname + ' ' + $user?.lastname}
			description={$user?.email}
			solanaPublicKey={$user?.solanaPublicKey}
			src={$user?.avatarUrl}
			--avatar-width="166px"
			--avatar-height="166px"
			--descriptive-avatar-title-font-size="2rem"
			--descriptive-avatar-text-gap="12px"
			--descriptive-avatar-image-gap="16px"
			direction="column"
		/>
	</div>

	<StandardTabSwitcher {tabs} selected={selectedTab}></StandardTabSwitcher>
{/if}

{@render children?.()}
