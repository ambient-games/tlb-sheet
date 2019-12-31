<script>
  import Logo from "./SheetLogo.svelte";
  import ModeToggle from "./SheetMode.svelte";
</script>

<style>
  div {
    position: relative;
    overflow: hidden;
    grid-column: 1 / span 6;
    grid-row: 1 / span 1;
  }
</style>

<div class="sheet-header">
  <Logo />
  <ModeToggle />
</div>
