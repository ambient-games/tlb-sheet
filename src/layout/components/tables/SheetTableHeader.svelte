<script>
  export let items = [];
</script>

<style>
  .sheet-tableheader {
    display: flex;
    flex-wrap: nowrap;
    height: 25px;
    vertical-align: bottom;
    border-bottom: 1px solid #222;
    background: #ccc;
  }

  span {
    display: block;
    align-self: flex-end;
    box-sizing: border-box;
    margin-bottom: 3px;
    width: fit-content;
    min-width: 20px;
    font: italic 9px /1.2 Georgia, serif;
    text-align: center;
    color: #222;
    border: none !important;

    &[title]::after {
      content: "i";
      display: inlie-block;
      margin-left: 3px;
      font-family: "Pictos";
      font-style: normal;
    }
  }

  .sheet-eye {
    margin-bottom: 1px;
    width: 20px !important;
    font-size: 12px;
    font-style: normal;
  }

  .sheet-eye::after {
    content: "E";
    font-family: "Pictos" !important;
  }

  span:nth-child(2) {
    text-align: left;
    text-indent: 5px;
  }
</style>

<div class="sheet-tableheader">
  {#each items as item}
    {#if item.type === 'toggle'}
      <span class="sheet-eye" />
    {:else}
      <span title={item.tooltip ? item.tooltip : null}>{item.label}</span>
    {/if}
  {/each}
</div>
