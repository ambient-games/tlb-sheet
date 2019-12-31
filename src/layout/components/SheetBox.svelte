<script>
  import { Toggle, Field } from "../index.js";

  export let id;
  export let label = false;
  export let boxed = false;
  export let hasToggle = false;
</script>

<style>
  div:not(.sheet-drawer) {
    position: relative;
    padding-top: 4px;
    height: fit-content;

    &.sheet-boxed {
      padding-bottom: 4px;
      border: 2px solid #222;
    }

    &::before,
    &.sheet-boxed::after {
      content: "";
      box-sizing: border-box;
      position: absolute;
      top: -2px;
      left: 0;
      display: block;
      width: 100%;
      height: 6px;
      border-top: 2px solid #222;
      border-bottom: 2px solid #222;
      background-color: white;
    }

    &.sheet-boxed::after {
      top: initial;
      bottom: -2px;
    }

    &:not(.sheet-boxed) {
      margin-top: 2px;
    }

    &:not(.sheet-boxed)::before {
      border: 2px solid #222;
    }
  }
</style>

<div class="sheet-{id} {boxed ? 'sheet-boxed' : null}">
  {#if label && hasToggle}
    <Toggle hidden {id} />
    <h2>
      {label}
      <Toggle style="arrow" {id} wrap="span" />
    </h2>
    <div class="sheet-drawer">
      <slot />
    </div>
  {:else if label && !hasToggle}
    <h2>{label}</h2>
    <slot />
  {/if}
</div>
