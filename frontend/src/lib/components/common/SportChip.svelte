<script lang="ts">
	import type { ComponentProps } from "svelte"
	import StandardAutocomplete from "./StandardAutocomplete.svelte"
  import { SPORTS, type Sport } from 'lionn-common'
	import { Chip, Icon } from "@likable-hair/svelte"
	import { SPORT_ICON } from "@/lib/services/sport"

	type Props = {
    sport: Sport
	}

  const SPORT_TRANSLATIONS: {
		[Key in Sport]: string
	} = {
		none: 'Nessuno',
		volleyball: 'Pallavolo',
		basketball: 'Pallacanestro'
	} as const

	let { sport }: Props = $props()
</script>

<Chip
  --chip-border-radius="4px"
  --chip-font-size="12px"
  --chip-padding="4px 8px"
  --chip-line-height="12px"
  --chip-min-height="24px"
>
  <span>
    <Icon name={SPORT_ICON[sport]}></Icon>
  </span>
  {SPORT_TRANSLATIONS[sport]}
</Chip>