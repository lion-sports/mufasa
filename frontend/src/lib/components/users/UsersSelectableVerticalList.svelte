<script lang="ts">
	import type { User } from '$lib/services/auth/auth.service'
	import { SimpleTable, SelectableVerticalList } from '@likable-hair/svelte'
	import type { ComponentProps } from 'svelte'

	type Props = {
		users?: User[]
		rowActions?: import('svelte').Snippet<[any]>
  } & ComponentProps<typeof SelectableVerticalList<{ user: User }>>

	let { users = [], rowActions, ...rest }: Props = $props()

  let elements: ComponentProps<typeof SelectableVerticalList<{ user: User }>>['elements'] = $derived(users.map((e) => {
    return {
      name: e.id,
      title: e.fullname,
      data: {
        user: e
      }
    }
  }))
</script>

<SelectableVerticalList
  {elements}
  {...rest}
></SelectableVerticalList>
