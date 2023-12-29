<script lang="ts">
  export let subtitle: string = "",
    marginBottom: string = "",
    marginTop: string = "",
    paddingTop: string = ""
</script>

<div
  style:font-weight="600"
  style:font-size="1.6rem"
  style:margin-top={marginTop}
  style:padding-top={paddingTop}
  style:margin-bottom={marginBottom}
>
  <slot>
    {subtitle}
  </slot>
</div>