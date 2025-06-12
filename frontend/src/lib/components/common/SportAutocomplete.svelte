<script lang="ts">
	import type { ComponentProps } from "svelte"
	import StandardAutocomplete from "./StandardAutocomplete.svelte"
  import { SPORTS, type Sport } from 'lionn-common'
	import { Icon } from "@likable-hair/svelte"
	import { SPORT_ICON, SPORT_TRANSLATIONS } from "@/lib/services/sport"

	type Props = {
    sport?: Sport | undefined
		values?: ComponentProps<typeof StandardAutocomplete>['values']
		onchange?: ComponentProps<typeof StandardAutocomplete>['onchange']
	} & ComponentProps<typeof StandardAutocomplete>

  

  function handleChange(...e: Parameters<NonNullable<Props['onchange']>>) {
    sport = e[0].detail.selection.length == 0 ? undefined : e[0].detail.selection[0].value as Sport

    if(!!onchange) {
      onchange(...e)
    }
  }

	let { values = $bindable([]), onchange, sport = $bindable(), ...rest }: Props = $props()

  $effect(() => {
    if(sport !== undefined && (values.length === 0 || values[0].value !== sport)) {
      values = [
        { value: sport, label: sport }
      ]
    }
  })
</script>

<StandardAutocomplete
	items={SPORTS.map((v) => {
		return {
			value: v,
			label: v
		}
	})}
	bind:values
	onchange={handleChange}
>
  {#snippet chipLabelSnippet(params)}
		{#if rest.chipLabelSnippet}
			{@render rest.chipLabelSnippet(params)}
		{:else}
			<span class="mr-2">
				<Icon name={SPORT_ICON[params.selection.value as Sport]}></Icon>
			</span>
			{SPORT_TRANSLATIONS[params.selection.value as Sport]}
		{/if}
	{/snippet}
	{#snippet itemLabel(params)}
		{#if rest.itemLabel}
			{@render rest.itemLabel(params)}
		{:else}
			<span class="mr-2">
				<Icon name={SPORT_ICON[params.item.value as Sport]}></Icon>
			</span>
			{SPORT_TRANSLATIONS[params.item.value as Sport]}
		{/if}
	{/snippet}
</StandardAutocomplete>
