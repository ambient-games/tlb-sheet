<script>
  export let id;
  export let name;
  export let value = "";
  export let button = false;
  export let count = "1";
</script>

<style>
  label {
    box-sizing: border-box;
    position: relative;
    /* float: left; */
    margin: 0;
    padding: 0;
    padding-top: 6px;
    width: 100%;
    height: fit-content;
    overflow: hidden;
  }

  input[type="text"] {
    float: right;
    width: 60px;
    height: 20px;
    border: 1.5px solid #222;
    border-radius: 3px;
    background: white;
    text-align: center;
    font-family: Courier, monospace;
  }

  button,
  span {
    display: block;
    float: left;
    height: 10px;
    width: fit-content;
    margin: 0 !important;
    padding: 5px 0 !important;
    border: 0;
    border-radius: 0;
    font: bold 9px / 1.5 Georgia, serif !important;
    text-align: left;
    background: transparent;
  }

  button {
    padding-top: 1px !important;
    height: 14px;
  }
</style>

<label style="width:{100 / count}%">
  {#if button}
    <button
      type="roll"
      name="roll_{id}"
      value={`&{template:TLBskillRoll} {{name=@{character-name}}} {{skill=${name}}} {{roll=[[d100cs<3cf>99]]}} {{chance=@{${id}}}} {{note=?{Note}}}`}>
      {name}
    </button>
  {:else}
    <span>{name}</span>
  {/if}
  <input type="text" name="attr_{id}" {value} autocomplete="false" />
</label>
