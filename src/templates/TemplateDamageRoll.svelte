<script>
  import Box from "./TemplateBox.svelte";
</script>

<style global>

</style>

<Box id="damage">
  <div class="sheet-rollheader">
    <p class="sheet-rollprelude">
      <em>{`{{name}}`}</em>
      hits {`{{#weapon}}`} with their
      <em>{`{{weapon}}`}</em>
      {`{{/weapon}}`}{`{{#weapon2}}`} then their
      <em>{`{{weapon2}}`}</em>
      {`{{/weapon2}}`}{`{{#weapon3}}`} then their
      <em>{`{{weapon3}}`}</em>
      {`{{/weapon3}}`}
    </p>
  </div>
  <div class="sheet-rollcontent">
    <span class="sheet-rolltype">Damage Roll:</span>
    <span class="sheet-rolloutput">
      {#each ['', '2', '3', '4', '5'] as tag}
        {`{{#damage${tag}}}`}
        <span class="sheet-rollresult">{`{{damage${tag}}}`}</span>
        {`{{/damage${tag}}}`}
      {/each}
      {`{{type}}`}
    </span>
    {`{{#note}}`}
    <hr />
    <span class="sheet-rollnote">{`{{note}}`}</span>
    {`{{/note}}`}
  </div>
</Box>
