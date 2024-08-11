<script lang="ts">
  export let friend: boolean = false,
    opponent: boolean = false
</script>

<div
  class="rounded-full w-[40px] h-[40px] flex justify-center items-center text-white bg-gr"
  class:bg-blue-500={friend}
  class:bg-red-500={opponent}
>
  <slot></slot>
</div>