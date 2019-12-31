<script>
  export let id;
  export let label = false;
  export let tooltip = false;
  export let value = "";
  export let hidden = false;
  export let option = false;
  export let textarea = false;
  export let selectbox = false;
  export let button = false;
  export let rows = "3";
  export let style = null;
</script>

<style>
  label {
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
    height: fit-content;
    background: transparent;
    border-bottom: 1px solid #222;
  }

  label:last-child {
    border-bottom: none;
  }

  input[type="text"],
  textarea {
    box-sizing: border-box;
    display: block;
    margin: 0px;
    padding: 20px 5px 5px;
    border: 0;
    border-radius: 0;
    width: 100%;
    height: auto;
    min-height: 45px;
    resize: vertical;
    font: 12px / 1.5 Courier, monospace;
    text-align: left;
    color: #444;
    background: transparent;
  }

  select {
    background-color: transparent;
  }

  textarea {
    min-height: 80px;
  }

  label > button {
    padding-top: 20px !important;
    width: 100%;

    &::after {
      padding: 0;
      vertical-align: top;
    }
  }

  span {
    position: absolute;
    display: block;
    height: 10px;
    width: fill-available;
    margin: 0 !important;
    padding: 5px !important;
    border: 0;
    border-radius: 0;
    font: italic 9px / 1.5 Georgia, serif !important;
    text-align: left;
    background: transparent;

    &[title]::after {
      content: "i";
      display: inlie-block;
      margin-left: 3px;
      font-family: "Pictos";
      font-style: normal;
    }
  }
</style>

{#if hidden}
  <input
    type="hidden"
    name="attr_{id}"
    class={option ? `sheet-option` : null}
    {value} />
{:else if label && button}
  <button type="roll" name="roll_{id}" value={button}>{label}</button>
{:else if label}
  <label>
    <span title={tooltip ? tooltip : null}>{label}</span>
    {#if textarea}
      <textarea name="attr_{id}" {value} {rows} {style} />
    {:else if selectbox}
      <select name="attr_{id}" {value} {style}>
        <slot />
      </select>
    {:else}
      <input
        type="text"
        name="attr_{id}"
        {value}
        autocomplete="new-password"
        {style} />
    {/if}
  </label>
{:else}
  {#if textarea}
    <textarea name="attr_{id}" {value} {rows} {style} />
  {:else if selectbox}
    <select name="attr_{id}" {value} {style}>
      <slot />
    </select>
  {:else if button}
    <button type="roll" name="roll_{id}" value={button} />
  {:else}
    <input
      type="text"
      name="attr_{id}"
      {value}
      autocomplete="new-password"
      {style} />
  {/if}
{/if}
