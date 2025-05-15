<script lang="ts">
	import type { User } from '$lib/services/auth/auth.service'
	import { SimpleTable, SelectableVerticalList, Icon } from '@likable-hair/svelte'
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
>
  {#snippet elementSnippet({ element })}
    <div class="flex gap-4 items-center w-full">
      <div class="h-[32px] w-[32px] rounded-full bg-[rgb(var(--global-color-primary-500))] flex justify-center items-center text-[rgb(var(--global-color-primary-foreground))]">
        <Icon name="mdi-account" --icon-size="16px"></Icon>
      </div>
      <div class="flex flex-col grow">
        <div class="text-lg">{element.title}</div>
        <div class="opacity-50 text-sm">{element.data?.user.email}</div>
      </div>
      <div>
        <Icon name="mdi-arrow-right"></Icon>
      </div>
    </div>
  {/snippet}
</SelectableVerticalList>
