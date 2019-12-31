<script>
  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let header = [{ type: "toggle" }, { label: "Name" }, { label: "Type" }];
</script>

<style>
  :global(.sheet-advantages) {
    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: calc(100% - 110px);
      text-align: left;
    }

    /* Type Field */
    & .sheet-tableheader > span:nth-child(3),
    & .sheet-tablerow > select:nth-child(5) {
      width: 90px;
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
  :global(.sheet-advantages .repcontrol .btn::after) {
    content: " Advantage";
  }
</style>

<Box id="advantages" label="Advantages/Disadvantages" boxed hasToggle>
  <Table id="advantage" {header} repeat>
    <Toggle hidden id="advantage-header" />
    <TableItem type="toggle" id="advantage" />
    <TableItem type="text" id="advantage-name" />
    <TableItem type="select" id="advantage-type">
      <option selected>Choose...</option>
      <option>Advantage</option>
      <option>Affliction</option>
      <option>Ailment</option>
      <option>Obstacle</option>
    </TableItem>
    <TableItem type="drawer">
      <Field textarea id="advantage-desc" rows="3" />
      <ul>
        <Toggle
          id="advantage-header"
          label="Mark as header"
          style="small"
          wrap="li" />
      </ul>
    </TableItem>
  </Table>
</Box>
