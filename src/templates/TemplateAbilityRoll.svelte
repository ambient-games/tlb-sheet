<script>
  import Box from "./TemplateBox.svelte";
</script>

<style global>

</style>

<Box id="ability">
  <div class="sheet-rollheader">
    <p class="sheet-rollprelude">
      <em>{`{{name}}`}</em>
      uses
      <span class="sheet-rolltitle">{`{{title}}`}</span>
    </p>
  </div>
  <div class="sheet-rollcontent">
    <span class="sheet-rolltype">{`{{skill}}`} Roll:</span>
    <span class="sheet-rolloutput">
      <span class="sheet-rollresult">{`{{roll}}`}%</span>
      vs. {`{{chance}}`}% {`{{#rollLess() roll 3}}`}
      <span class="sheet-rollcrit">Critical Success!</span>
      {`{{/rollLess() roll 3}}`} {`{{#rollTotal() roll 99}}`}
      <span class="sheet-rollfail">Auto Failure</span>
      {`{{/rollTotal() roll 99}}`} {`{{#rollTotal() roll 100}}`}
      <span class="sheet-rollfumble">Critical Failure!</span>
      {`{{/rollTotal() roll 100}}`}
    </span>
    {`{{#note}}`}
    <hr />
    <span class="sheet-rollnote">{`{{note}}`}</span>
    {`{{/note}}`}
  </div>
</Box>
