<script>
  export let id;
</script>

<style>
  .sheet-sec {
    display: flex;
    flex-direction: column;

    & :global(> div:not(:first-child)) {
      margin-top: 12px;
    }

    & :global(h2) {
      background-color: #ccc;
    }
  }
</style>

<div class="sheet-sec sheet-sec-{id}">
  <slot />
</div>
