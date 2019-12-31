<script>
  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let header = [
    { type: "toggle" },
    { label: "Technique" },
    { label: "Mast." },
    { label: "Parent" },
    { label: "Vigor" },
    { label: "Lapse" }
  ];
</script>

<style>
  :global(.sheet-techniquestable) {
    margin-top: 0;
    border-top: 0;

    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: calc(100% - 160px);
      text-align: left;
      border-left: none;
    }

    /* Mastery Field */
    & .sheet-tableheader > span:nth-child(3),
    & .sheet-tablerow > input[type="text"]:nth-child(5) {
      width: 30px;
      border-left: 1px solid #222;
    }

    /* Parent Field */
    & .sheet-tableheader > span:nth-child(4),
    & .sheet-tablerow > input[type="text"]:nth-child(6) {
      width: 50px;
      border-left: 1px solid #222;
    }

    /* Other Fields */
    & .sheet-tableheader > span:nth-child(n + 5),
    & .sheet-tablerow > input[type="text"]:nth-child(n + 7) {
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
  :global(.sheet-techniquestable .repcontrol .btn::after) {
    content: " Tech.";
  }
</style>

<Box id="techniques" label="Techniques" boxed hasToggle>
  <Table id="techniques" {header} repeat>
    <Toggle hidden id="technique-header" />
    <TableItem type="toggle" id="technique" />
    <TableItem type="text" id="technique-name" />
    <TableItem type="text" id="technique-mastery" />
    <TableItem type="text" id="technique-parent" />
    <TableItem type="text" id="technique-vigor" />
    <TableItem type="text" id="technique-lapse" />
    <TableItem type="drawer" id="movebuttons">
      <Field
        id="technique-attackroll"
        button={`@{technique-attackmacro}`}
        label="Use Technique" />
      <Field
        id="technique-damageroll"
        button={`@{technique-damagemacro}`}
        label="Roll Damage" />
      <Field hidden id="technique-attackmacro" />
      <Field hidden id="technique-damagemacro" />
    </TableItem>
    <TableItem type="drawer">
      <Field textarea id="technique-desc" rows="3" />
      <ul>
        <Toggle
          id="technique-header"
          label="Mark as header"
          style="small"
          wrap="li" />
        <li
          class="sheet-id"
          title="Copy this ID to reference this technique when writing macros">
          <span name="attr_technique-id">...</span>
        </li>
      </ul>
    </TableItem>
  </Table>
</Box>
