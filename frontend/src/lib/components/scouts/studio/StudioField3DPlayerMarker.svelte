<script lang="ts">
  import { run } from 'svelte/legacy';

  import { T } from '@threlte/core'
  import { Align, interactivity, Portal, PortalTarget, Text3DGeometry } from '@threlte/extras'
	import type { Mesh } from 'three'
  import cuid2 from '@paralleldrive/cuid2';
	import { spring } from 'svelte/motion'
	import { createEventDispatcher } from 'svelte'

  interactivity()

  let dispatch = createEventDispatcher<{
    'click': void
  }>()

  interface Props {
    dimension?: number;
    shirtNumber?: number | undefined;
    id?: string | number;
    position?: [number, number, number];
    [key: string]: any
  }

  let {
    dimension = 0.8,
    shirtNumber = undefined,
    id = cuid2.createId(),
    position = [0, 0, 0],
    ...rest
  }: Props = $props();

  let shirtNumberMesh: Mesh = $state()

  let positionX = spring(position[0])
  let positionY = spring(position[1])
  let positionZ = spring(position[2])
  run(() => {
    $positionX = position[0]
  });
  run(() => {
    $positionY = position[1]
  });
  run(() => {
    $positionZ = position[2]
  });

  let dimensionSpring = spring(dimension)
  run(() => {
    $dimensionSpring = dimension
  });
</script>

<T.Object3D
  position.x={$positionX}
  position.y={$positionY}
  position.z={$positionZ}
  {...rest}
  on:click={() => {
    dispatch('click')
  }}
>
  <PortalTarget id={`trail-${id}`} />
</T.Object3D>

<Portal id={`trail-${id}`}>
  <T.Mesh 
    castShadow 
  >
    <T.SphereGeometry args={[$dimensionSpring]}/>
    <T.MeshStandardMaterial color="#60a5fa"/>
  </T.Mesh>
  <T.Group position.z={$dimensionSpring}>
    <PortalTarget id={`top-${id}`} />
  </T.Group>
</Portal>

<Portal id={`top-${id}`}>
  <Align >
    {#snippet children({ align })}
        <T.Mesh bind:ref={shirtNumberMesh}>
        <Text3DGeometry
          text={shirtNumber?.toString() || ''}
          size={$dimensionSpring}
          depth={0.1}
          on:create={align}
        />
        <T.MeshStandardMaterial
          color="#ffffff"
          toneMapped={false}
          roughness={0.1}
        />
      </T.Mesh>
          {/snippet}
    </Align>
</Portal>