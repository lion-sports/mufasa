<script lang="ts">
	import type { Shirt } from "$lib/services/shirts/shirts.service"
	import LabelAndTextfield from "../common/LabelAndTextfield.svelte"

  export let shirt: DeepPartial<Shirt> = {}
</script>

<div class="flex gap-2">
  <div>
    <LabelAndTextfield
      label="Numero"
      name="number"
      type="number"
      bind:value={shirt.number}
    ></LabelAndTextfield>
  </div>
  <div>
    <LabelAndTextfield
      label="Nome"
      name="name"
      bind:value={shirt.name}
    ></LabelAndTextfield>
  </div>
</div>

<div class="flex gap-2">
  <div class="flex flex-col gap-2">
    <label for="primary-color">Colore primario</label>
    <input type="color" name="primary-color" bind:value={shirt.primaryColor}/>
  </div>
  <div class="flex flex-col gap-2">
    <label for="secondary-color">Colore secondario</label>
    <input type="color" name="secondary-color" bind:value={shirt.secondaryColor}/>
  </div>
</div>