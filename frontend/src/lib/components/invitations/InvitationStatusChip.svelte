<script lang="ts">
	import type { ComponentProps } from "svelte"
	import { Chip } from "@likable-hair/svelte"
	import type { Invitation } from "@/lib/services/invitations/invitations.service"

	type Props = {
    status: Invitation['status']
  } & ComponentProps<typeof Chip>

  const STATUS_TRANSLATIONS: {
		[Key in Invitation['status']]: string
	} = {
		accepted: 'Accettato',
    rejected: 'Rifiutato',
    pending: 'In attesa',
    discarded: 'Scartato'
	} as const


  const STATUS_COLORS: {
    [Key in Invitation['status']]: {
      backgroundColor: string,
      foregroundColor: string
    }
  } = {
    accepted: {
      backgroundColor: '#DFF2BF',
      foregroundColor: '#4F8A10'
    },
    rejected: {
      backgroundColor: '#FFBABA',
      foregroundColor: '#D8000C'
    },
    pending: {
      backgroundColor: '#FEEFB3',
      foregroundColor: '#9F6000'
    },
    discarded: {
      backgroundColor: '#E0E0E0',
      foregroundColor: '#606060'
    }
  }

	let { status }: Props = $props()
</script>

<Chip
  --chip-border-radius="4px"
  --chip-font-size="12px"
  --chip-padding="4px 8px"
  --chip-line-height="12px"
  --chip-min-height="24px"
  --chip-background-color={STATUS_COLORS[status].backgroundColor}
  --chip-hover-background-color={STATUS_COLORS[status].backgroundColor}
  --chip-color={STATUS_COLORS[status].foregroundColor}
  --chip-hover-color={STATUS_COLORS[status].foregroundColor}
>
  {STATUS_TRANSLATIONS[status]}
</Chip>