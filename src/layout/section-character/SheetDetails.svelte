<script>
  import { Box, Field } from "../index.js";
</script>

<style>
  :global(.sheet-details) {
    grid-column: 2 / span 2;
    grid-row: 1;
  }
</style>

<Box id="details" label="Details" boxed>
  <Field id="character-name" label="Name" />
  <Field id="character-desc" label="Description" textarea rows="5" />
</Box>
