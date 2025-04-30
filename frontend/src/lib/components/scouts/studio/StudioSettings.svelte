<script lang="ts">
	import type {
		Scout
	} from '@/lib/services/scouts/scouts.service'
	import LabelAndCheckbox from '../../common/LabelAndCheckbox.svelte'
	import type { POSSIBLE_AUTO_PAHSE_EVENTS, POSSIBLE_AUTO_POINT_ENEMY_EVENTS, POSSIBLE_AUTO_POINT_FRIENDS_EVENTS } from 'lionn-common'
	import ScoutsService from '@/lib/services/scouts/scouts.service'


	export let scout: Scout

	function initAutoPointObject() {
		if (!scout.scoutInfo.settings) scout.scoutInfo.settings = {}
		if (!!scout.scoutInfo.settings && !scout.scoutInfo.settings.automations)
			scout.scoutInfo.settings.automations = {}
		if (
			!!scout.scoutInfo.settings &&
			!!scout.scoutInfo.settings.automations &&
			!scout.scoutInfo.settings.automations.autoPoint
		)
			scout.scoutInfo.settings.automations.autoPoint = {
				friends: [],
				enemy: []
			}

    if(
      !!scout.scoutInfo.settings &&
			!!scout.scoutInfo.settings.automations &&
			!!scout.scoutInfo.settings.automations.autoPoint &&
      !scout.scoutInfo.settings.automations?.autoPoint?.friends
    ) scout.scoutInfo.settings.automations.autoPoint.friends = []

    if(
      !!scout.scoutInfo.settings &&
			!!scout.scoutInfo.settings.automations &&
			!!scout.scoutInfo.settings.automations.autoPoint &&
      !scout.scoutInfo.settings.automations?.autoPoint?.enemy
    ) scout.scoutInfo.settings.automations.autoPoint.enemy = []
	}

  function initAutoPhaseObject() {
		if (!scout.scoutInfo.settings) scout.scoutInfo.settings = {}
		if (!!scout.scoutInfo.settings && !scout.scoutInfo.settings.automations)
			scout.scoutInfo.settings.automations = {}
		if (
			!!scout.scoutInfo.settings &&
			!!scout.scoutInfo.settings.automations &&
			!scout.scoutInfo.settings.automations.autoPhase
		)
			scout.scoutInfo.settings.automations.autoPhase= {
				friends: [],
				enemy: []
			}

    if(
      !!scout.scoutInfo.settings &&
			!!scout.scoutInfo.settings.automations &&
			!!scout.scoutInfo.settings.automations.autoPhase &&
      !scout.scoutInfo.settings.automations?.autoPhase?.friends
    ) scout.scoutInfo.settings.automations.autoPhase.friends = []

    if(
      !!scout.scoutInfo.settings &&
			!!scout.scoutInfo.settings.automations &&
			!!scout.scoutInfo.settings.automations.autoPhase &&
      !scout.scoutInfo.settings.automations?.autoPhase?.enemy
    ) scout.scoutInfo.settings.automations.autoPhase.enemy = []
	}

	async function handleUpdateAutopointFriendsAutomation(
		value: (typeof POSSIBLE_AUTO_POINT_FRIENDS_EVENTS)[number],
		selected: boolean
	) {
    initAutoPointObject()

		if (
			!!scout.scoutInfo.settings?.automations?.autoPoint?.friends &&
			!scout.scoutInfo.settings?.automations?.autoPoint?.friends.includes(value) &&
			selected
		) {
			scout.scoutInfo.settings.automations.autoPoint.friends = [
				...scout.scoutInfo.settings.automations.autoPoint.friends,
				value
			]
		} else if (
			!!scout.scoutInfo.settings?.automations?.autoPoint?.friends &&
			scout.scoutInfo.settings?.automations?.autoPoint?.friends.includes(value) &&
			!selected
		) {
			scout.scoutInfo.settings.automations.autoPoint.friends =
				scout.scoutInfo.settings.automations.autoPoint.friends.filter((e) => {
					return e !== value
				})
		}

		let service = new ScoutsService({ fetch })
		await service.updateSetting({
			id: scout.id,
			settings: {
				automations: {
					autoPoint: {
						friends: scout.scoutInfo.settings?.automations?.autoPoint?.friends
					}
				}
			}
		})
	}

	async function handleUpdateAutopointEnemyAutomation(
		value: (typeof POSSIBLE_AUTO_POINT_ENEMY_EVENTS)[number],
		selected: boolean
	) {
    initAutoPointObject()

		if (
			!!scout.scoutInfo.settings?.automations?.autoPoint?.enemy &&
			!scout.scoutInfo.settings?.automations?.autoPoint?.enemy.includes(value) &&
			selected
		) {
			scout.scoutInfo.settings.automations.autoPoint.enemy = [
				...scout.scoutInfo.settings.automations.autoPoint.enemy,
				value
			]
		} else if (
			!!scout.scoutInfo.settings?.automations?.autoPoint?.enemy &&
			scout.scoutInfo.settings?.automations?.autoPoint?.enemy.includes(value) &&
			!selected
		) {
			scout.scoutInfo.settings.automations.autoPoint.enemy =
				scout.scoutInfo.settings.automations.autoPoint.enemy.filter((e) => {
					return e !== value
				})
		}

		let service = new ScoutsService({ fetch })
		await service.updateSetting({
			id: scout.id,
			settings: {
				automations: {
					autoPoint: {
						enemy: scout.scoutInfo.settings?.automations?.autoPoint?.enemy
					}
				}
			}
		})
	}

  async function handleUpdateAutoPhaseAutomation(
		value: (typeof POSSIBLE_AUTO_PAHSE_EVENTS)[number],
		selected: boolean,
    friendsOrEnemy: 'friends' | 'enemy'
	) {
    initAutoPhaseObject()

		if (
			!!scout.scoutInfo.settings?.automations?.autoPhase?.[friendsOrEnemy] &&
			!scout.scoutInfo.settings?.automations?.autoPhase[friendsOrEnemy]?.includes(value) &&
			selected
		) {
			scout.scoutInfo.settings.automations.autoPhase[friendsOrEnemy] = [
				...(scout.scoutInfo.settings.automations.autoPhase![friendsOrEnemy] || []),
				value
			]
		} else if (
			!!scout.scoutInfo.settings?.automations?.autoPhase?.[friendsOrEnemy] &&
			scout.scoutInfo.settings?.automations?.autoPhase[friendsOrEnemy]?.includes(value) &&
			!selected
		) {
			scout.scoutInfo.settings.automations.autoPhase[friendsOrEnemy] =
				scout.scoutInfo.settings.automations.autoPhase[friendsOrEnemy]?.filter((e) => {
					return e !== value
				})
		}

		let service = new ScoutsService({ fetch })
		await service.updateSetting({
			id: scout.id,
			settings: {
				automations: {
					autoPhase: {
						[friendsOrEnemy]: scout.scoutInfo.settings?.automations?.autoPhase?.[friendsOrEnemy]
					}
				}
			}
		})
	}
</script>

<div class="flex flex-col gap-2">
	<div>
		<div class="font-bold text-2xl">Automazioni</div>
		<div class="mt-1">Quello che posso automatizzare al susseguirsi di un evento specifico.</div>
	</div>
	<div>
		<div class="text-lg">Punto automatico</div>
		<div>Specifica quando voglio che venga assegnato il punto automatico.</div>
		<div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
			<div class="flex flex-col gap-2">
				<div>Amici</div>
				<div>
					<LabelAndCheckbox
						label="Muro punto"
						id="automations-block-point"
						value={scout.scoutInfo.settings?.automations?.autoPoint?.friends?.includes(
							'blockPoint'
						)}
						on:change={(e) => {
							handleUpdateAutopointFriendsAutomation(
								'blockPoint',
								// @ts-ignore
								e.target?.checked
							)
						}}
					></LabelAndCheckbox>
				</div>
				<div>
					<LabelAndCheckbox
						label="Servizio punto"
						id="automations-serve-point"
						value={scout.scoutInfo.settings?.automations?.autoPoint?.friends?.includes(
							'servePoint'
						)}
						on:change={(e) => {
							handleUpdateAutopointFriendsAutomation(
								'servePoint',
								// @ts-ignore
								e.target?.checked
							)
						}}
					></LabelAndCheckbox>
				</div>
				<div>
					<LabelAndCheckbox
						label="Attacco punto"
						id="automations-spike-point"
						value={scout.scoutInfo.settings?.automations?.autoPoint?.friends?.includes(
							'spikePoint'
						)}
						on:change={(e) => {
							handleUpdateAutopointFriendsAutomation(
								'spikePoint',
								// @ts-ignore
								e.target?.checked
							)
						}}
					></LabelAndCheckbox>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				<div>Avversari</div>
				<div>
					<LabelAndCheckbox
						label="Mani out"
						id="automations-block-hands-out"
						value={scout.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes(
							'blockHandsOut'
						)}
						on:change={(e) => {
							handleUpdateAutopointEnemyAutomation(
								'blockHandsOut',
								// @ts-ignore
								e.target?.checked
							)
						}}
					></LabelAndCheckbox>
				</div>
				<div>
					<LabelAndCheckbox
						label="Servizio errore"
						id="automations-serve-error"
						value={scout.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('serveError')}
						on:change={(e) => {
							handleUpdateAutopointEnemyAutomation(
								'serveError',
								// @ts-ignore
								e.target?.checked
							)
						}}
					></LabelAndCheckbox>
				</div>
				<div>
					<LabelAndCheckbox
						label="Attacco errore"
						id="automations-spike-error"
						value={scout.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('spikeError')}
						on:change={(e) => {
							handleUpdateAutopointEnemyAutomation(
								'spikeError',
								// @ts-ignore
								e.target?.checked
							)
						}}
					></LabelAndCheckbox>
				</div>
				<div>
					<LabelAndCheckbox
						label="Ricezione errore"
						id="automations-receive-error"
						value={scout.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes(
							'receiveError'
						)}
						on:change={(e) => {
							handleUpdateAutopointEnemyAutomation(
								'receiveError',
								// @ts-ignore
								e.target?.checked
							)
						}}
					></LabelAndCheckbox>
				</div>
			</div>
		</div>
    <div class="text-lg mt-4">Fase automatica</div>
		<div>Specifica quando voglio che venga spostata la fase in automatico.</div>
		<div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
			<div class="flex flex-col gap-2">
        <div>Amici</div>
				<div>
					<LabelAndCheckbox
						label="Servizio"
						id="automations-autophase-serve-received"
						value={scout.scoutInfo.settings?.automations?.autoPhase?.friends?.includes(
							'serveReceived'
						)}
						on:change={(e) => {
							handleUpdateAutoPhaseAutomation(
								'serveReceived',
								// @ts-ignore
								e.target?.checked,
                'friends'
							)
						}}
					></LabelAndCheckbox>
				</div>
        <div>
					<LabelAndCheckbox
						label="Ricezione"
						id="automations-autophase-receive"
						value={scout.scoutInfo.settings?.automations?.autoPhase?.friends?.includes(
							'receive'
						)}
						on:change={(e) => {
							handleUpdateAutoPhaseAutomation(
								'receive',
								// @ts-ignore
								e.target?.checked,
                'friends'
							)
						}}
					></LabelAndCheckbox>
				</div>
      </div>
      <div class="flex flex-col gap-2">
        <div>Avversari</div>
				<div>
					<LabelAndCheckbox
						label="Servizio"
						id="automations-autophase-serve-received"
						value={scout.scoutInfo.settings?.automations?.autoPhase?.enemy?.includes(
							'serveReceived'
						)}
						on:change={(e) => {
							handleUpdateAutoPhaseAutomation(
								'serveReceived',
								// @ts-ignore
								e.target?.checked,
                'enemy'
							)
						}}
					></LabelAndCheckbox>
				</div>
        <div>
					<LabelAndCheckbox
						label="Ricezione"
						id="automations-autophase-receive"
						value={scout.scoutInfo.settings?.automations?.autoPhase?.enemy?.includes(
							'receive'
						)}
						on:change={(e) => {
							handleUpdateAutoPhaseAutomation(
								'receive',
								// @ts-ignore
								e.target?.checked,
                'enemy'
							)
						}}
					></LabelAndCheckbox>
				</div>
      </div>
    </div>
	</div>
</div>
