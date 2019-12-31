<script>
  export let mode;
  export let checked = false;
</script>

<style>

</style>

<input
  class="sheet-mode-{mode}"
  type="radio"
  name="attr_sheet_mode"
  value={mode}
  checked={checked ? 'checked' : null}
  disabled />
