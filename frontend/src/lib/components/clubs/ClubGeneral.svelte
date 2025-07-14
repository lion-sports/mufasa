<script lang="ts">
	import type { Club } from "@/lib/services/clubs/clubs.service"
	import { SPORT_ICON, SPORT_TRANSLATIONS } from "@/lib/services/sport"
	import { Icon } from "@likable-hair/svelte"

  type Props = {
    club: Club
  }

  let { club }: Props = $props()

</script>

<div class="grid grid-cols-12 mt-6 gap-4">
  <div class="col-span-12">
    <div class="flex flex-col gap-2">
      <div class="ring-1 ring-[rgb(var(--global-color-background-300))] rounded p-4">
        <div class="prose">
          {@html club.bio}
        </div>
      </div>
    </div>
  </div>
</div>