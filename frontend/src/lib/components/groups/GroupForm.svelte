<script lang="ts">
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import GroupsService, { RESOURCES, type Group, type Resource } from '$lib/services/groups/groups.service'
	import { Icon } from '@likable-hair/svelte'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import { slide } from 'svelte/transition'

	interface Props {
		group?: DeepPartial<Group>;
		padding?: string | undefined;
		margin?: string | undefined;
		width?: string | undefined;
		height?: string | undefined;
	}

	let {
		group = $bindable({
			name: undefined
		}),
		padding = undefined,
		margin = undefined,
		width = undefined,
		height = undefined
	}: Props = $props();

	let closureStatus: { [key: string]: boolean } = $state({})

	function getActions(resource: Resource) {
		return GroupsService.getActionsForResource(resource)
	}

	function translateAction(action: string) {
		return GroupsService.translateActions(action)
	}

	function handleCheckChange(resource: string, action: string, event: any) {
		// @ts-ignore
		if (!group.cans) group.cans = {}
		// @ts-ignore
		if (!group.cans[resource]) group.cans[resource] = {}
		// @ts-ignore
		group.cans[resource][action] = event.target.checked
	}
</script>

<form style:padding style:margin style:width style:height>
	<LabelAndTextfield label="Nome" name="name" bind:value={group.name} />
	<div class="font-bold mt-4">Poteri</div>
	<div class="resources-container">
		{#each RESOURCES as resource}
			{#if !!getActions(resource)}
				<div class="resource">
					<button
						class="resource-title-container"
						type="button"
						onclick={() => (closureStatus[resource] = !closureStatus[resource])}
					>
						<div class="resource-title">{GroupsService.translateResource(resource)}</div>
						<div class="expand-icon" class:reverse={closureStatus[resource]}>
							<Icon name="mdi-menu-down" />
						</div>
					</button>
					{#if closureStatus[resource]}
						<div transition:slide|local={{ duration: 200 }}>
							{#each getActions(resource) as action}
								<div style:margin-top="10px">
									<LabelAndCheckbox
										value={!!group.cans && !!group.cans[resource]
                      // @ts-ignore
											? group.cans[resource][action]
											: false}
										label={translateAction(action)}
										id={`${resource}-${action}`}
										on:change={(event) => handleCheckChange(resource, action, event)}
									/>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
	<div class="convocable-flag">
		<LabelAndCheckbox label="Convocabile" bind:value={group.convocable} id="convocable" />
	</div>
</form>

<style>
	@media (max-width: 768px) {
		.resource {
			width: 100%;
		}
	}

	@media (min-width: 769px) {
		.resource {
			width: 300px;
		}
	}

	.reverse {
		transform: rotate(180deg);
	}

	.expand-icon {
		transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
	}

	.resources-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 20px;
	}

	.convocable-flag {
		margin-top: 20px;
	}

	.resource {
		background-color: rgb(var(--global-color-background-300));
		padding: 10px;
		border-radius: 5px;
		height: fit-content;
	}

	.resource-title-container {
		display: flex;
		width: 100%;
	}

	.resource-title {
		font-weight: 700;
		font-size: 1.2rem;
		flex-grow: 1;
		text-align: left;
	}
</style>
