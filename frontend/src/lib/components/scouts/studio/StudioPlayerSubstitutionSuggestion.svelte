<script lang="ts">
	import type { Scout } from '@/lib/services/scouts/scouts.service'
	import type { ScoutEventPlayer } from 'lionn-common'
	import { liberoSubstitution, playerSubstitution } from '@/lib/stores/scout/studio'
	import PlayerMarker from '../PlayerMarker.svelte'
	import TeammatesService from '@/lib/services/teammates/teammates.service'
	import { Icon } from '@likable-hair/svelte'

	interface Props {
		player: ScoutEventPlayer
		scout: Scout
	}

	let { player, scout }: Props = $props()

	async function handleSubstitutionClick(playerIn: ScoutEventPlayer) {
		let confirmed = confirm('Vuoi davverso sotituire il giocatore?')

		if (confirmed) {
			if (playerIn.role == 'libero') {
				await liberoSubstitution({
					inOrOut: 'in',
					libero: playerIn,
					player: player
				})
			} else if (player.role == 'libero') {
				await liberoSubstitution({
					inOrOut: 'out',
					libero: player,
					player: playerIn
				})
			} else {
				await playerSubstitution({
					playerIn: playerIn,
					playerOut: player
				})
			}
		}
	}

	async function handleExitLiberoClick() {
		if (!!scout.stash?.currentSetOpenLiberoSubstitution) {
			let reversedOpenSub = scout.stash.currentSetOpenLiberoSubstitution.reverse()
			for (let i = 0; i < reversedOpenSub.length; i += 1) {
				let openLiberoSub = reversedOpenSub[i]
				await liberoSubstitution({
					inOrOut: 'out',
					libero: openLiberoSub.libero,
					player: openLiberoSub.player
				})
			}
		}
	}
</script>

{#if player.role == 'middleBlocker'}
	{#each scout.players.filter((fp) => fp.role == 'libero' && fp.isOpponent == player.isOpponent) as libero}
		<button
			onclick={() => handleSubstitutionClick(libero)}
			style:--hover-background-color={player.isOpponent ? '#fca5a51f' : '#93c5fd1f'}
			class="flex text-left items-center gap-4 hover:bg-[var(--hover-background-color)] py-2 px-2 w-full rounded-sm"
		>
			<div>
				<PlayerMarker friend libero>{libero.shirtNumber}</PlayerMarker>
			</div>
			<div class="flex-grow">
				<div class="text-lg font-medium">
					{TeammatesService.getTeammateName({
						player: libero,
						teammate: libero.teammate
					})}
				</div>
				<div>{libero.role}</div>
			</div>
			<div>
				<Icon name="mdi-arrow-up"></Icon>
			</div>
		</button>
	{/each}
{/if}

{#if player.role !== 'libero'}
	{#each scout.players.filter((fp) => fp.role == player.role && fp.isOpponent == player.isOpponent && fp.id !== player.id) as suggestedPlayer}
		<button
			onclick={() => handleSubstitutionClick(suggestedPlayer)}
			style:--hover-background-color={player.isOpponent ? '#fca5a51f' : '#93c5fd1f'}
			class="flex text-left items-center gap-4 hover:bg-[var(--hover-background-color)] py-2 px-2 w-full rounded-sm"
		>
			<div>
				<PlayerMarker friend libero={suggestedPlayer.role === 'libero'}
					>{suggestedPlayer.shirtNumber}</PlayerMarker
				>
			</div>
			<div class="flex-grow">
				<div class="text-lg font-medium">
					{TeammatesService.getTeammateName({
						player: suggestedPlayer,
						teammate: suggestedPlayer.teammate
					})}
				</div>
				<div>{suggestedPlayer.role}</div>
			</div>
			<div>
				<Icon name="mdi-arrow-up"></Icon>
			</div>
		</button>
	{/each}
{/if}

{#if player.role == 'libero' && scout.stash?.currentSetOpenLiberoSubstitution?.some((os) => os.liberoId == player.id)}
	<button
		style:--hover-background-color={player.isOpponent ? '#fca5a51f' : '#93c5fd1f'}
		class="text-left hover:bg-[var(--hover-background-color)] py-2 px-2 w-full rounded-sm"
		onclick={handleExitLiberoClick}>Uscita libero</button
	>
{/if}
