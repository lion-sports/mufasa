<script lang="ts" context="module">
  export type Header = {
    value: string;
    label: string;
    type: "boolean" | "string" | "number" | "date" | "custom";
    width?: string;
    minWidth?: string;
    data?: {
        [key: string]: any;
    };
  };
</script>

<script lang="ts">
  export let headers: Header[] = [],
    items: { [key: string]: any }[] = [],
    width: string = "auto"

  import { SimpleTable } from "@likable-hair/svelte"
</script>

<SimpleTable
  headers={headers}
  items={items}
  width={width}
  headerBorderRadius="5px"
>
  <svelte:fragment slot="appendLastColumn" let:item>
    <slot name="appendLastColumn" item={item}></slot>
  </svelte:fragment>

  <svelte:fragment slot="customColumn" let:item let:header>
    <slot name="customColumn" item={item} header={header}></slot>
  </svelte:fragment>
</SimpleTable>