<script>
  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let header = [
    { type: "toggle" },
    { label: "Prayer" },
    { label: "Parent" },
    { label: "Favor" },
    { label: "Act." }
  ];
</script>

<style>
  :global(.sheet-prayerstable) {
    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: calc(100% - 130px);
      text-align: left;
    }

    /* Parent Field */
    & .sheet-tableheader > span:nth-child(3),
    & .sheet-tablerow > input[type="text"]:nth-child(5) {
      width: 50px;
      border-left: 1px solid #222;
    }

    /* Other Fields */
    & .sheet-tableheader > span:nth-child(n + 4),
    & .sheet-tablerow > input[type="text"]:nth-child(n + 6) {
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

  :global(.sheet-movebuttons) {
    display: flex;
    flex-wrap: wrap;
    padding: 0 3px;
    border-bottom: none !important;

    & button {
      box-sizing: border-box;
      margin: 3px !important;
      padding: 6px 9px !important;
      width: calc(50% - 6px);
      font: 12px/1 Georgia, serif !important;
      border: 1px solid #222;
      border-radius: 3px;

      &:hover,
      &:active,
      &:focus {
        background-color: #eee;
      }

      &:active {
        box-shadow: inset 1px 1px 1px 0 #222;
      }
    }
  }

  /* Roll20 Generated Buttons */
  :global(.sheet-prayerstable .repcontrol .btn::after) {
    content: " Prayer";
  }
</style>

<Box id="abilities" label="Abilities" boxed hasOptions hasToggle>
  <Table id="prayers" {header} repeat>
    <Toggle hidden id="prayer-header" />
    <TableItem type="toggle" id="prayer" />
    <TableItem type="text" id="prayer-name" />
    <TableItem type="text" id="prayer-parent" />
    <TableItem type="text" id="prayer-cost" />
    <TableItem type="text" id="prayer-act" />
    <TableItem type="drawer" id="movebuttons">
      <Field
        id="prayer-attackroll"
        button={`@{prayer-attackmacro}`}
        label="Use Ability" />
      <Field
        id="prayer-damageroll"
        button={`@{prayer-damagemacro}`}
        label="Roll Damage" />
      <Field hidden id="prayer-attackmacro" />
      <Field hidden id="prayer-damagemacro" />
    </TableItem>
    <TableItem type="drawer">
      <Field textarea id="prayer-desc" rows="3" />
      <ul>
        <Toggle
          id="prayer-header"
          label="Mark as header"
          style="small"
          wrap="li" />
        <li
          class="sheet-id"
          title="Copy this ID to reference this prayer when writing macros">
          <span name="attr_prayer-id">...</span>
        </li>
      </ul>
    </TableItem>
  </Table>
</Box>
