<script lang="ts">
  import { run } from 'svelte/legacy';

  import { T, useLoader, useTask, useThrelte } from '@threlte/core'
	import { OrbitControls, SoftShadows, interactivity } from '@threlte/extras'
	import StudioField3DPlayerMarker from './StudioField3DPlayerMarker.svelte'
	import type { Scout } from '@/lib/services/scouts/scouts.service'
	import type { ScoutEventPlayer, VolleyballPhase, VolleyballPlayersPosition, VolleyballScoutEventAnchor, VolleyballScoutEventPosition } from 'lionn-common'
	import { createEventDispatcher, onMount } from 'svelte'
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
  import { spring } from 'svelte/motion'
	import { PerspectiveCamera, Vector3 } from 'three'
  import CameraControls from './CameraControls'

  const gltf = useLoader(GLTFLoader).load('/models/volleyball_court.glb', {
    'transform': (gltf) => {
      gltf.scene.traverse((child) => {
        if(child.isObject3D) {
          child.receiveShadow = true
          child.castShadow = true
        }
      })
      return gltf
    }
  })

  interactivity()

  let dispatch = createEventDispatcher<{
		playerClick: {
			player: ScoutEventPlayer
		}
	}>()

  interface Props {
    fieldDimension?: number;
    lineWidth?: number;
    netHeight?: number;
    playerMarkerDimension?: number;
    scout: Scout;
    phase?: VolleyballPhase;
    selectedPlayer?: ScoutEventPlayer | undefined;
    friendSides?: 'right' | 'left';
  }

  let {
    fieldDimension = 9,
    lineWidth = 0.1,
    netHeight = 3,
    playerMarkerDimension = 0.5,
    scout,
    phase = 'serve',
    selectedPlayer = undefined,
    friendSides = 'left'
  }: Props = $props();

  let outsideColor: string = '#60a5fa',
    insideColor: string = '#fb923c',
    lineColor: string = '#64748b'
  

  let camera: PerspectiveCamera = new PerspectiveCamera(),
    cameraPositionX = spring(0),
    cameraPositionY = spring(0),
    cameraPositionZ = spring(15)

  let positionPhaseKeyMapper = {
		serve: 'playersServePositions',
		defenseSideOut: 'playersDefenseSideOutPositions',
		defenseBreak: 'playersDefenseBreakPositions'
	} as Record<typeof phase, keyof Scout['stash']>



	type ReceivePositions = {
		player: ScoutEventPlayer
		position: VolleyballScoutEventPosition
		anchor?: VolleyballScoutEventAnchor
	}[]
	let enemyReceivePositions: ReceivePositions = $state([])

	let friendsReceivePositions: ReceivePositions = $state([])

	function handlePlayerClick(player: ScoutEventPlayer | undefined) {
		if (!!player) {
			dispatch('playerClick', {
				player
			})
		}
	}

  let playersCoordinates: {
    player: ScoutEventPlayer,
    coordinates: [
      number, 
      number, 
      number
    ]
  }[] = $state([])

  function getPlayersPositionByZone(params: {
    zone: VolleyballScoutEventPosition,
    anchor?: VolleyballScoutEventAnchor
    isOpponent: boolean
  }): [number, number, number] {
    const { zone, isOpponent } = params
    
    let x = 0
    let y = 0
    let z = 0

    const zoneWidth = fieldDimension / 2
    const zoneHeight = fieldDimension / 3

    switch (zone) {
      case 1:
        if(isOpponent || friendSides == 'right') {
          x = fieldDimension - (zoneWidth / 2)
          y = (fieldDimension / 2) - (zoneHeight / 2)
        } else {
          x = -fieldDimension + (zoneWidth / 2)
          y = (fieldDimension / 2) - (2 * zoneHeight) - (zoneHeight / 2)
        }
        break
      case 2:
        if(isOpponent || friendSides == 'right') {
          x = fieldDimension - zoneWidth - (zoneWidth / 2)
          y = (fieldDimension / 2) - (zoneHeight / 2)
        } else {
          x = -fieldDimension + zoneWidth + (zoneWidth / 2)
          y = (fieldDimension / 2) - (2 * zoneHeight) - (zoneHeight / 2)
        }
        break
      case 3:
        if(isOpponent || friendSides == 'right') {
          x = fieldDimension - zoneWidth - (zoneWidth / 2)
          y = (fieldDimension / 2) - zoneHeight - (zoneHeight / 2)
        } else {
          x = -fieldDimension + zoneWidth + (zoneWidth / 2)
          y = (fieldDimension / 2) - zoneHeight - (zoneHeight / 2)
        }
        break
      case 4:
        if(isOpponent || friendSides == 'right') {
          x = fieldDimension - zoneWidth - (zoneWidth / 2)
          y = (fieldDimension / 2) - (2 * zoneHeight) - (zoneHeight / 2)
        } else {
          x = -fieldDimension + zoneWidth + (zoneWidth / 2)
          y = (fieldDimension / 2) - (zoneHeight / 2)
        }
        break
      case 5:
        if(isOpponent || friendSides == 'right') {
          x = fieldDimension - (zoneWidth / 2)
          y = (fieldDimension / 2) - (2 * zoneHeight) - (zoneHeight / 2)
        } else {
          x = -fieldDimension + (zoneWidth / 2)
          y = (fieldDimension / 2) - (zoneHeight / 2)
        }
        break
      case 6:
        if(isOpponent || friendSides == 'right') {
          x = fieldDimension - (zoneWidth / 2)
          y = (fieldDimension / 2) - zoneHeight - (zoneHeight / 2)
        } else {
          x = -fieldDimension + (zoneWidth / 2)
          y = (fieldDimension / 2) - zoneHeight - (zoneHeight / 2)
        }
        break
    }

    let anchor = Number(params.anchor),
      xUnit = zoneWidth / 3,
      yUnit = zoneHeight / 3

    if([1, 2, 3, 4, 5].includes(anchor)) {
      if((friendSides == 'left' && !isOpponent) || (friendSides == 'right' && isOpponent)) {
        x = x - (2 * xUnit )
      } else {
        x = x + (2 * xUnit )
      }
    }
    if([6, 7, 8, 9, 10].includes(anchor)) {
      if((friendSides == 'left' && !isOpponent) || (friendSides == 'right' && isOpponent)) {
        x = x - xUnit
      } else {
        x = x + xUnit
      }
    }
    if([16, 17, 18, 19, 20].includes(anchor)) {
      if((friendSides == 'left' && !isOpponent) || (friendSides == 'right' && isOpponent)) {
        x = x + xUnit
      } else {
        x = x - xUnit
      }
    }
    if([21, 22, 23, 24, 25].includes(anchor)) {
      if((friendSides == 'left' && !isOpponent) || (friendSides == 'right' && isOpponent)) {
        x = x + (2 * xUnit)
      } else {
        x = x - (2 * xUnit)
      }
    }

    if([1, 6, 11, 16, 21].includes(anchor)) {
      if((friendSides == 'left' && !isOpponent) || (friendSides == 'right' && isOpponent)) {
        y = y - (2 * yUnit )
      } else {
        y = y + (2 * yUnit )
      }
    }
    if([2, 7, 12, 17, 22].includes(anchor)) {
      if((friendSides == 'left' && !isOpponent) || (friendSides == 'right' && isOpponent)) {
        y = y - yUnit
      } else {
        y = y + yUnit
      }
    }
    if([4, 9, 14, 19, 24].includes(anchor)) {
      if((friendSides == 'left' && !isOpponent) || (friendSides == 'right' && isOpponent)) {
        y = y + yUnit
      } else {
        y = y - yUnit
      }
    }
    if([5, 10, 15, 20, 25].includes(anchor)) {
      if((friendSides == 'left' && !isOpponent) || (friendSides == 'right' && isOpponent)) {
        y = y + (2 * yUnit)
      } else {
        y = y - (2 * yUnit)
      }
    }

    return [x, y, z]
  }

  let totalFieldWidth = $derived(fieldDimension * 2)
  let fieldHeight = $derived(fieldDimension)
  let blueBackgroundDimension = $derived(fieldDimension * 5)
  let spotlightDistance = $derived(fieldDimension * 4)
  let spotlightIntensity = $derived(fieldDimension * 100)
	let friendsTotalPositions = $derived(scout.stash?.[positionPhaseKeyMapper[phase]] as
		| VolleyballPlayersPosition
		| undefined)
	let friendsPosition = $derived(friendsTotalPositions?.friends)
	let enemyTotalPositions =
		$derived(phase == 'receive'
			? scout.stash?.playersServePositions
			: phase == 'defenseBreak'
				? scout.stash?.playersDefenseSideOutPositions
				: phase == 'defenseSideOut'
					? scout.stash?.playersDefenseBreakPositions
					: undefined)
	let enemyPosition = $derived(enemyTotalPositions?.enemy)
	run(() => {
    if (!!scout.stash?.playersReceivePositions?.enemy) {
  		enemyReceivePositions = []
  		for (const [playerId, value] of Object.entries(scout.stash?.playersReceivePositions?.enemy)) {
  			let player = scout.players.find((p) => Number(p.id) === Number(playerId))
  			if (!player) continue

  			enemyReceivePositions = [
  				...enemyReceivePositions,
  				{
  					player: player as ScoutEventPlayer,
  					position: value.position,
  					anchor: value.anchor
  				}
  			]
  		}
  	} else enemyReceivePositions = []
  });
	run(() => {
    if (!!scout.stash?.playersReceivePositions?.friends) {
  		friendsReceivePositions = []
  		for (const [playerId, value] of Object.entries(scout.stash?.playersReceivePositions?.friends)) {
  			let player = scout.players.find((p) => Number(p.id) === Number(playerId))
  			if (!player) continue

  			friendsReceivePositions = [
  				...friendsReceivePositions,
  				{
  					player: player as ScoutEventPlayer,
  					position: value.position,
  					anchor: value.anchor
  				}
  			]
  		}
  	} else friendsReceivePositions = []
  });
  run(() => {
    if(!!friendsPosition || !!enemyPosition || !!friendsReceivePositions || !!enemyReceivePositions || !!phase) {
      
      if(phase === 'defenseBreak' || phase === 'defenseSideOut') {
        if(!!friendsPosition) {
          for(const [position, player] of Object.entries(friendsPosition)) {
            let exisitingPlayerIndex = playersCoordinates.findIndex(pp => pp.player.id == player.player.id)
            let coordinates = getPlayersPositionByZone({
              zone: Number(position) as VolleyballScoutEventPosition,
              isOpponent: player.player.isOpponent
            })
            if(exisitingPlayerIndex !== -1) playersCoordinates[exisitingPlayerIndex].coordinates = coordinates
            else {
              playersCoordinates = [
                ...playersCoordinates,
                {
                  player: player.player,
                  coordinates
                }
              ]
            }
          }
        }

        if(!!enemyPosition) {
          for(const [position, player] of Object.entries(enemyPosition)) {
            let exisitingPlayerIndex = playersCoordinates.findIndex(pp => pp.player.id == player.player.id)
            let coordinates = getPlayersPositionByZone({
              zone: Number(position) as VolleyballScoutEventPosition,
              isOpponent: player.player.isOpponent
            })
            if(exisitingPlayerIndex !== -1) playersCoordinates[exisitingPlayerIndex].coordinates = coordinates
            else {
              playersCoordinates = [
                ...playersCoordinates,
                {
                  player: player.player,
                  coordinates
                }
              ]
            }
          }
        }
      } else if(phase == 'serve') {
        if(!!friendsPosition) {
          for(const [position, player] of Object.entries(friendsPosition)) {
            let exisitingPlayerIndex = playersCoordinates.findIndex(pp => pp.player.id == player.player.id)
            let coordinates = getPlayersPositionByZone({
              zone: Number(position) as VolleyballScoutEventPosition,
              isOpponent: player.player.isOpponent
            })
            if(exisitingPlayerIndex !== -1) playersCoordinates[exisitingPlayerIndex].coordinates = coordinates
            else {
              playersCoordinates = [
                ...playersCoordinates,
                {
                  player: player.player,
                  coordinates
                }
              ]
            }
          }
        }

        if(!!enemyReceivePositions) {
          for(const [position, player] of Object.entries(enemyReceivePositions)) {
            let exisitingPlayerIndex = playersCoordinates.findIndex(pp => pp.player.id == player.player.id)
            let coordinates = getPlayersPositionByZone({
              zone: Number(position) as VolleyballScoutEventPosition,
              anchor: player.anchor,
              isOpponent: player.player.isOpponent
            })
            if(exisitingPlayerIndex !== -1) playersCoordinates[exisitingPlayerIndex].coordinates = coordinates
            else {
              playersCoordinates = [
                ...playersCoordinates,
                {
                  player: player.player,
                  coordinates
                }
              ]
            }
          }
        }
      } else if(phase == 'receive') {
        if(!!friendsReceivePositions) {
          for(let k = 0; k < friendsReceivePositions.length; k += 1) {
            let player = friendsReceivePositions[k]
            let exisitingPlayerIndex = playersCoordinates.findIndex(pp => pp.player.id == player.player.id)
            let coordinates = getPlayersPositionByZone({
              zone: Number(player.position) as VolleyballScoutEventPosition,
              anchor: player.anchor,
              isOpponent: player.player.isOpponent
            })
            if(exisitingPlayerIndex !== -1) playersCoordinates[exisitingPlayerIndex].coordinates = coordinates
            else {
              playersCoordinates = [
                ...playersCoordinates,
                {
                  player: player.player,
                  coordinates
                }
              ]
            }
          }
        }

        if(!!enemyPosition) {
          for(const [position, player] of Object.entries(enemyPosition)) {
            let exisitingPlayerIndex = playersCoordinates.findIndex(pp => pp.player.id == player.player.id)
            let coordinates = getPlayersPositionByZone({
              zone: Number(position) as VolleyballScoutEventPosition,
              isOpponent: player.player.isOpponent
            })
            if(exisitingPlayerIndex !== -1) playersCoordinates[exisitingPlayerIndex].coordinates = coordinates
            else {
              playersCoordinates = [
                ...playersCoordinates,
                {
                  player: player.player,
                  coordinates
                }
              ]
            }
          }
        }
      }
    }
  });
</script>

<T.SpotLight 
  position={[0, 10, spotlightDistance]} 
  intensity={spotlightIntensity}
  angle={Math.PI/8}
  castShadow
></T.SpotLight>

<T.SpotLight 
  position={[0, -10, spotlightDistance]} 
  intensity={spotlightIntensity * 0.8}
  angle={Math.PI/8}
  castShadow
></T.SpotLight>

<T.AmbientLight intensity={1.5} />

<!-- <T.PerspectiveCamera
  makeDefault
  position.x={$cameraPositionX}
  position.y={$cameraPositionY}
  position.z={$cameraPositionZ}
  on:create={({ ref }) => {
    ref.lookAt(0, 0, 0)
  }}
>
  <OrbitControls />
</T.PerspectiveCamera> -->

<T 
  is={camera}
  makeDefault
  position.x={$cameraPositionX}
  position.y={$cameraPositionY}
  position.z={$cameraPositionZ}
  on:create={({ ref }) => {
    ref.lookAt(0, 0, 0)
  }}
></T>


<!-- <T 
  is={camera}
  makeDefault
  on:create={({ ref }) => {
    ref.lookAt(0, 0, 0)
  }}
>
  <OrbitControls />
</T> -->

<SoftShadows
  focus={10}
  size={10}
  samples={40}
/>

<!-- blue field -->
<T.Mesh position.y={0}>
  <T.BoxGeometry args={[blueBackgroundDimension, blueBackgroundDimension, 1]}/>
  <T.MeshStandardMaterial color={outsideColor} />
</T.Mesh>

{#if false}
  <!-- orange field -->
  <T.Mesh position={[0, 0, 0.1]} receiveShadow>
    <T.BoxGeometry args={[totalFieldWidth, fieldHeight, 1]} />
    <T.MeshStandardMaterial color={insideColor} />
  </T.Mesh>

  <!-- upper out line -->
  <T.Mesh position={[0, fieldDimension/2, 0.1]}>
    <T.BoxGeometry args={[totalFieldWidth, lineWidth, 1.1]} />
    <T.MeshStandardMaterial color={lineColor} />
  </T.Mesh>

  <!-- lower out line -->
  <T.Mesh position={[0, -fieldDimension/2, 0.1]}>
    <T.BoxGeometry args={[totalFieldWidth, lineWidth, 1.1]} />
    <T.MeshStandardMaterial color={lineColor} />
  </T.Mesh>

  <!-- right out line -->
  <T.Mesh position={[fieldDimension, 0, 0.1]}>
    <T.BoxGeometry args={[lineWidth, fieldHeight, 1.1]} />
    <T.MeshStandardMaterial color={lineColor} />
  </T.Mesh>

  <!-- left out line -->
  <T.Mesh position={[-fieldDimension, 0, 0.1]}>
    <T.BoxGeometry args={[lineWidth, fieldHeight, 1.1]} />
    <T.MeshStandardMaterial color={lineColor} />
  </T.Mesh>

  <!-- 3 meters left out line -->
  <T.Mesh position={[fieldDimension * 0.33, 0, 0.1]}>
    <T.BoxGeometry args={[lineWidth, fieldHeight, 1.1]} />
    <T.MeshStandardMaterial color={lineColor} />
  </T.Mesh>

  <!-- 3 meters right out line -->
  <T.Mesh position={[- fieldDimension * 0.33, 0, 0.1]}>
    <T.BoxGeometry args={[lineWidth, fieldHeight, 1.1]} />
    <T.MeshStandardMaterial color={lineColor} />
  </T.Mesh>

  <!-- net -->
  <T.Mesh position={[0, 0, netHeight - 1]} >
    <T.BoxGeometry args={[lineWidth, fieldHeight * 1.1, 1 + netHeight]} />
    <T.MeshStandardMaterial color={lineColor} transparent={true} opacity={.5}/>
  </T.Mesh>
{/if}

{#await gltf then gltf}
  <T 
    is={gltf.scene}
    position={[-1, 136, 1]}
    receiveShadow
    castShadow
    scale={1}
    rotation={[90 * (Math.PI / 180), 90 * (Math.PI / 180), 0]}
  />
{/await}


{#each playersCoordinates as playerCoordinate}
  <StudioField3DPlayerMarker
    position={[playerCoordinate.coordinates[0], playerCoordinate.coordinates[1], playerMarkerDimension + 1.5]}
    dimension={!!selectedPlayer && selectedPlayer.id == playerCoordinate.player.id ? playerMarkerDimension * 1.5 : playerMarkerDimension}
    shirtNumber={playerCoordinate.player.shirtNumber}
    id={playerCoordinate.player.id}
    castShadow
    on:click={() => {
      handlePlayerClick(playerCoordinate.player)
    }}
  ></StudioField3DPlayerMarker>
{/each} 