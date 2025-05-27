<script lang="ts">
	import type { Member } from "@/lib/services/members/members.service"
	import type { Team } from "@/lib/services/teams/teams.service"
	import { Icon } from "@likable-hair/svelte"
	import { DateTime } from "luxon"
	import type { Snippet } from "svelte"

  type Props = {
    teams: Team[],
    append?: Snippet<[ { team: Team } ]>
    noData?: Snippet
    onclick?: (params: { team: Team }) => void,
  }

  let { teams, append, onclick, noData }: Props = $props()
</script>

<div class="flex flex-col gap-2 @container">
  {#if teams.length > 0}
    {#each teams as team}
      <button 
        class={`flex flex-col p-4 ring-2 
          ring-[rgb(var(--global-color-background-300))]
          rounded text-left`
        }
        onclick={() => {
          if(!!onclick) onclick({ team })
        }}
      >
        <div class="flex gap-2 items-center">
          <div class="grow">
            <div class="flex flex-col @sm:flex-row gap-2 @sm:gap-4 @sm:items-center">
              <div class="h-[48px] w-[48px] rounded-full bg-[rgb(var(--global-color-primary-500))] flex justify-center items-center text-[rgb(var(--global-color-primary-foreground))]">
                <Icon name="mdi-account" --icon-size="24px"></Icon>
              </div>
              <div>
                <div class="text-lg mt-3 @sm:mt-0 font-semibold">{team.name}</div>
                <div class="mt-1 opacity-50 text-sm">
                  {#if team.teammates.length === 1}
                    1 Giocatore
                  {:else if team.teammates.length === 0}
                    Nessun giocatore
                  {:else}
                    {team.teammates.length} Giocatori
                  {/if}
                  - {DateTime.fromJSDate(new Date(team.createdAt)).setLocale('it-IT').toLocaleString(DateTime.DATETIME_SHORT)}
                </div>
              </div>
            </div>
          </div>
          <div>
            {#if !!append}
              {@render append({ team })}
            {:else}
              <Icon name="mdi-arrow-right"></Icon>
            {/if}
          </div>
        </div>
      </button>
    {/each}
  {:else}
    {#if !!noData}
      {@render noData()}
    {:else}
      <div class="flex flex-col justify-center items-center h-[132px]">
        <div class="text-sm opacity-50">Nessun team</div>
        <a
          href="/teams/new"
          class="underline text-[rgb(var(--global-color-primary-500))]"
        >Creane uno</a>
      </div>
    {/if}
  {/if}
</div>
