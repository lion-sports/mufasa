<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { UnstableDividedSideBarLayout, GlobalSearchTextField, HierarchyMenu } from '@likable-hair/svelte'
	import UserAvatar from '$lib/components/common/UserAvatar.svelte'
	import user from '$lib/stores/auth/user'
	import AuthService from '$lib/services/auth/auth.service'
	import { theme, toggleTheme } from '@likable-hair/svelte'
	import ApplicationLogo from '$lib/components/common/ApplicationLogo.svelte'
	import type { LayoutData } from './$types'

	interface Props {
		data: LayoutData
		children?: import('svelte').Snippet
	}

	let { children: childernino }: Props = $props()

	function handleProfileClick() {
		goto('/profile')
	}

	async function handleLogoutClick() {
		let service = new AuthService({ fetch })
		await service.logout()
		goto('/auth/login')
	}

	async function handleDarkThemeClick() {
		toggleTheme()
		fetch('/api/setTheme?dark=' + $theme.dark)
	}

	function handleMenuClick(event: { detail: { option: { name: string } } }) {
		if (event.detail.option.name == 'teams') goto('/teams')
		else if (event.detail.option.name == 'calendar') goto('/calendar')
    else if (event.detail.option.name == 'clubs') goto('/clubs')
    else if (event.detail.option.name == 'inbox') goto('/inbox')
		else if (event.detail.option.name == 'home') goto('/')

    drawerOpened = false
	}

	let options = $derived([
		{
			name: 'home',
			label: 'Home',
			icon: 'mdi-home'
		},
		{
			name: 'teams',
			label: 'Teams',
			icon: 'mdi-account-multiple'
		},
    {
			name: 'clubs',
			label: 'Clubs',
			icon: 'mdi-domain'
		},
		{
			name: 'calendar',
			label: 'Calendario',
			icon: 'mdi-calendar'
		},
		{
			name: 'inbox',
			label: 'Inbox',
			icon: 'mdi-email'
		}
	])

  let selectedMenu = $derived.by(() => {
    let selectedMenu: string
    if (page.url.pathname.startsWith('/teams'))
			selectedMenu = 'teams'
		else if (page.url.pathname.startsWith('/calendar'))
      selectedMenu = 'calendar'
    else if (page.url.pathname.startsWith('/clubs'))
      selectedMenu = 'clubs'
    else if (page.url.pathname.startsWith('/inbox'))
      selectedMenu = 'inbox'
		else selectedMenu = 'home'
    return selectedMenu
  })

	let drawerOpened: boolean = $state(false)

	let sidebarVisible: boolean = $derived.by(() => {
    return !/\/teams\/\d+\/events\/\d+\/scouts\/\d+\/studio$/.test(page.url.pathname)
  })
</script>

<main>
	{#if sidebarVisible}
		<UnstableDividedSideBarLayout
			{options}
			bind:drawerOpened
      onmenuSelect={handleMenuClick}
			expandOn="hover"
      --unstable-divided-side-bar-layout-content-padding="16px"
		>
			{#snippet innerMenuSnippet({ hamburgerVisible })}
				{#if !!hamburgerVisible}
					<ApplicationLogo class="ml-4 mt-2 !h-[45px]" collapsed={true} />
				{:else}
					<div class="w-full flex justify-center">
						<GlobalSearchTextField
							--global-search-text-field-width="200px"
							--global-search-text-field-border-radius="5px"
							--global-search-text-field-ring-color="transparent"
							--global-search-text-field-hover-ring-color="transparent"
							--global-search-text-field-background-color="rgb(var(--global-color-background-200))"
						/>
					</div>
				{/if}
			{/snippet}
			{#snippet logoSnippet({ sidebarExpanded, hamburgerVisible })}
				<ApplicationLogo
					class="mt-4 {sidebarExpanded || hamburgerVisible ? 'ml-4' : 'ml-1'}"
					collapsed={!sidebarExpanded && !hamburgerVisible}
				/>
			{/snippet}
			{#snippet userSnippet({ sidebarExpanded, hamburgerVisible })}
				<div style:display="flex" style:flex-direction="column" style:height="100%">
					<div style:flex-grow="1"></div>
					<div class="profile-container" class:collapsed={!sidebarExpanded && !hamburgerVisible}>
						<div style:margin-bottom="20px">
							<UserAvatar
								username={$user?.firstname + ' ' + $user?.lastname}
								description={$user?.email}
								src={$user?.avatarUrl}
								showTitleAndDescription={sidebarExpanded || hamburgerVisible}
								onclick={handleProfileClick}
							/>
						</div>
						{#if sidebarExpanded || hamburgerVisible}
							<div class="mt-3 flex flex-col gap-3 pl-1">
								<button
									class="cursor-pointer opacity-60 text-left"
									onclick={handleLogoutClick}
									onkeydown={handleLogoutClick}
								>
									Logout
								</button>
								<button
									class="cursor-pointer opacity-60 text-left"
									onclick={handleDarkThemeClick}
									onkeydown={handleDarkThemeClick}
								>
									{$theme.dark ? 'Tema chiaro' : 'Tema scuro'}
								</button>
							</div>
						{/if}
					</div>
				</div>
			{/snippet}
			{#snippet children()}
				{@render childernino?.()}
			{/snippet}
		</UnstableDividedSideBarLayout>
	{:else}
		{@render childernino?.()}
	{/if}
</main>

<style>
	.profile-container {
		padding-left: 10px;
		transition-property: padding-left;
		transition: 200ms;
		margin-top: 10px;
	}

	.profile-container.collapsed {
		padding-left: 8px;
	}
</style>
