<script lang="ts">
	import PageTitle from '$lib/components/common/PageTitle.svelte'
  import type { LayoutData } from './$types';
  import TeammatesService from '$lib/services/teammates/teammates.service';
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import StandardTabSwitcher from '$lib/components/common/StandardTabSwitcher.svelte'
	import type { ComponentProps } from 'svelte'
	import { slide } from 'svelte/transition'
  
  export let data: LayoutData;

  let tabs: NonNullable<ComponentProps<StandardTabSwitcher>['tabs']> = []
  $: {
    tabs = []
    if(data.groupedPermissions.teammate.update) {
      tabs = [
        ...tabs,
        {
          name: 'edit',
          label: 'Modifica',
          icon: 'mdi-pencil'
        }
      ]
    }

    if(data.groupedPermissions.shirt.view) {
      tabs = [
        ...tabs,
        {
          name: 'shirts',
          label: 'Divise',
          icon: 'mdi-tshirt-crew'
        }
      ]
    }
  }


  let selectedTab: string = ''
  function handleTabClick(event: any) {
		if (selectedTab == 'edit') {
			goto(`/teams/${data.team.id}/teammates/${data.teammate.id}/edit`, { replaceState: true })
		} else if (selectedTab == 'shirts') {
			goto(`/teams/${data.team.id}/teammates/${data.teammate.id}/shirts`, { replaceState: true })
		}
	}

	$: if ($page.url.href.endsWith('edit')) {
		selectedTab = 'edit'
	} else if ($page.url.href.endsWith('shirts')) {
		selectedTab = 'shirts'
	}

  $: headerHidden =
    /shirts\/new/.test($page.url.pathname) ||
    /shirts\/\d+\/edit/.test($page.url.pathname)
</script>

{#if !headerHidden}
  <div transition:slide|local={{ duration: 200 }}>
    <PageTitle
      prependVisible
      title={TeammatesService.getTeammateName({
        teammate: data.teammate
      })}
      subtitle={data.team.name}
    ></PageTitle>

    <StandardTabSwitcher
      {tabs}
      marginTop="10px"
      marginBottom="10px"
      bind:selected={selectedTab}
      on:tab-click={handleTabClick}
    />
  </div>
{/if}

<slot></slot>