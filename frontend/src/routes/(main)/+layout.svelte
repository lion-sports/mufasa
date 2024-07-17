<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { UnstableDividedSideBarLayout, GlobalSearchTextField } from '@likable-hair/svelte'
	import UserAvatar from '$lib/components/common/UserAvatar.svelte'
	import user from '$lib/stores/auth/user'
	import AuthService from '$lib/services/auth/auth.service'
	import { theme, toggleTheme } from '@likable-hair/svelte'
	import ApplicationLogo from '$lib/components/common/ApplicationLogo.svelte'
	import type { LayoutData } from './$types'

	export let data: LayoutData

	function handleLogoClick() {
		goto('/')
	}
 
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

	function handleMenuClick(event: CustomEvent<{ option: { name: string } }>) {
		if (event.detail.option.name == 'teams') goto('/teams')
    else if (event.detail.option.name == 'calendar') goto('/calendar')
		else if (event.detail.option.name == 'home') goto('/')
	}

	$: options = [
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
			name: 'calendar',
			label: 'Calendario',
			icon: 'mdi-calendar'
		},
		// {
		// 	name: 'assignments',
		// 	label: 'Assignments',
		// 	icon: 'mdi-home'
		// },
		// {
		// 	name: 'messages',
		// 	label: 'Messages',
		// 	icon: 'mdi-message'
		// },
	]

	let selectedIndex: number | undefined = undefined

	$: if ($page.url.pathname.startsWith('/teams'))
		selectedIndex = options.findIndex((o) => o.name == 'teams')
  else if ($page.url.pathname.startsWith('/calendar'))
    selectedIndex = options.findIndex((o) => o.name == 'calendar')
	else selectedIndex = options.findIndex((o) => o.name == 'home')

	let drawerOpened: boolean

  let sidebarVisible: boolean = true
  $: sidebarVisible = !/\/teams\/\d+\/events\/\d+\/scouts\/\d+\/studio$/.test($page.url.pathname)
</script>

<main>
  {#if sidebarVisible}
    <UnstableDividedSideBarLayout
      {options}
      on:menu-select={handleMenuClick}
      bind:drawerOpened
      bind:selectedIndex
      expandOn="hover"
    >
      <svelte:fragment slot="inner-menu" let:hamburgerVisible>
        {#if !!hamburgerVisible}
          <ApplicationLogo
            class="ml-4 mt-2 !h-[45px]"
            on:click={handleLogoClick}
            on:keydown={handleLogoClick}
            collapsed={true}
          />
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
      </svelte:fragment>
      <svelte:fragment slot="logo" let:sidebarExpanded let:hamburgerVisible>
        <ApplicationLogo
          class="mt-4 {sidebarExpanded || hamburgerVisible ? 'ml-4' : 'ml-1'}"
          on:click={handleLogoClick}
          on:keydown={handleLogoClick}
          collapsed={!sidebarExpanded && !hamburgerVisible}
        />
      </svelte:fragment>
      <svelte:fragment slot="user" let:sidebarExpanded let:hamburgerVisible>
        <div style:display="flex" style:flex-direction="column" style:height="100%">
          <div style:flex-grow="1" />
          <div class="profile-container" class:collapsed={!sidebarExpanded && !hamburgerVisible}>
            <div style:margin-bottom="20px">
              <UserAvatar
                username={$user?.firstname + ' ' + $user?.lastname}
                description={$user?.email}
                src={$user?.avatarUrl}
                showTitleAndDescription={sidebarExpanded || hamburgerVisible}
                on:click={handleProfileClick}
              />
            </div>
            {#if sidebarExpanded || hamburgerVisible}
              <div class="mt-3 flex flex-col gap-3 pl-1">
                <button
                  class="cursor-pointer opacity-60 text-left"
                  on:click={handleLogoutClick}
                  on:keydown={handleLogoutClick}
                >
                  Logout
                </button>
                <button
                  class="cursor-pointer opacity-60 text-left"
                  on:click={handleDarkThemeClick}
                  on:keydown={handleDarkThemeClick}
                >
                  {$theme.dark ? 'Tema chiaro' : 'Tema scuro'}
                </button>
              </div>
            {/if}
          </div>
        </div>
      </svelte:fragment>
      <svelte:fragment>
        <slot />
      </svelte:fragment>
    </UnstableDividedSideBarLayout>
  {:else}
    <slot />
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
