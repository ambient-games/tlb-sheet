<script>
  export let id;
  export let label;
  export let value = "";
  export let button = false;
  export let count = "1";
  export let style = "";

  export let left = false;
  export let center = false;
  export let right = false;

  export let disabled = false;
</script>

<style>
  label {
    box-sizing: border-box;
    position: relative;
    float: left;
    margin: 0;
    padding: 0;
    width: 100%;
    height: fit-content;
    background: white;
    border: 2px solid #222;
    border-radius: 3px;

    &.sheet-left {
      border-radius: 3px 0 0 3px;
      border-right: 1px solid #222;
    }

    &.sheet-center {
      border-radius: 0px;
      border-left: none;
      border-right: 1px solid #222;
    }

    &.sheet-right {
      border-radius: 0 3px 3px 0;
      border-left: 0;
    }
  }

  input[type="text"] {
    display: block;
    margin: 0px;
    padding: 5px 5px;
    border: 0;
    border-radius: 0;
    width: 100%;
    height: 35px;
    resize: none;
    font: 20px Courier, monospace;
    text-align: center;
    color: #444;
    background: transparent;
  }

  button,
  span {
    position: relative;
    display: block;
    height: 10px;
    width: fill-available;
    margin: 0 !important;
    padding: 5px !important;
    border: 0;
    border-top: 1px dashed #222;
    border-radius: 0;
    font: italic 9px / 1.5 Georgia, serif !important;
    text-align: center;
    background: transparent;
  }

  button {
    padding-top: 1px !important;
    height: 14px;
  }
</style>

<label
  class:sheet-left={left}
  class:sheet-center={center}
  class:sheet-right={right}
  style="width:{100 / count}%; {style}">
  <input
    type="text"
    name="attr_{id}"
    {value}
    {disabled}
    autocomplete="new-password" />
  {#if button}
    <button type="roll" name="roll_{id}" value={button}>{label}</button>
  {:else}
    <span>{label}</span>
  {/if}
</label>
