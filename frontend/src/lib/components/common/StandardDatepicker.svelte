<script lang="ts">
  import { DateTime } from "luxon";
  import { DatePickerTextField } from "@likable-hair/svelte";

  export let value: Date | undefined = undefined,
    clearable: boolean = true
</script>

<DatePickerTextField
  selectedDate={value}
  --simple-text-field-width="fit-content"
></DatePickerTextField>