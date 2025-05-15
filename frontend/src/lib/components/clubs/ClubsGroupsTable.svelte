<script lang="ts">
	import type { Member } from "@/lib/services/members/members.service"
	import type { ComponentProps, Snippet } from "svelte"
	import GroupsTable from "../groups/GroupsTable.svelte"
	import type { Group } from "@/lib/services/groups/groups.service"

  type Props = {
    groups: Group[],
    append?: Snippet<[ { member: Member } ]>
    ondestroy?: ComponentProps<typeof GroupsTable>['ondestroy'],
    rowActionsSnippet?: ComponentProps<typeof GroupsTable>['rowActionsSnippet']
  }
  
  let { groups, append, ondestroy, rowActionsSnippet }: Props = $props()
</script>

<GroupsTable
  {groups}
  {ondestroy}
  {rowActionsSnippet}
></GroupsTable>