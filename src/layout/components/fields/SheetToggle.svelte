<script>
  export let id;
  export let style = false;
  export let label = "";
  export let hidden = false;
  export let checked = null;
  export let value = false;
  export let wrap = false;
</script>

<style global>
  input[type="checkbox"] {
    display: inline-block;
    margin-right: -14px;
    width: 10px;
    height: 10px;
    opacity: 0;

    & + span::before {
      display: inline-block;
      vertical-align: middle;
      content: "";
      width: 6px;
      height: 6px;
      margin-right: 5px;
      border: 2px solid #222;
      border-radius: 100%;
    }

    &:checked + span::before {
      background: #222;
    }
  }

  input[type="checkbox"].sheet-arrow {
    margin-left: 3px;

    & + span::before {
      content: none;
    }

    & + span::after {
      content: "▼";
      display: inline-block;
      padding: 3px;
      width: 10px;
      height: 10px;
    }

    &:checked + span::after {
      content: "►";
    }
  }

  input[type="checkbox"].sheet-cog {
    margin-left: 3px;

    & + span::before {
      content: none;
    }

    & + span::after {
      content: "y";
      display: inline-block;
      padding: 3px;
      width: 10px;
      height: 10px;
      font-family: "Pictos";
      font-weight: normal;
      text-transform: none;
    }

    &:checked + span::after {
      content: "y";
      color: firebrick;
    }
  }

  input[type="checkbox"].sheet-small {
    height: 15px !important;

    & + span {
      font: italic 9px / 1.5 Georgia, serif;
      /* text-indent: 12px; */
      /* text-transform: uppercase; */
    }

    & + span::before {
      margin: 3px 6px 3px 0px !important;
      width: 3px;
      height: 3px;
    }
  }
</style>

{#if hidden}
  <input
    class="sheet-toggle "
    type="hidden"
    name="attr_{id}-toggle"
    value={checked ? 'checked' : null} />
{:else if wrap === 'li'}
  <li>
    <input
      class="sheet-toggle {style ? `sheet-${style}` : ''}"
      type="checkbox"
      name="attr_{id}-toggle"
      value={value ? value : 'checked'}
      {checked} />
    <span>{label}</span>
  </li>
{:else if wrap === 'div'}
  <div>
    <input
      class="sheet-toggle {style ? `sheet-${style}` : ''}"
      type="checkbox"
      name="attr_{id}-toggle"
      value={value ? value : 'checked'}
      {checked} />
    <span>{label}</span>
  </div>
{:else if wrap === 'span'}
  <span>
    <input
      class="sheet-toggle {style ? `sheet-${style}` : ''}"
      type="checkbox"
      name="attr_{id}-toggle"
      value={value ? value : 'checked'}
      {checked} />
    <span>{label}</span>
  </span>
{:else}
  <input
    class="sheet-toggle"
    type="checkbox"
    name="attr_{id}-toggle"
    value={value ? value : 'checked'}
    {checked} />
  <span>{label}</span>
{/if}
