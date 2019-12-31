<script>
  import { Box, ManeuverBox } from "../index.js";
</script>

<style>
  :global(.sheet-maneuvers) {
    grid-column: 6;
    grid-row: 2 / span 5;
  }

  hr {
    position: relative;
    top: 12px;
    border: none;
    border-top: 2px solid #222;
  }
</style>

<Box id="maneuvers" label="Maneuvers">
  <ManeuverBox id="swing" name="Swing" type="attack" />
  <ManeuverBox id="thrust" name="Thrust" type="attack" />
  <ManeuverBox id="throw" name="Throw" type="attack" />
  <ManeuverBox id="shoot" name="Shoot" type="attack" />
  <ManeuverBox id="parry" name="Parry" type="defense" />
  <ManeuverBox id="block" name="Block" type="defense" />
  <ManeuverBox id="evade" name="Evade" type="defense" parent="SP" disabled />
</Box>
