<script>
  import { Box, Field, Table, TableItem } from "../index.js";

  let header1 = [
    { type: "toggle" },
    { label: "Party Members" },
    {
      label: "Played by",
      tooltip: "Enter player names, discord names, etc."
    }
  ];
</script>

<style>
  :global(.sheet-partydetails) {
    grid-column: 1 / span 2;
    grid-row: 1;
  }

  :global(.sheet-partymemberstable) {
    margin-top: 0;
    border-top: 0;

    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(3) {
      width: 80px;
      text-align: left;
    }

    /* Other Fields */
    & .sheet-tableheader > span:nth-child(3),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: calc(100% - 100px);
      border-left: 1px solid #222;
      text-align: left;
    }
  }
</style>

<Box id="partydetails" label="Details" boxed>
  <Field id="character-name" label="Party Name" />
  <Field id="character-desc" label="Description" textarea rows="5" />

  <Table id="partymembers" header={header1} repeat>
    <TableItem type="toggle" id="party" />
    <TableItem type="text" id="party-name" />
    <TableItem type="text" id="party-aka" />
    <TableItem type="drawer">
      <Field textarea id="party-desc" rows="3" />
    </TableItem>
  </Table>
</Box>
