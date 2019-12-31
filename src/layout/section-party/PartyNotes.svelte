<script>
  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let header = [{ type: "toggle" }, { label: "Note" }];
</script>

<style>
  :global(.sheet-notes) {
    grid-column: 3 / span 2;
    grid-row: 1;

    & :global(h2) {
      background-color: #ccc;
    }

    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: calc(100% - 20px);
      text-align: left;
    }

    & input[type="hidden"][name*="header-toggle"][value="checked"] {
      & :global(~ *) {
        background: #eee;
      }
      & :global(~ input:nth-child(4)) {
        width: calc(100% - 20px);
      }
      & :global(~ select:nth-child(n + 5)) {
        display: none;
      }
    }
  }

  /* Roll20 Generated Buttons */
  :global(.sheet-notes .repcontrol .btn::after) {
    content: " Note";
  }
</style>

<Box id="notes" label="Other Notes" boxed hasToggle>
  <Table id="note" {header} repeat>
    <Toggle hidden id="note-header" />
    <TableItem type="toggle" id="note" />
    <TableItem type="text" id="note-name" />
    <TableItem type="drawer">
      <Field textarea id="note-desc" rows="3" />
      <ul>
        <Toggle
          id="note-header"
          label="Mark as header"
          style="small"
          wrap="li" />
      </ul>
    </TableItem>
  </Table>
</Box>
