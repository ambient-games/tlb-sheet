<script>
  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let header1 = [
    { type: "toggle" },
    { label: "Quest Name" },
    {
      label: "Status",
      tooltip:
        "Enter your overall progress on the quest here — Received, Started, Completed, etc."
    }
  ];
</script>

<style>
  :global(.sheet-quests) {
    grid-column: 3 / span 2;
    grid-row: 1;

    & :global(h2) {
      background-color: #ccc;
    }

    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: calc(100% - 95px);
      text-align: left;
    }

    /* Status Field */
    & .sheet-tableheader > span:nth-child(3),
    & .sheet-tablerow > input[type="text"]:nth-child(5) {
      width: 75px;
      text-align: center;
      border-left: 1px solid #222;
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
  :global(.sheet-quests .repcontrol .btn::after) {
    content: " Note";
  }
</style>

<Box id="quests" label="Quests" boxed hasToggle>
  <Table id="quest" header={header1} repeat>
    <Toggle hidden id="quest-header" />
    <TableItem type="toggle" id="quest" />
    <TableItem type="text" id="quest-name" />
    <TableItem type="text" id="quest-status" />
    <TableItem type="drawer">
      <Field textarea id="quest-desc" rows="3" />
      <ul>
        <Toggle
          id="quest-header"
          label="Mark as header"
          style="small"
          wrap="li" />
      </ul>
    </TableItem>
  </Table>
</Box>
