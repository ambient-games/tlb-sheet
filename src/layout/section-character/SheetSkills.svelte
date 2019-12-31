<script>
  import { headerCase } from "change-case";

  import { Box, Field, Toggle, Table, TableItem } from "../index.js";

  let skillsets = [
    "acedemia",
    "craftsmanship",
    "professional",
    "athletics",
    "self-mastery",
    "entertainment",
    "subsistence",
    "legerdemain",
    "communication",
    "investigation"
  ];

  let header = [
    { type: "toggle" },
    { label: "Name" },
    { label: "Level/ Spec." },
    { label: "Parent" },
    { label: "Diff." },
    { label: "Chance" }
    // { label: "Roll" }
  ];
</script>

<style>
  :global(.sheet-skills) {
    /* Name Field */
    & .sheet-tableheader > span:nth-child(2),
    & .sheet-tablerow > input:nth-of-type(3) {
      width: calc(100% - 180px);
      text-align: left;
    }

    /* Remaining Fields except last */
    & .sheet-tableheader > span:nth-child(n + 3),
    & .sheet-tablerow > input:nth-of-type(n + 4) {
      width: 35px;
      border-left: 1px solid #222;
    }

    /* Roll Button */
    & .sheet-tableheader > span:last-child {
      width: 55px;
    }
    & .sheet-tablerow > button:last-child {
      width: 20px;
    }

    &
      :global(input[type="hidden"][name="attr_skill-skillset-toggle"][value="checked"]
        ~ *) {
      background: #eee;
    }
  }

  /* Roll20 Generated Buttons */
  :global(.sheet-skills .repcontrol .btn::after) {
    content: " Skill";
  }
</style>

<Box id="skills" label="Skills" boxed hasToggle>
  <Table id="skills" {header} repeat>
    <Field hidden id="skill-skillset-toggle" />
    <TableItem type="toggle" id="skill" />
    <TableItem type="text" id="skill-name" />
    <TableItem type="text" id="skill-level" />
    <TableItem type="text" id="skill-parent" />
    <TableItem type="text" id="skill-diff" />
    <TableItem type="text" id="skill-chance" />
    <TableItem
      type="button"
      id="skill-roll"
      value={`&{template:TLBskillRoll} {{name=@{character-name}}} {{skill=@{skill-name}}} {{roll=[[d100cs<3cf>99]]}} {{chance=@{skill-chance}}} {{note=?{Note}}}`} />
    <TableItem type="drawer">
      <Field textarea id="skill-desc" rows="3" />
      <ul>
        <Toggle
          id="skill-skillset"
          label="Mark as skillset"
          style="small"
          wrap="li" />
        <li
          class="sheet-id"
          title="Copy this ID to reference this skill when writing macros">
          <span name="attr_skill-id">...</span>
        </li>
      </ul>
    </TableItem>
  </Table>

</Box>
