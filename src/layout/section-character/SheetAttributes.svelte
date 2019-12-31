<script>
  import { Box, AttributeBox, DerivedBox, ExpLog } from "../index.js";
</script>

<style global>
  .sheet-attributes {
    grid-column: 1;
    grid-row: 1 / span 5;
  }

  hr {
    position: relative;
    border: none;
    border-top: 2px solid #222;
  }

  .sheet-log {
    position: relative;
    clear: both;
    margin-top: 12px;
  }
</style>

<Box id="attributes" label="Attributes">
  <AttributeBox id="iq" name="Intelligence" />
  <AttributeBox id="wl" name="Willpower" />
  <AttributeBox id="aw" name="Awareness" />
  <AttributeBox id="st" name="Strength" />
  <AttributeBox id="ag" name="Agility" />
  <AttributeBox id="sm" name="Stamina" />

  <h3>Derived Stats:</h3>
  <DerivedBox id="stun" name="Stun" button />
  <DerivedBox id="con" name="Con." button />
  <DerivedBox id="react" name="Reaction" button />
  <DerivedBox id="sp" name="Speed (SP)" />
  <hr />
  <ExpLog />

</Box>
