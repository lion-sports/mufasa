<script lang="ts">
	import { run } from 'svelte/legacy';

	import DashboardAddButton from './DashboardAddButton.svelte'
	import StandardDialog from '../common/StandardDialog.svelte'
	import { createEventDispatcher } from 'svelte'

	interface Props {
		widgets?: {
			widget: {
				name: string | number
				options?: Record<string, any>
				data?: any
			}
			columnSpanFrom: number
			columnSpanTo: number
			rowSpanFrom: number
			rowSpanTo: number
			availableHeight?: number
			availableWidth?: number
		}[];
		layoutWidth?: number;
		layoutHeight?: number | undefined;
		someRowSlotEmpty?: boolean;
		preview?: boolean;
		canAdd?: boolean;
		widgetSnippet?: import('svelte').Snippet<[any]>;
		addWidgetSnippet?: import('svelte').Snippet<[any]>;
	}

	let {
		widgets = $bindable([]),
		layoutWidth = 6,
		layoutHeight = undefined,
		someRowSlotEmpty = $bindable(true),
		preview = $bindable(false),
		canAdd = $bindable(true),
		widgetSnippet,
		addWidgetSnippet
	}: Props = $props();

	let dispatch = createEventDispatcher<{
		addWidget: {
			widget: (typeof widgets)[number]
		}
		removeWidget: {
			widget: (typeof widgets)[number]
		}
	}>()


	let normalizedWidgetGrid: ((typeof widgets)[number] | undefined)[][] = $state([])

	function calculateNormalizedWidgetGrid() {
		normalizedWidgetGrid = []
		for (let wi = 0; wi < widgets.length; wi += 1) {
			let widget = widgets[wi]
			for (let wr = widget.rowSpanFrom - 1; wr < widget.rowSpanTo - 1; wr += 1) {
				if (!normalizedWidgetGrid[wr]) normalizedWidgetGrid[wr] = []

				for (let wc = widget.columnSpanFrom - 1; wc < widget.columnSpanTo - 1; wc += 1) {
					normalizedWidgetGrid[wr][wc] = widget
				}
			}
		}

		for (let r = 0; r < normalizedWidgetGrid.length; r += 1) {
			if (!normalizedWidgetGrid[r] || normalizedWidgetGrid[r].length !== layoutWidth) {
				if (!normalizedWidgetGrid[r]) normalizedWidgetGrid[r] = []
				for (let c = normalizedWidgetGrid[r].length; c < layoutWidth; c += 1) {
					normalizedWidgetGrid[r][c] = undefined
				}
			}
		}
	}



	let filledWidgetGrid: (Omit<(typeof widgets)[number], 'widget'> & {
		widget?: (typeof widgets)[number]['widget'] | undefined
	})[] = $state([])

	function calculateFilledWidgetGrid() {
		filledWidgetGrid = []
		for (let r = 0; r < normalizedWidgetGrid.length; r += 1) {
			let normalizedRow = normalizedWidgetGrid[r]
			for (let c = 0; c < normalizedRow.length; c += 1) {
				let rowItem = normalizedRow[c]
				if (rowItem === undefined && (normalizedRow[c - 1] !== undefined || c === 0)) {
					let availableHeight: number = layoutHeight === undefined ? Infinity : 1
					while (
						normalizedWidgetGrid[r + availableHeight]?.[c] === undefined &&
            layoutHeight !== undefined &&
						r + availableHeight < layoutHeight
					)
						availableHeight += 1

					let availableWidth: number = 1
					while (
						normalizedWidgetGrid[r]?.[c + availableWidth] === undefined &&
						c + availableWidth < layoutWidth
					)
						availableWidth += 1

					filledWidgetGrid.push({
						rowSpanFrom: r + 1,
						rowSpanTo: r + 2,
						columnSpanFrom: c + 1,
						columnSpanTo: c + availableWidth + 1,
						availableHeight,
						availableWidth
					})
				} else if (
					rowItem !== undefined &&
					filledWidgetGrid.every((w) => w.widget?.name !== rowItem?.widget.name)
				) {
					filledWidgetGrid.push(rowItem)
				}
			}
		}
	}

	let addWidgetDialog: boolean = $state(false),
		addWidgetInfo:
			| {
					availableHeight: number
					availableWidth: number
					fromRow: number
					fromColumn: number
			  }
			| undefined = $state(undefined)
	function handleAddClick(params: { slot: (typeof filledWidgetGrid)[number] }) {
		addWidgetDialog = true
		addWidgetInfo = {
			availableHeight: params.slot.availableHeight || 1,
			availableWidth: params.slot.availableWidth || 1,
			fromRow: params.slot.rowSpanFrom,
			fromColumn: params.slot.columnSpanFrom
		}
	}

	function addWidget(params: {
		widget: (typeof widgets)[number]['widget']
		fromRow: number
		fromColumn: number
		width: number
		height: number
	}) {
		let widgetToAdd = {
			widget: params.widget,
			rowSpanFrom: params.fromRow,
			rowSpanTo: params.fromRow + params.height,
			columnSpanFrom: params.fromColumn,
			columnSpanTo: params.fromColumn + params.width
		}

		widgets = [...widgets, widgetToAdd]

		dispatch('addWidget', {
			widget: widgetToAdd
		})
	}

	function removeWidget(params: { name: string | number }) {
		let widgetToRemove = widgets.find((w) => w.widget.name === params.name)
		widgets = widgets.filter((w) => w.widget.name !== params.name)

		if (!!widgetToRemove) {
			dispatch('removeWidget', {
				widget: widgetToRemove
			})
		}
	}

	function closeAddWidgetDialog() {
		addWidgetDialog = false
	}
	run(() => {
		if (!!widgets) calculateNormalizedWidgetGrid()
	});
	run(() => {
		someRowSlotEmpty = normalizedWidgetGrid.some((row) => {
			for (let i = 0; i < layoutWidth; i += 1) {
				if (row[i] === undefined) return true
			}
			return false
		})
	});
	run(() => {
		if (!!normalizedWidgetGrid) calculateFilledWidgetGrid()
	});
</script>

<div
	class="shaper"
	style:--dashboard-shaper-grid-template-columns={`repeat(${layoutWidth}, 1fr)`}
	style:--dashboard-shaper-grid-template-rows={`repeat(${Math.min(layoutHeight || Infinity, normalizedWidgetGrid.length)}, var(--dashboard-shaper-widget-height, 200px))`}
>
	{#each filledWidgetGrid as widget}
		{#if !!widget.widget}
			<div
				style:grid-column={`${widget.columnSpanFrom} / ${widget.columnSpanTo}`}
				style:grid-row={`${widget.rowSpanFrom} / ${widget.rowSpanTo}`}
			>
				{#if preview}
					<div class="widget-preview"></div>
				{:else}
					{#if widgetSnippet}{@render widgetSnippet({ widget, removeWidget, })}{:else}
						{widget.widget.name}
					{/if}
				{/if}
			</div>
		{:else if !preview && canAdd}
			<div
				style:grid-column={`${widget.columnSpanFrom} / ${widget.columnSpanTo}`}
				style:grid-row={`${widget.rowSpanFrom} / ${widget.rowSpanTo}`}
			>
        <DashboardAddButton on:click={() => handleAddClick({ slot: widget })} />
			</div>
		{/if}
	{/each}
	{#if (layoutHeight === undefined || normalizedWidgetGrid.length < layoutHeight) && !preview && canAdd}
		<div style:grid-column={`1 / ${layoutWidth + 1}`}>
			<DashboardAddButton
				on:click={() =>
					handleAddClick({
						slot: {
							columnSpanFrom: 1,
							columnSpanTo: layoutWidth + 1,
							rowSpanFrom: normalizedWidgetGrid.length + 1,
							rowSpanTo: normalizedWidgetGrid.length + 2,
							availableHeight: layoutHeight === undefined ? Infinity : layoutHeight - normalizedWidgetGrid.length,
							availableWidth: layoutWidth
						}
					})}
			/>
		</div>
	{/if}
</div>

<StandardDialog title="Add widget" bind:open={addWidgetDialog}>
	<div>
		{#if !!addWidgetInfo}
			{@render addWidgetSnippet?.({ addWidgetInfo: {
					availableHeight: addWidgetInfo.availableHeight,
					availableWidth: addWidgetInfo.availableWidth,
					fromRow: addWidgetInfo.fromRow,
					fromColumn: addWidgetInfo.fromColumn
				}, addWidget, closeAddWidgetDialog, })}
		{/if}
	</div>
</StandardDialog>

<style>
	.shaper {
		width: 100%;
		min-height: 200px;
		display: grid;
		gap: var(--dashboard-shaper-gap, 0px);
		grid-template-columns: var(--dashboard-shaper-grid-template-columns);
		grid-template-rows: var(--dashboard-shaper-grid-template-rows);
	}

	.widget-preview {
		width: 100%;
		height: 100%;
		background-color: rgb(var(--global-color-primary-500), 0.5);
		border-radius: var(--dashboard-shaper-widget-preview-border-radius, 8px);
	}

	@media screen and (max-width: 991.98px) {
		.shaper {
			display: var(--dashboard-shaper-display-mobile, flex);
			flex-direction: var(--dashboard-shaper-flex-direction-mobile, column);
		}
	}
</style>
