<script>
  import { Toggle } from "../index.js";
</script>

<style>
  div {
    position: absolute;
    z-index: 100;
    display: block;

    margin-top: 6px;
    padding: 12px;
    width: fit-content;
    height: fit-content;
    background: white;
    border: 2px solid #222;
    border-radius: 3px;
    box-shadow: 0 0 0 1px #fff, 0 0 10px #222;

    left: 50%;
    transform: translateX(-50%);

    & :global(> span) {
      display: block;
      width: 100%;
      font: italic 9px /1.5 Georgia, serif;
    }

    & :global(input[type="checkbox"] + span) {
      display: inline-block;
      width: 100%;
      font: italic 9px / 1.5 Georgia, serif;
    }

    & :global(input[type="checkbox"] + span::before) {
      margin: 3px 6px 3px 0px !important;
      width: 3px;
      height: 3px;
    }
  }
</style>

<div>
  <slot />
</div>
