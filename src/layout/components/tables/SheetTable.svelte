<script>
  import { TableHeader } from "../../index.js";

  export let id;
  export let repeat = false;
  export let subtable = false;
  export let header = false;
</script>

<style>
  :global(.sheet-tablerow) {
    display: flex;
    flex-wrap: wrap;

    & input[type="checkbox"],
    & input[type="checkbox"] + span {
      width: 20px;
      height: 28px;
      text-align: center;
    }
    & input[type="checkbox"] {
      margin-right: -20px;
    }
    & input[type="checkbox"] + span::before {
      margin: 9px auto;
    }

    & input[type="text"][class]:nth-child(3) {
      text-align: left;
    }

    & input[type="text"][class],
    & select {
      padding: 3px 5px;
      min-height: 28px;
      text-align: center;
    }

    & > select {
      margin: 0px !important;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      font: 9px Courier, monospace !important;
      color: #444;
      text-align: left;
      background: transparent;
    }

    & :global(.sheet-drawer) {
      width: 100%;
      border-bottom: 1px solid #222;

      & :global(ul) {
        margin: 0;
        padding: 0;
        width: 100%;
        border-top: 1px dashed #222;

        & > li {
          display: inline-block;
          list-style: none;
        }

        & > li.sheet-id {
          float: right;
          width: 75px;
          vertical-align: middle;

          font: normal 9px / 1.5 Courier, monospace;
          color: #aaa;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          &:hover {
            color: black;
          }

          & span {
            user-select: all;
          }

          &::before {
            content: "k";
            display: inline-block;
            font-family: "Pictos Three";
            font-style: normal;
            font-size: 14px;
            vertical-align: middle;
            line-height: 18px;
          }
        }
      }

      & > textarea {
        padding: 5px;
      }
    }
  }

  /* Roll20 Generated Content */
  /* Repeating Fields */
  :global(.repitem) {
    border-bottom: 1px solid #222;
  }

  :global(.repcontrol .btn) {
    padding: 3px 6px;
    background: transparent;
    color: #222;
    text-shadow: none;
    box-shadow: none;
    border: none;
  }
</style>

<div class="sheet-table {id ? `sheet-${id}table` : null}">
  {#if header}
    <TableHeader items={header} />
  {/if}

  {#if repeat}
    <fieldset class="repeating_{id}">
      <div
        class={subtable ? 'sheet-tablerow sheet-subtable' : 'sheet-tablerow'}>
        <slot />
      </div>
    </fieldset>
  {:else}
    <div class={subtable ? 'sheet-tablerow sheet-subtable' : 'sheet-tablerow'}>
      <slot />
    </div>
  {/if}
</div>
