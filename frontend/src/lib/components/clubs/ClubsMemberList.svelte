<script lang="ts">
	import type { Member } from "@/lib/services/members/members.service"
	import { Icon } from "@likable-hair/svelte"
	import type { Snippet } from "svelte"

  type Props = {
    members: Member[],
    selected?: Member | undefined
    append?: Snippet<[ { member: Member } ]>
    onclick?: (params: { member: Member }) => void
  }

  let { members, selected = $bindable(), append, onclick }: Props = $props()
</script>

<div class="flex flex-col gap-2 @container">
  {#each members as member}
    {@const isSelected = !!selected && member.id == selected.id}
    <button 
      class={`flex flex-col p-4 ring-2 
        ${isSelected ? 
          "ring-[rgb(var(--global-color-background-300))] bg-[rgb(var(--global-color-primary-500),.1)]" : 
          "ring-[rgb(var(--global-color-background-300))]"
        }
        rounded text-left`
      }
      onclick={() => {
        selected = member
        if(!!onclick) onclick({ member })
      }}
    >
      <div class="flex gap-2">
        <div class="grow">
          <div class="flex flex-col @sm:flex-row gap-2 @sm:gap-4 @sm:items-center">
            <div class="h-[48px] w-[48px] rounded-full bg-[rgb(var(--global-color-primary-500))] flex justify-center items-center text-[rgb(var(--global-color-primary-foreground))]">
              <Icon name="mdi-account" --icon-size="24px"></Icon>
            </div>
            <div>
              <div class="text-lg mt-3 @sm:mt-0 font-semibold">{member.fullname}</div>
              <div class="mt-1 opacity-50 text-sm">
                {#if !!member.group?.name}
                  {member.group?.name}
                {:else}
                  Nessun gruppo
                {/if}
                - 10 ottobre 2001
              </div>
            </div>
          </div>
        </div>
        <div>
          {#if !!append}
            {@render append({ member })}
          {:else}
            <Icon name="mdi-arrow-right"></Icon>
          {/if}
        </div>
      </div>
    </button>
  {/each}
</div>
