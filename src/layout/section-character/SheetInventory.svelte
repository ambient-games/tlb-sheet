<script>
  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let header1 = [
    { type: "toggle" },
    { label: "Item" },
    { label: "Qty." },
    { label: "Lbs." }
  ];

  let header2 = [
    {
      label: "Travel Load",
      tooltip:
        "This value is auto-calculated based on SM level. It does not consider advantages you may have, but can be adjusted manually if needed"
    },
    {
      label: "Encumb. Level",
      tooltip:
        "This value is auto-calculated based on the 'travel load' and 'weight carried' fields"
    },
    {
      label: "Weight Carried",
      tooltip:
        "This value is auto-calculated from the items listed in both the 'Equipped Items' and 'Other Items' tables"
    }
  ];
</script>

<style>
  :global(.sheet-otheritemstable) {
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

  :global(.sheet-travelloadtable) {
    margin-top: 12px;
    border-top: 1px solid #222;

    /* Name Field */
    & .sheet-tableheader > span,
    & .sheet-tablerow > input[type="text"] {
      width: calc(100% / 3);
      text-align: center !important;

      &:nth-child(n + 3) {
        border-left: 1px solid #222;
      }
    }
  }

  /* Roll20 Generated Buttons */
  :global(.sheet-otheritemstable .repcontrol .btn::after) {
    content: " Item";
  }
</style>

<Box id="inventory" label="Other items" boxed hasToggle>
  <Table id="otheritems" header={header1} repeat>
    <Toggle hidden id="item-header" />
    <TableItem type="toggle" id="item" />
    <TableItem type="text" id="item-name" />
    <TableItem type="text" id="item-quantity" />
    <TableItem type="text" id="item-weight" />
    <TableItem type="drawer">
      <Field textarea id="item-desc" rows="3" />
      <ul>
        <Toggle
          id="item-header"
          label="Mark as header"
          style="small"
          wrap="li" />
      </ul>
    </TableItem>
  </Table>

  <Table id="travelload" header={header2}>
    <Field hidden id="otheritems-totalweight" value="0" />
    <TableItem type="text" id="travelload-max" />
    <TableItem type="text" id="travelload-lvl" />
    <TableItem type="text" id="travelload-cur" />
  </Table>
</Box>
