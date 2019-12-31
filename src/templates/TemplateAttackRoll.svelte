<script>
  import Box from "./TemplateBox.svelte";
</script>

<style global>

</style>

<Box id="attack">
  <div class="sheet-rollheader">
    <p class="sheet-rollprelude">
      <em>{`{{name}}`}</em>
      {`{{#attack}}`}attacks{`{{/attack}}`}{`{{#defense}}`}defends{`{{/defense}}`}
      {`{{#weapon}}`} with their
      <em>{`{{weapon}}`}</em>
      {`{{/weapon}}`}{`{{#weapon2}}`} then their
      <em>{`{{weapon2}}`}</em>
      {`{{/weapon2}}`}{`{{#weapon3}}`} then their
      <em>{`{{weapon3}}`}</em>
      {`{{/weapon3}}`} using
      <span class="sheet-rolltitle">{`{{move}}`}</span>
    </p>
  </div>
  <div class="sheet-rollcontent">
    <span class="sheet-rolltype">
      {`{{#attack}}`}Attack{`{{/attack}}`}{`{{#defense}}`}Defense{`{{/defense}}`}
      Roll:
    </span>
    <span class="sheet-rolloutput">
      {#each ['', '2', '3', '4', '5'] as tag}
        {`{{#attack${tag}}}`}
        <span class="sheet-rollresult">{`{{attack${tag}}}`}</span>
        {`{{/attack${tag}}}`}
      {/each}

      {#each ['', '2', '3', '4', '5'] as tag}
        {`{{#defense${tag}}}`}
        <span class="sheet-rollresult">{`{{defense${tag}}}`}</span>
        {`{{/defense${tag}}}`}
      {/each}
      {`{{#attack}}`}Strike{`{{/attack}}`}{`{{#defense}}`}Defense{`{{/defense}}`}
    </span>
    {`{{#note}}`}
    <hr />
    <span class="sheet-rollnote">{`{{note}}`}</span>
    {`{{/note}}`}
  </div>
</Box>
