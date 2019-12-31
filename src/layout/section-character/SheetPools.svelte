<script>
  import { Box, Field, FieldGroup } from "../index.js";
</script>

<style>
  :global(.sheet-pools) {
    grid-column: 4 / span 3;
    grid-row: 1;
  }

  div {
    float: left;
    overflow: hidden;
    margin-left: 4px;
    width: calc((100% - 8px) / 3);
  }

  div:first-of-type {
    margin-left: 0;
  }

  h3 {
    margin-top: 6px;
  }
</style>

<Box id="pools" label="Resource Pools">
  <h3>Health</h3>
  <FieldGroup left id="health-0" label="Healthy" count="7.1" />
  <FieldGroup center id="health-1" label="Minor" count="7.1" />
  <FieldGroup center id="health-2" label="Moderate" count="7.1" />
  <FieldGroup center id="health-3" label="Serious" count="7.1" />
  <FieldGroup center id="health-4" label="Severe" count="7.1" />
  <FieldGroup right id="health-5" label="Critical" count="7" />
  <FieldGroup
    id="health_max"
    label="Capacity"
    count="7"
    style="margin-left:4px;" />
  <Field hidden id="wound-level" value="0" />
  <Field hidden id="wound-level_max" value="6" />

  <div>
    <h3>Vigor</h3>
    <FieldGroup left id="vigor" label="Current" count="2" />
    <FieldGroup right id="vigor_max" label="Capacity" count="2" />
  </div>

  <div>
    <h3>Resolve</h3>
    <FieldGroup left id="resolve" label="Current" count="2" />
    <FieldGroup right id="resolve_max" label="Capacity" count="2" />
  </div>

  <div>
    <h3>Favor</h3>
    <FieldGroup left id="favor" label="Current" count="2" />
    <FieldGroup right id="favor_max" label="Capacity" count="2" />
  </div>

</Box>
