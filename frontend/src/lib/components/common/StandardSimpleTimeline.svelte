<script lang="ts" context="module">
	export type TimeLineItem = {
		name: string
		title?: string
		description?: string
		imageUrl?: string
		from?: Date
		to?: Date
		data?: any
	}
	import { DateTime } from 'luxon'
</script>

<script lang="ts">
	import { SimpleTimeLine } from '@likable-hair/svelte'

	export let items: TimeLineItem[] = [],
		singleSided: boolean = false,
		circleColor: string | undefined = undefined,
		circleDiameter: string | undefined = undefined,
		timesWidth: string | undefined = undefined,
		itemTitle: string | undefined = undefined
</script>

<SimpleTimeLine
	{items}
	{singleSided}
	{circleColor}
	{circleDiameter}
	{timesWidth}
	firstItemMarginTop="30px"
>
	<svelte:fragment slot="item" let:item>
		<div class="item-container">
			<div class="times-column" style:color="rgb(var(--global-color-contrast-300))">
				{#if item.from}
					{DateTime.fromJSDate(item.from)
						.setLocale('it')
						.toLocaleString({ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
				{/if}
				{#if item.to}
					- {DateTime.fromJSDate(item.to)
						.setLocale('it')
						.toLocaleString({ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
				{/if}
			</div>
			<div class="info-column">
				<div class="title">
					{itemTitle}<span style:font-weight="700" style:margin-left="5px">{item.name}</span>
				</div>
				<div class="item-footer">
					<slot name="footer" {item} />
				</div>
			</div>
		</div>
	</svelte:fragment>
</SimpleTimeLine>

<style>
	.times-column {
		width: 190px;
	}
	.item-container {
		display: flex;
	}
</style>
