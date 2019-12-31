<script>
  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let header1 = [
    { type: "toggle" },
    { label: "Session Date" },
    { label: "CAP" }
  ];

  let header2 = [{ label: "Unspent CAP" }, { label: "Total CAP" }];
</script>

<style>
  :global(.sheet-sessionlog) {
    grid-column: 1 / span 1;
    grid-row: 6;

    & h2 {
      background-color: #ccc;
    }

    /* Date Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: calc(100% - 65px);
      text-align: left;
    }

    /* XP Field */
    & .sheet-tableheader > span:nth-child(3),
    & .sheet-tablerow > input[type="text"]:nth-child(5) {
      width: 45px;
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

  :global(.sheet-caplogtable) {
    margin-top: 12px;
    border-top: 1px solid #222;

    /* Fields */
    & .sheet-tableheader > span,
    & .sheet-tablerow > input[type="text"] {
      width: calc(100% / 2);
      text-align: center !important;

      &:last-child {
        border-left: 1px solid #222;
      }
    }
  }

  /* Roll20 Generated Buttons */
  :global(.sheet-log .repcontrol .btn::after) {
    content: " Log";
  }
</style>

<Box id="sessionlog" label="Experience" boxed hasToggle>
  <Table id="sessionlog" header={header1} repeat>
    <Toggle hidden id="session-header" />
    <TableItem type="toggle" id="session" />
    <TableItem type="text" id="session-date" />
    <TableItem type="text" id="session-cap" />
    <TableItem type="drawer">
      <Field textarea id="session-desc" rows="3" />
      <ul>
        <Toggle
          id="session-header"
          label="Mark as header"
          style="small"
          wrap="li" />
      </ul>
    </TableItem>
  </Table>

  <Table id="caplog" header={header2}>
    <TableItem type="text" id="cap-unspent" />
    <TableItem type="text" id="cap-total" />
  </Table>
</Box>
