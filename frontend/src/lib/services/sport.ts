import type { Sport } from "lionn-common";

export const SPORT_ICON: {
  [Key in Sport]: string
} = {
  none: 'mdi-cancel',
  volleyball: 'mdi-volleyball',
  basketball: 'mdi-basketball-hoop-outline'
} as const

export const SPORT_TRANSLATIONS: {
  [Key in Sport]: string
} = {
  none: 'Nessuno',
  volleyball: 'Pallavolo',
  basketball: 'Pallacanestro'
} as const