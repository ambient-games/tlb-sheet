<script>
  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let header1 = [
    { type: "toggle" },
    { label: "NPC/Organization Name" },
    {
      label: "Relationship",
      tooltip:
        "Enter your relationship to the NPC or Organization here — Friendly, Neutral, Enemy, etc."
    }
  ];
</script>

<style>
  :global(.sheet-allies) {
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

    /* Relations Field */
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
  :global(.sheet-allies .repcontrol .btn::after) {
    content: " Note";
  }
</style>

<Box id="allies" label="Known NPCs/Organizations" boxed hasToggle>
  <Table id="ally" header={header1} repeat>
    <Toggle hidden id="ally-header" />
    <TableItem type="toggle" id="ally" />
    <TableItem type="text" id="ally-name" />
    <TableItem type="text" id="ally-relationship" />
    <TableItem type="drawer">
      <Field textarea id="ally-desc" rows="3" />
      <ul>
        <Toggle
          id="ally-header"
          label="Mark as header"
          style="small"
          wrap="li" />
      </ul>
    </TableItem>
  </Table>
</Box>
