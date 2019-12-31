<script>
  import ModeToggle from "./SheetModeToggle.svelte";
  import { Field } from "../index.js";
</script>

<style global>
  .sheet-modetoggle {
    float: right;
    position: relative;
    display: block;
    margin: 0;
    padding: 0;
    width: 125px;
    height: 35px;
    border: 2px solid #222;
    border-radius: 3px;

    &:hover {
      background-color: #eee;
    }

    & input[type="radio"] {
      opacity: 0;
      display: none;
      position: absolute;
      width: 100%;
      height: 100%;
    }

    & input[type="hidden"] {
      &[value="character"] ~ .sheet-mode-party {
        display: block;
      }

      &[value="party"] ~ .sheet-mode-character {
        display: block;
      }
    }

    &::before {
      content: "Character";
      position: absolute;
      display: block;
      box-sizing: border-box;
      padding: 5px 10px;
      width: 100%;
      height: 100%;
      font: 24px Georgia, serif;
      text-align: center;
    }
  }
</style>

<div class="sheet-modetoggle">
  <Field hidden id="sheet_mode" />
  <ModeToggle mode="character" checked />
  <ModeToggle mode="party" />
</div>
