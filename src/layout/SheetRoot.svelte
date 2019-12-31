<script>
  import { Section, ModeContent, Field } from "./index.js";

  import {
    Header,
    Attributes,
    Details,
    Advantages,
    Skills,
    Notes,
    Pools,
    Techniques,
    Prayers,
    Equipped,
    Inventory,
    Maneuvers,
    ExpLog
  } from "./index.js";

  import {
    PartyDetails,
    PartyAllies,
    PartyQuests,
    PartyNotes,
    PartyInventory
  } from "./index.js";
</script>

<style global>
  .sheet-modecontent {
    position: relative;
    display: none;
    margin-top: 12px;
    grid-template-columns: 150px repeat(5, calc((100% - 210px) / 5));
    grid-template-rows: repeat(auto-fill, minmax(45px, auto));
    grid-auto-flow: row dense;
    column-gap: 12px;
    row-gap: 12px;
    justify-items: stretch;
    align-items: start;
  }

  input[type="hidden"][name*="mode"] {
    &[value="character"] {
      & ~ .sheet-modecontent-character {
        display: grid;
      }

      & ~ .sheet-header .sheet-modetoggle::before {
        content: "Character";
      }
    }

    &[value="party"] {
      & ~ .sheet-modecontent-party {
        display: grid;
      }

      & ~ .sheet-header .sheet-modetoggle::before {
        content: "Party";
      }
    }
  }

  /* Headings */
  h2 {
    position: relative;
    display: block;
    overflow: hidden;
    padding: 0 5px 5px;
    font: bold 12px / 1.5 Georgia, serif;
    color: white;
    text-transform: uppercase;
    background: transparent
      url("https://raw.githubusercontent.com/thelastbook/roll20-sheet/master/strip.png")
      center top no-repeat;
    background-size: auto 30px;
  }

  h2::first-letter {
    font-size: 16px;
  }

  h2 > span {
    float: right;
  }

  h3 {
    margin-top: 6px;
    font: bold 9px / 1.5 Georgia, serif;
    text-transform: uppercase;
    color: #222;
  }

  h3::first-letter {
    font-size: 12px;
  }

  /* Roll Buttons */
  button[type="roll"] {
    margin: 0 !important;
    padding: 0 !important;
    width: 20px;
    height: auto;
    background: none;
    border: none;
    border-radius: 0;
    box-shadow: none;

    &::before {
      content: none !important;
    }

    &::after {
      display: inline-block;
      width: 10px;
      height: 10px;
      padding-left: 2px;
      font-family: "dicefontd10" !important;
      content: "0" !important;
      font-size: 12px;
      font-style: normal;
      font-weight: bold;
    }
  }

  /* Toggle Heading */
  .sheet-toggle[value="checked"] ~ h2 {
    background-color: #222;
    padding: 0 5px;
  }

  .sheet-toggle ~ h2 {
    background-color: transparent;
    padding: 0 5px 5px;
  }

  /* Toggle Drawer */
  .sheet-boxed > .sheet-toggle ~ div.sheet-drawer {
    display: block;
  }

  .sheet-boxed > .sheet-toggle[value="checked"] ~ div.sheet-drawer {
    display: none;
  }

  /* Section Columns */
  .sheet-sec-details {
    grid-column: 2 / span 2;
    grid-row: 2;
  }

  .sheet-sec-moves {
    grid-column: 4 / span 2;
    grid-row: 2;
  }

  .sheet-sec-notes {
    grid-column: 3 / span 2;
    grid-row: 1;
  }
</style>

<div class="sheet-root">
  <Field hidden id="sheet_mode" value="character" />
  <Header />

  <ModeContent mode="character">
    <Attributes />
    <Pools />

    <Details />
    <Section id="details">
      <Advantages />
      <Skills />
      <Notes />
    </Section>

    <Section id="moves">
      <Techniques />
      <Prayers />
      <Equipped />
      <Inventory />
    </Section>

    <Maneuvers />
  </ModeContent>

  <ModeContent mode="party">
    <PartyDetails />
    <Section id="notes">
      <PartyAllies />
      <PartyQuests />
      <PartyNotes />

    </Section>
    <PartyInventory />
  </ModeContent>

</div>
