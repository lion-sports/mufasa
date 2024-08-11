<script lang="ts" context="module">
	export type Item = {
		value: string
		label?: string
		data?: any
	};
</script>

<script lang="ts">
	export let items: Item[],
		width: string = '100%',
		maxWidth: string = '100%',
    height: string | undefined = "44px",
		multiple: boolean = false,
		placeholder: string | undefined = undefined,
		values: Item[]

	import { Autocomplete } from '@likable-hair/svelte'
</script>

<Autocomplete
	bind:values
	{width}
	{maxWidth}
	{multiple}
	{placeholder}
	{items}
  --autocomplete-min-height="44px"
  {height}
	on:change
>
  <svelte:fragment slot="item-label" let:item>
    <slot name="item-label" {item}>
      <div class="label-container">
        <div>{item.label || ''}</div>
      </div>
    </slot>
  </svelte:fragment>
</Autocomplete>
