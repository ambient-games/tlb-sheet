<script>
  import { Field, Toggle, Table } from "../../index.js";

  export let id = false;
  export let type = "text";
  export let checked = false;
  export let value = "";
</script>

<style>
  /* Toggle Drawer */
  :global(.sheet-tablerow > .sheet-toggle ~ div.sheet-drawer) {
    display: none;
  }

  :global(.sheet-tablerow > .sheet-toggle:checked ~ div.sheet-drawer) {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px dashed #222;
  }
</style>

{#if type === 'toggle'}
  <Toggle {id} {checked} />
{:else if type === 'drawer'}
  <div class="sheet-drawer {id ? `sheet-${id}` : null}">
    <slot />
  </div>
{:else if type === 'select'}
  <Field {id} selectbox>
    <slot />
  </Field>
{:else if type === 'button'}
  <Field button={value} {id} />
{:else if type === 'text'}
  <Field {id} {value} />
{:else}
  <slot />
{/if}
