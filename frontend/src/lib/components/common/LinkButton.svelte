<script lang="ts">
	export let marginTop: number = 5,
		fontSize: string | undefined = undefined,
    disabled: boolean = false;
</script>

<div
	style:color="rgb(var(--gloabl-color-primary-500))"
	style:cursor="pointer"
	style:width="fit-content"
  style:margin-top={marginTop + 'px'}
	style:font-size={fontSize}
  style:pointer-events={disabled ? "none" : "initial"}
	on:click
  on:keypress
>
	<slot />
</div>
