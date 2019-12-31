<script>
  import {
    Box,
    Field,
    Toggle,
    Table,
    TableItem,
    DerivedBox
  } from "../index.js";

  let header1 = [
    { type: "toggle" },
    { label: "Armor" },
    { label: "Location" },
    { label: "DR" },
    { label: "Lbs." }
  ];

  let header2 = [
    { type: "toggle" },
    {
      label: "Weapon",
      tooltip:
        "Be sure to select the weapon's type (i.e. 'melee,' or 'ranged') by opening the weapon details section (via the circle icon to the left) and changing the dropdown"
    },
    {
      label: "Damage",
      tooltip:
        "Enter the weapon's base damage after minimum ST adjustments. Please include the weapon's damage types (i.e. 'S/P/I') in parenthesis to have the 'damage roll' macro auto-adjust for damge type"
    },
    { label: "Lbs." }
  ];

  let header3 = [
    { type: "toggle" },
    { label: "Item" },
    { label: "Qty." },
    { label: "Lbs." }
  ];

  let header4 = [
    {
      label: "Combat Load",
      tooltip:
        "This value is auto-calculated based on ST level. It does not consider advantages you may have, but can be adjusted manually if needed"
    },
    {
      label: "Encumb. Level",
      tooltip:
        "This value is auto-calculated based on the 'combat load' and 'weight carried' fields"
    },
    {
      label: "Weight Carried",
      tooltip:
        "This value is auto-calculated from the items listed in the 'Equipped Items' table"
    }
  ];
</script>

<style>
  :global(.sheet-armortable) {
    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(3) {
      width: calc(100% - 175px);
      text-align: left;
    }

    /* Location Field */
    & .sheet-tableheader > span:nth-child(3),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: 70px;
      border-left: 1px solid #222;
    }

    /* DR Field */
    & .sheet-tableheader > span:nth-child(4),
    & .sheet-tablerow > input[type="text"]:nth-child(5) {
      width: 40px;
      border-left: 1px solid #222;
    }

    /* Weight Field */
    & .sheet-tableheader > span:nth-child(5),
    & .sheet-tablerow > input[type="text"]:nth-child(6) {
      width: 45px;
      border-left: 1px solid #222;
    }
  }

  :global(.sheet-weaponstable) {
    margin-top: 12px;
    border-top: 1px solid #222;

    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(3) {
      width: calc(100% - 175px);
      text-align: left;
    }

    /* Damage Field */
    & .sheet-tableheader > span:nth-child(3),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: 110px;
      border-left: 1px solid #222;
    }

    /* Weight Field */
    & .sheet-tableheader > span:nth-child(4),
    & .sheet-tablerow > input[type="text"]:nth-child(11) {
      width: 45px;
      border-left: 1px solid #222;
    }
  }

  :global(.sheet-weapondetails) {
    display: flex;
    flex-wrap: wrap;
    border-bottom: none !important;

    & label {
      width: 35px !important;
      border-bottom: none !important;
    }
    & label:nth-child(2) {
      width: 80px !important;
    }
    & label > input[type="text"] {
      padding-top: 20px !important;
    }
    & label > select {
      margin: 0;
      margin-top: 20px;
      padding: 3px 5px;
      width: 100%;
      min-height: 21px;
      height: 21px;
      border: 0;
      border-radius: 0;

      & option,
      & {
        font: 12px / 1.5 Courier, monospace;
        text-align: center;
      }
    }
    & label > span {
      text-align: center;
    }

    & input[type="hidden"][name*="weapon-type"] {
      & ~ label:not(:nth-child(2)) {
        display: none;
      }
      &[value="melee"] ~ label:nth-child(3),
      &[value="melee"] ~ label:nth-child(4),
      &[value="melee"] ~ label:nth-child(5),
      &[value="melee"] ~ label:nth-child(6),
      &[value="melee"] ~ label:nth-child(7) {
        display: block;
      }

      &[value="ranged"] ~ label:nth-child(8),
      &[value="ranged"] ~ label:nth-child(9) {
        display: block;
      }

      &[value="shield"] ~ label:nth-child(10),
      &[value="shield"] ~ label:nth-child(11) {
        display: block;
      }
    }
  }

  :global(.sheet-attackbuttons) {
    display: flex;
    flex-wrap: wrap;
    padding: 0 3px;
    border: none !important;

    & button {
      box-sizing: border-box;
      margin: 3px !important;
      padding: 6px 9px !important;
      width: calc(33.333% - 6px);
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

  :global(.sheet-itemstable) {
    margin-top: 12px;
    border-top: 1px solid #222;

    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input[type="text"]:nth-child(4) {
      width: calc(100% - 95px);
      text-align: left;
      border-left: none;
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

  :global(.sheet-combatloadtable) {
    margin-top: 12px;
    border-top: 1px solid #222;

    /* Name Field */
    & .sheet-tableheader > span,
    & .sheet-tablerow > input[type="text"] {
      width: calc(100% / 3);
      text-align: center !important;

      &:nth-child(n + 5) {
        border-left: 1px solid #222;
      }
    }
  }

  /* Roll20 Generated Buttons */
  :global(.sheet-armortable .repcontrol .btn::after) {
    content: " Armor";
  }
  :global(.sheet-weaponstable .repcontrol .btn::after) {
    content: " Weapon";
  }
  :global(.sheet-itemstable .repcontrol .btn::after) {
    content: " Item";
  }
</style>

<Box id="equipped" label="Equipped items" boxed hasToggle>
  <Table id="armor" header={header1} repeat>
    <TableItem type="toggle" id="armor" />
    <TableItem type="text" id="armor-name" />
    <TableItem type="text" id="armor-loc" />
    <TableItem type="text" id="armor-dr" />
    <TableItem type="text" id="armor-weight" />
    <TableItem type="drawer">
      <Field textarea id="armor-desc" rows="3" />
    </TableItem>
  </Table>

  <Table id="weapons" header={header2} repeat>
    <TableItem type="toggle" id="weapon" />
    <TableItem type="text" id="weapon-name" />
    <TableItem type="text" id="weapon-damage" />
    <Field hidden id="weapon-damage1" value="N/A" />
    <Field hidden id="weapon-damage2" value="N/A" />
    <Field hidden id="weapon-damage3" value="N/A" />
    <Field hidden id="weapon-damage1_max" value="0" />
    <Field hidden id="weapon-damage2_max" value="0" />
    <Field hidden id="weapon-damage3_max" value="0" />
    <TableItem type="text" id="weapon-weight" />

    <TableItem type="drawer" id="weapondetails">
      <Field hidden id="weapon-type" />
      <Field selectbox id="weapon-type" label="Type">
        <option selected>Choose...</option>
        <option value="melee">Melee</option>
        <option value="ranged">Ranged</option>
        <option value="shield">Shield</option>
      </Field>
      <!-- Melee Weapon -->
      <Field id="weapon-swing" label="Swing" value="+0" />
      <Field id="weapon-thrust" label="Thrust" value="+0" />
      <Field id="weapon-throw" label="Throw" value="+0" />
      <Field id="weapon-parry" label="Parry" value="+0" />
      <Field id="weapon-block" label="Block" value="+0" />
      <!-- Ranged Weapon -->
      <Field id="weapon-shoot" label="Shoot" value="+0" />
      <Field id="weapon-acc" label="Acc." value="+0" />
      <!-- Shield -->
      <Field id="weapon-block" label="Block" value="+0" />
      <Field id="weapon-dr" label="DR" value="0" />
    </TableItem>
    <TableItem type="drawer" id="attackbuttons">
      <Field
        id="weapon-attackroll"
        button={`@{weapon-attackmacro}`}
        label="Attack" />
      <Field
        id="weapon-attackroll"
        button={`@{weapon-defensemacro}`}
        label="Defense" />
      <Field
        id="weapon-damageroll"
        button={`@{weapon-damagemacro}`}
        label="Damage" />
      <Field hidden id="weapon-attackmacro" />
      <Field hidden id="weapon-defensemacro" />
      <Field hidden id="weapon-damagemacro" />
    </TableItem>
    <TableItem type="drawer">
      <Field textarea id="weapon-desc" rows="3" />
      <ul>
        <Toggle
          id="weapon-offhand"
          label="Mark as an 'off-hand' weapon"
          style="small"
          value="-2"
          wrap="li" />
        <li
          class="sheet-id"
          title="Copy this ID to reference this weapon when writing macros">
          <span name="attr_weapon-id">...</span>
        </li>
      </ul>
    </TableItem>
  </Table>

  <Table id="items" header={header3} repeat>
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

  <Table id="combatload" header={header4}>
    <Field hidden id="armor-totalweight" value="0" />
    <Field hidden id="weapons-totalweight" value="0" />
    <Field hidden id="items-totalweight" value="0" />

    <TableItem type="text" id="combatload-max" />
    <TableItem type="text" id="combatload-lvl" />
    <TableItem type="text" id="combatload-cur" />
  </Table>
</Box>
