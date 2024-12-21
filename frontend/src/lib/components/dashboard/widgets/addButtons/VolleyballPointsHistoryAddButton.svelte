<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
</script>

<div class="flex flex-col gap-2">
	<Icon name="mdi-scoreboard" --icon-size="30px" />
	<slot name="label" />
	<div class="text-sm font-light">Volleyball points history between sets.</div>
</div>

