<script>
  export let id;
</script>

<style global>
  .sheet-rolltemplate-TLBskillRoll .sheet-rollbox,
  .sheet-rolltemplate-TLBabilityRoll .sheet-rollbox,
  .sheet-rolltemplate-TLBattackRoll .sheet-rollbox,
  .sheet-rolltemplate-TLBdamageRoll .sheet-rollbox {
    box-sizing: border-box;
    width: 100%;
    height: fit-content;
    margin: 0 !important;
    padding: 0 !important;
    border: 2px solid black;

    & .sheet-rollheader {
      position: relative;
      padding: 10px;
      padding-bottom: 0;
      background-color: black;
    }

    & .sheet-rollheader::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: -15px;
      display: block;
      width: 100%;
      height: 15px;
      background: transparent
        url("https://thelastbook.github.io/sheet/strip.png") center bottom
        no-repeat;
      background-size: auto 30px;
    }

    & p.sheet-rollprelude {
      font: 10px Georgia, serif;
      color: #aaa;
      text-transform: uppercase;

      &::first-letter {
        font-size: 12px;
      }

      & em {
        font-style: normal;
        color: #eee;
      }
    }

    & .sheet-rolltitle {
      display: block;
      font: bold italic 24px Georgia, serif;
      color: white;
      text-transform: uppercase;

      &::first-letter {
        font-size: 30px;
      }
    }

    & .sheet-rollcontent {
      padding: 10px;
      padding-top: 15px;

      background: white;
      background: linear-gradient(
          45deg,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0.2) 100%
        ),
        white;
    }

    & .sheet-rolltype {
      display: block;
      font: 14px Georgia, serif;
      color: black;
      text-transform: uppercase;
    }

    & .sheet-rolloutput {
      display: block;
      padding: 6px 0 0;
      font: 14px Courier, monospace;
      color: #aaa;
      text-transform: uppercase;

      & .sheet-rollfail {
        display: block;
        font-weight: bold;
        color: black;
      }

      & .sheet-rollfumble {
        display: block;
        font-weight: bold;
        color: firebrick;
      }
      & .sheet-rollcrit {
        display: block;
        font-weight: bold;
        color: green;
      }

      & .sheet-rollresult {
        display: inline-block;
        font-size: 26px;
        color: black;

        &:not(:last-child)::after {
          content: ", ";
          display: inline-block;
          font: 14px Courier, monospace;
          color: #aaa;
        }
      }
    }

    & hr {
      margin: 6px 0 !important;
      padding: 0 !important;
      border-top: 1px solid black;
    }

    & .sheet-rollnote {
      font: italic 12px Courier, monospace;
      color: #666;
    }

    & .inlinerollresult {
      border: none;
      background: transparent;
      padding: unset;
      font-weight: unset;
      font-size: unset;

      &.fullfail {
        border: none;
        color: firebrick;
      }
      &.fullcrit {
        border: none;
        color: green;
      }
    }
  }
</style>

<rolltemplate class="sheet-rolltemplate-TLB{id}Roll">
  <div class="sheet-rollbox">
    <slot />
  </div>
</rolltemplate>
