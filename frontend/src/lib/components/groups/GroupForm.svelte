<script lang="ts">
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import GroupsService, {
		RESOURCES,
		RESOURCES_ICONS,
		type Group,
		type Resource
	} from '$lib/services/groups/groups.service'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import { Icon } from '@likable-hair/svelte'

	interface Props {
		group?: DeepPartial<Group>
    view?: 'team' | 'club'
	}

	let {
		group = $bindable({
			name: undefined
		}),
    view = 'team'
	}: Props = $props()

	function getActions(resource: Resource) {
		return GroupsService.getActionsForResource(resource)
	}

	function translateAction(action: string) {
		return GroupsService.translateActions(action)
	}

	function handleCheckChange<R extends Resource>(resource: R, action: string, event: any) {
		if (!group.cans) group.cans = {}
		if (!group.cans[resource]) group.cans[resource] = {}
    // @ts-ignore
    if (!!group.cans[resource]) group.cans[resource][action] = event.target.checked
	}
</script>

<div class="flex flex-col gap-4">
  <div>
    <LabelAndTextfield label="Nome" name="name" bind:value={group.name} />
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each RESOURCES as resource}
      {@const actions = getActions(resource)}
      {@const isTeamResource = GroupsService.isTeamPermission({ resource })}
      {@const isClubResource = GroupsService.isClubPermission({ resource })}
      {#if !!actions && (
        (view == 'club' && isClubResource) || (view == 'team' && isTeamResource)
      )}
        <div class="ring-[1px] ring-[rgb(var(--global-color-background-400),.5)] rounded p-2 flex flex-col gap-2">
          <div class="font-semibold text-xl mb-2">
            {#if !!RESOURCES_ICONS[resource]}
              <span class="mr-2">
                <Icon name={RESOURCES_ICONS[resource]}></Icon>
              </span>
            {/if}
            {GroupsService.translateResource(resource)}
          </div>
          <div class="grid grid-cols-2 gap-1">
            {#each actions as action}
              {@const isTeamAction = GroupsService.isTeamPermission({ resource, action: action as any })}
              {@const isClubAction = GroupsService.isClubPermission({ resource, action: action as any })}
              {#if (isTeamAction && view == 'team') || (isClubAction && view == 'club')}
                <div>
                  <LabelAndCheckbox
                    value={!!group.cans && !!group.cans[resource]
                      ? // @ts-ignore
                        group.cans[resource][action]
                      : false}
                    label={translateAction(action)}
                    id={`${resource}-${action}`}
                    onchange={(event) => handleCheckChange(resource, action, event.detail.nativeEvent)}
                  />
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>
  {#if view == 'team'}
    <div class="mt-2">
      <LabelAndCheckbox label="Convocabile" bind:value={group.convocable} id="convocable" />
    </div>
  {/if}
</div>
