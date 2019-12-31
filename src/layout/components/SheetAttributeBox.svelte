<script>
  import { FieldGroup } from "../index.js";

  export let id;
  export let name;
</script>

<style>
  div {
    overflow: hidden;
  }

  h3 {
    margin-top: 6px;
    font: bold 9px / 1.5 Georgia, serif;
    text-transform: uppercase;
    color: #222;
  }

  h3::first-letter {
    font-size: 12px;
  }
</style>

<div>
  <h3>{name} ({id.toUpperCase()}):</h3>
  <FieldGroup left {id} label="Level" count="2" />
  <FieldGroup
    right
    id="{id}_max"
    label="Chance"
    button={`&{template:TLBskillRoll} {{name=@{character-name}}} {{skill=${name}}} {{roll=[[d100cs<3cf>99</FieldGroup>]]}} {{chance=@{${id}|max}}} {{note=?{Note}}}`}
    count="2" />
</div>
