<script>
  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let header1 = [
    { type: "toggle" },
    { label: "Item" },
    { label: "Qty." },
    { label: "Lbs." }
  ];
</script>

<style>
  :global(.sheet-partyinventory) {
    grid-column: 5 / span 2;
    grid-row: 1;

    & :global(h2) {
      background-color: #ccc;
    }
  }
  :global(.sheet-partyitemstable) {
    margin-top: 0;
    border-top: 0;

    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: calc(100% - 95px);
      border-left: none;
      text-align: left;
    }

    /* Weight Field */
    & .sheet-tableheader > span:nth-child(4),
    & .sheet-tablerow > input[type="text"]:nth-child(6) {
      width: 45px;
    }

    /* Other Fields */
    & .sheet-tableheader > span,
    & .sheet-tablerow > input[type="text"] {
      width: 30px;
      border-left: 1px solid #222;
    }

    & input[type="hidden"][name*="header-toggle"][value="checked"] {
      & :global(~ *) {
        background: #eee;
      }
      & :global(~ input:nth-child(4)) {
        width: calc(100% - 20px);
      }
      & :global(~ input:nth-child(n + 5)) {
        display: none;
      }
    }
  }

  /* Roll20 Generated Buttons */
  :global(.sheet-partyitemstable .repcontrol .btn::after) {
    content: " Item";
  }
</style>

<Box id="partyinventory" label="Inventory" boxed>
  <Table id="partyitems" header={header1} repeat>
    <Toggle hidden id="partyitems-header" />
    <TableItem type="toggle" id="item" />
    <TableItem type="text" id="item-name" />
    <TableItem type="text" id="item-quantity" />
    <TableItem type="text" id="item-weight" />
    <TableItem type="drawer">
      <Field textarea id="item-desc" rows="3" />
      <ul>
        <Toggle
          id="partyitems-header"
          label="Mark as header"
          style="small"
          wrap="li" />
      </ul>
    </TableItem>
  </Table>

  <!-- <Table id="travelload" header={header2}>
    <Field hidden id="partyitems-totalweight" value="0" />
    <TableItem type="text" id="travelload-max" />
    <TableItem type="text" id="travelload-lvl" />
    <TableItem type="text" id="travelload-cur" />
  </Table> -->
</Box>
