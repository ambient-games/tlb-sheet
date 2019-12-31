<script>
  import { capitalCase } from "change-case";
  import { Field, FieldGroup } from "../index.js";

  export let id;
  export let name;
  export let type;
  export let parent = false;
  export let disabled = false;
</script>

<style>
  div {
    overflow: hidden;

    & :global(button) {
      padding: 1px 0 5px !important;
    }
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
  <h3>{name}:</h3>
  <FieldGroup left id="{id}-level" label="Level" count="3" />
  <FieldGroup
    center
    id="{id}-parent"
    label="Parent"
    value={parent ? parent : ''}
    {disabled}
    count="3" />
  <FieldGroup
    right
    {id}
    label="Rat."
    button={`&{template:TLBattackRoll} {{name=@{character-name}}} {{move=${name}}} {{${type}=[[2d6+(@{${id}})+(?{${capitalCase(type)} modifier|+0})]]}} {{note=?{Note}}}`}
    count="3" />

</div>
