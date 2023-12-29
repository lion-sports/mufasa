<script lang="ts">
  import { goto } from "$app/navigation";
	import { page } from "$app/stores";
  import { CollapsibleSideBarLayout } from "@likable-hair/svelte"
  import logo from '$lib/assets/logo.svg'
  import logoPartial from '$lib/assets/logo_partial.svg'
	import UserAvatar from "$lib/components/common/UserAvatar.svelte";
  import user from '$lib/stores/auth/user'
  import AuthService from "$lib/services/auth/auth.service";
  import { theme, toggleTheme } from "@likable-hair/svelte";
	import type { MenuItem } from "@likable-hair/svelte/dist/components/simple/lists/SelectableMenuList.svelte";

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

  function handleMenuClick(event: CustomEvent<{ menu: MenuItem }>) {
    if(!event.detail.menu.divider && event.detail.menu.name == 'home') goto('/')
    if(!event.detail.menu.divider && event.detail.menu.name == 'about') goto('/about')
  }

  let selectedMenu: string = 'home'
  $: if($page.url.pathname.startsWith('/about')) selectedMenu = 'about'
    else selectedMenu = 'home'

  let hamburgerVisible: boolean

</script>

<main>
  <CollapsibleSideBarLayout
    fullLogo={logo}
    partialLogo={logoPartial}
    menuItems={[
      {
        name: 'home',
        label: 'Home',
        icon: 'mdi-home'
      }, {
        name: 'about',
        label: 'About',
        icon: 'mdi-account-circle'
      }
    ]}
    on:menu-select={handleMenuClick}
    bind:drawerOpened={hamburgerVisible}
    bind:selectedMenuElementName={selectedMenu}
  >
    <svelte:fragment slot="sidebar-footer" let:collapsed let:drawer>
      <div style:display="flex" style:flex-direction="column" style:height="100%">
        {#if drawer}
          <div style:flex-grow="1"></div>
        {/if}
        <div
          class="profile-container"
          class:collapsed={collapsed}
        >
          <div style:margin-bottom="20px">
            <UserAvatar
              username={$user?.firstname + ' ' + $user?.lastname}
              description={$user?.email}
              src=""
              showTitleAndDescription={!collapsed}
              on:click={handleProfileClick}
            />
          </div>
          {#if !collapsed}
            <div class="mt-3 flex flex-col gap-3 pl-1">
              <div 
                class="cursor-pointer opacity-60"
                on:click={handleLogoutClick}
                on:keydown={handleLogoutClick}
              >Logout</div>
              <div 
                class="cursor-pointer opacity-60"
                on:click={handleDarkThemeClick}
                on:keydown={handleDarkThemeClick}
              >{$theme.dark ? 'Tema chiaro' : 'Tema scuro'}</div>
            </div>
          {/if}
        </div>
      </div>
    </svelte:fragment>
    <svelte:fragment>
      <slot hamburgerVisible={hamburgerVisible}></slot>
    </svelte:fragment>
  </CollapsibleSideBarLayout>

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