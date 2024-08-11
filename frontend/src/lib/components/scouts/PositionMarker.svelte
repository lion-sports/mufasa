<script lang="ts">
  export let friend: boolean = false,
    opponent: boolean = false
</script>

<div
  class="rounded-md w-[56px] h-[56px] flex justify-center items-center text-white bg-gr"
  class:bg-gray-500={friend || opponent}
>
  <slot></slot>
</div>