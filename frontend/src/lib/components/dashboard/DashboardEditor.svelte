<script lang="ts">
	import DashboardService, {
		type Widget
	} from '$lib/services/dashboards/dashboard.service'
	import DashboardShaper from './DashboardShaper.svelte'
	import { createId } from '@paralleldrive/cuid2'
	import { Icon } from '@likable-hair/svelte'
	import { onMount, type ComponentProps } from 'svelte'
	import * as WidgetComponents from './widgets'
	import * as WidgetAddButton from './widgets/addButtons'
	import WidgetsService from '@/lib/services/widgets/widget.service'

	let addButtonComponentMap: Record<string, ConstructorOfATypedSvelteComponent> = {
		...WidgetAddButton
	}
	let componentMap: Record<string, ConstructorOfATypedSvelteComponent> = { ...WidgetComponents }

	export let widgets: (Omit<Widget, 'id'> & { id: string | number })[] = [],
		someRowSlotEmpty: boolean = true,
		preview: boolean = false,
		canDelete: boolean = true,
		canAdd: boolean = true,
		widgetLoading: Record<number | string, boolean> = {},
    selectedSet: number[] = [],
    scoutId: number | undefined = undefined

	let localWidgets: NonNullable<ComponentProps<DashboardShaper>['widgets']> = [],
    mounted: boolean = false

  onMount(() => {
    mounted = true
  })

  $: if(mounted && selectedSet) loadWidgetData()

	$: if (!!widgets) {
    calculateLocalWidgetsFromWidgets()
  }

  async function loadWidgetData() {
    for(let i = 0; i < widgets.length; i += 1) {
      let widget = widgets[i]
      let widgetSpec = DashboardService.availableWidget.find(
				(aw) => aw.name === widget.componentName
			)

      if(!!widgetSpec?.fetchData) {
        widgetLoading[Number(widget.id)] = true
      }
    }
    
    for(let i = 0; i < widgets.length; i += 1) {
      let widget = widgets[i]
      let widgetSpec = DashboardService.availableWidget.find(
				(aw) => aw.name === widget.componentName
			)

      if(!!widgetSpec?.fetchData) {
        widgets[i].data = await widgetSpec.fetchData(
          {
            fetch,
            widget: widgets[i],
            scoutId,
            sets: selectedSet
          },
          i
        )
        widgetLoading[Number(widget.id)] = false
      }
    }
  }

	async function handleAddWidget(
		event: CustomEvent<{
			widget: {
				widget: {
					name: string | number
					data?: {
						componentName: string
					}
				}
			}
		}>
	) {
		calculateWidgetsFromLocalWidgets()

		if (!!event.detail.widget.widget.data) {
			let widgetSpec = DashboardService.availableWidget.find(
				(aw) => aw.name === event.detail.widget.widget.data?.componentName
			)
			if (!!widgetSpec?.fetchData) {
				let widgetIndex = widgets.findIndex((w) => w.id == event.detail.widget.widget.name)
				if (widgetIndex !== -1) {
					widgetLoading[event.detail.widget.widget.name] = true
					widgets[widgetIndex].data = await widgetSpec.fetchData(
						{
							fetch,
							widget: widgets[widgetIndex],
              scoutId,
              sets: selectedSet
						},
						widgetIndex
					)
					widgetLoading[event.detail.widget.widget.name] = false
				}
			}
		}
	}

	function calculateWidgetsFromLocalWidgets() {
		widgets = localWidgets.map((lw) => {
			return {
				id: lw.widget.name,
				componentName: lw.widget.data.componentName,
				permissions: lw.widget.data.permissions,
				height: lw.widget.data.height,
				width: lw.widget.data.width,
				left: lw.widget.data.left,
				top: lw.widget.data.top,
				data: lw.widget.data.data,
        widgetSetting: lw.widget.data.widgetSetting,
				options: lw.widget.data.options
			}
		})
	}

	function calculateLocalWidgetsFromWidgets() {
		localWidgets = widgets.map((w) => {
			return {
				widget: {
					name: w.id,
					data: {
						id: w.id,
						componentName: w.componentName,
						height: w.height,
						width: w.width,
						left: w.left,
						top: w.top,
						data: w.data,
						options: w.options,
            widgetSetting: w.widgetSetting,
					}
				},
				columnSpanFrom: w.left,
				columnSpanTo: w.left + w.width,
				rowSpanFrom: w.top,
				rowSpanTo: w.top + w.height
			}
		})
	}

	function availableSizes(params: {
		availableHeight: number
		availableWidth: number
		availableSizes: [number, number][]
	}): [number, number][] {
		return params.availableSizes.filter(
			(as) => as[0] <= params.availableHeight && as[1] <= params.availableWidth
		)
	}

	let allWidgetsAvailable = DashboardService.availableWidget,
		filteredWidgets = allWidgetsAvailable

  async function handleReloadWidget(params: { widget: Widget }) {
    let widgetSpec = DashboardService.availableWidget.find(
      (aw) => aw.name === params.widget.componentName
    )
    let widgetIndex = widgets.findIndex((w) => w.id === params.widget.id)
    if(widgetIndex === -1) return

    let widgetService = new WidgetsService({ fetch })
    let fetchedWidget = await widgetService.get({
      id: params.widget.id
    })
    widgets[widgetIndex] = fetchedWidget

    if(!!widgetSpec?.fetchData) {
      widgetLoading[Number(params.widget.id)] = true
      widgets[widgetIndex].data = await widgetSpec.fetchData(
        {
          fetch,
          widget: widgets[widgetIndex],
          scoutId,
          sets: selectedSet
        },
        widgetIndex
      )
      widgetLoading[Number(params.widget.id)] = false
    }
  }
</script>

<DashboardShaper
	bind:someRowSlotEmpty
	bind:preview
	bind:canAdd
	bind:widgets={localWidgets}
	on:addWidget={handleAddWidget}
	on:removeWidget={calculateWidgetsFromLocalWidgets}
>
	<div slot="add-widget" let:addWidgetInfo let:addWidget let:closeAddWidgetDialog>
		{#if !!addWidgetInfo}
			<div class="flex flex-wrap my-2 mobile">
				{#each filteredWidgets.filter((ws) => availableSizes( { availableHeight: addWidgetInfo.availableHeight, availableWidth: addWidgetInfo.availableWidth, availableSizes: ws.availableSizes } ).length > 0) as widgetSpec}
					<div class="p-2.5 rounded-md flex flex-col relative basis-1/2">
						<svelte:component this={addButtonComponentMap[widgetSpec.name + 'AddButton']}>
							<div slot="label" class="text-xl font-bold">
								{widgetSpec.label}
							</div>
						</svelte:component>
						<div class="flex gap-2 flex-wrap mt-2">
							{#each availableSizes( { availableHeight: addWidgetInfo.availableHeight, availableWidth: addWidgetInfo.availableWidth, availableSizes: widgetSpec.availableSizes } ) as sizes}
								<button
									on:click={() => {
										addWidget({
											widget: {
												name: createId(),
												data: {
													componentName: widgetSpec.name,
													height: sizes[0],
													width: sizes[1],
													top: addWidgetInfo.fromRow,
													left: addWidgetInfo.fromColumn
												}
											},
											fromColumn: addWidgetInfo.fromColumn,
											fromRow: addWidgetInfo.fromRow,
											height: sizes[0],
											width: sizes[1]
										})
										closeAddWidgetDialog()
									}}
									class="py-0.5 px-2 bg-[rgb(var(--global-color-primary-500))] hover:bg-[rgb(var(--global-color-primary-500),.7)] rounded text-sm transition-colors text-[rgb(var(--global-color-primary-foreground))]"
									>{sizes[0]} x {sizes[1]}</button
								>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<div
		slot="widget"
		class="w-full h-full overflow-auto"
		class:relative={canDelete}
		let:widget
		let:removeWidget
	>
		{#if !!componentMap[widget.widget?.data.componentName]}
			<div class="w-full h-full p-2">
        <div class="w-full h-[calc(100%)] overflow-auto border-[rgb(var(--global-color-contrast-200),.1)] rounded border py-2 px-2">
          <svelte:component
            this={componentMap[widget.widget?.data.componentName]}
            widget={widget.widget?.data}
            loadingData={widgetLoading[widget.widget?.name || '']}
            {selectedSet}
            on:reload={() => handleReloadWidget({ widget: widget.widget?.data })}
          />
        </div>
			</div>
		{:else}
			<div class="w-full flex items-center justify-center text-sm font-light h-full">
				Sorry, this widget is not available anymore
			</div>
		{/if}
		{#if canDelete}
			<div class="absolute left-0 right-0 top-0 bottom-0 black-glass" />
			<div class="absolute top-2 right-4">
				<div
					class="bin-container w-6 h-6 flex justify-center items-center bg-[rgb(var(--global-color-error-500))] rounded-full"
				>
					<Icon
						click
						on:click={() => removeWidget({ name: widget.widget?.name || '' })}
						name="mdi-delete"
					/>
				</div>
			</div>
		{/if}
	</div>
</DashboardShaper>

<style>
	.black-glass {
		background-color: rgb(var(--global-color-background-100),.5);
		backdrop-filter: blur(1px);
	}

	.mobile {
		width: min(90vw, 600px);
	}

	@media screen and (max-width: 600px) {
		.mobile {
			width: 100%;
			flex-direction: column;
		}
	}
</style>
