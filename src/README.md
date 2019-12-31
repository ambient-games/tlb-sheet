# The Last Book Character Sheet

This is a character sheet for use on Roll20.net with [The Last Book](http://thelastbook.us) (1st Edition).

---

## Installation Instructions

To use this sheet, you must have a Roll20 Pro subscription. Configure your campaign settings to use a _custom_ character sheet template. Copy the contents of `the-last-book.html` into the "HTML Layout" field. Copy the contents of `the-last-book.css` into the "CSS Styling" field. Save changes, and enter your campaign. Enjoy!

---

## Advanced Usage Instructions

### Weapon Attack, Defense, and Damage buttons

In order to get the roll buttons for your weapons to work, you must first select a "weapon type" for your weapon. Open the weapon row by clicking on the circle icon to the left of the weapon's name field. You'll see a selectbox labeled "type" with the options.

Selecting a type will display relevant modifier fields. These will be used along with the "Mark weapon as an 'off-hand' weapon" checkbox by the attack and defense buttons.

Fill in your raw damage, including any adjustments from your ST. Add the damage types of the weapon in parenthesis after the raw damage (i.e. `1d6+2 (SPI)`)

If filled in correctly, the sheet will auto-calculate the damage to use based on damage type (behind the scenes) when you click on the "Damage" button.

### Custom Technique and Prayer Macros

In order for the macro buttons for your Techniques and Prayer to work, you'll have to set up an "Ability" for them within Roll20's "Attributes & Abilities" tab on your character. The "Attributes & Abilities" tab is like the character sheet's _back-end_. For the most part, you should ignore it, but when setting up custom macros it is needed.

Go to the abilities list (right-hand side) and click the "+ Add" button at the top. This will create a new ability macro named "New Ability 0." Enter edit mode by hovering over the ability and clicking the small pencil icon to the right. This will convert the name into a text box and a larger textarea below it. This is where you will enter your macro.

First, change the ability name to `Move--<Technique-or-Prayer-Name>` (or `Move--<Technique-or-Prayer-Name>--Damage` for the 'Roll Damage' button). Replace _<Technique-or-Prayer-Name>_ with the name you entered as the name of your Technique or Prayer. Replace any spaces in the name with dashes. For example, if your Technique is called "_Plunging Stabs_" name your macros "_Move--Plunging-Stabs_" and "_Move--Plunging-Stabs--Damage_" (Note: capitalization is important).

Next, enter your macro in the textarea. There are several fields you can use. Enter them as a set of double curly brackets containing the field's name followed by an equals sign and the fields contents (i.e. `{{<fieldname>=...}}`):

#### Attack Macros:

The "_Use Technique_" button of each technique triggers what is called an "attack macro." This type of macro expects three things: the attack roll, (optional) the name of weapon being used, and (optional) a descriptive note.

```
{{attack=[[2d6+3]]}} {{weapon=Big Sword}} {{note=This attack is rad!}}
```

_Note that it doesn't matter what order you enter fields._

The `{{attack=...}}` field expects the content to include one of Roll20's "inline roll" formulas. Use double square brackets (`[[...]]`) containing a dice formula.

If your technique utilizes multiple weapons or includes multiple attacks, you can add additional fields by adding a number to the field name (i.e. `{{attack2=...}}` or `{{weapon2=...}}`).

If your technique is a defense rather than an attack, use a `{{defense=...}}` field instead. These work exactly the same as `{{attack=...}}` fields.

#### Ability Macros:

The "_Use Prayer_" button of each prayer triggers what is called an "ability macro." This type of macro expects only an optional descriptive note. The other fields used by these macros are auto-calculated by the sheet.

```
{{note=This prayer does something amazing!}}
```

#### Damage Macros:

The "_Roll Damage_" buttons of both techniques and prayers trigger what is called a "damage macro. This type of macro expects four things: the damage roll, the damage type, (optional) the weapon being used, and (optional) a descriptive note.

```
{{damage=[[1d6-1]]}} {{weapon=Righty Knife}} {{damage2=[[1d6-1]]}} {{weapon2=Lefty Knife}} {{type=Pierce}} {{note=Stabby stabby stab stab}}
```

_Note that it doesn't matter what order you enter fields._

Similarly to the `{{attack=...}}` field of _attack macros_, the `{{damage=...}}` field must include an "inline roll" formula within double square brackets (`[[...]]`).

The `{{type=...}}` field sets the damage type of the attack, and can be any word (or words) you want. Though, "Slash," "Pierce," and "Impact" are standard.

The `{{weapon=...}}` and `{{note=...}}` fields work the same as inside an _attack macro_, as described above.

### Advanced Roll20 Macro Syntax

You can write other macros as well that won't be triggered by buttons on the character sheet, but that you can use manually. Write them in the abilities list like above, but name them whatever you'd like. To use the same style of output templates used by the sheet macros, write the following into the textarea:

```
&{template:<templatename>} {{name=@{<charactername>|character-name}}} ...Additional fields go here...
```

Replace `<templatename>` with "`TLBskillRoll`," "`TLBabilityRoll`," "`TLBattackRoll`," or "`TLBdamageRoll`." Replace `<charactername>` with your character's "short name." You can enter any `{{fields}}` that apply to the type of template you're using, as outlined below:

#### Ability Template Fields (`TLBabilityRoll`):

- `{{title=...}}`: \
  The name of the ability you are using. This will display in large letters under your name at the top of the output card (i.e. "Taariq uses _Ability_")

- `{{skill=...}}`: \
  The name of the skill this ability uses. This will display as the heading to your skill roll.

- `{{roll=...}}`: \
  The inline dice roll formula for your skill, wrapped in double square brackets (`[[...]]`). Use the formula "`[[d100cs<3cf>99]]`" for best results.

- `{{chance=...}}`: \
  The success chance of the skill this ability uses. You should reference the skill from your character sheet directly using "`@{<charactername>|repeating_skills_<rowid>_skill-chance}`" as explained in the "Referencing Skills" section found below.

- `{{note=...}}` (_optional_): \
  An optional note or short description to include at the bottom of the output card. It can include more advanced macro logic (see below), such as referencing an additional skill roll.

#### Skill Template Fields (`TLBskillRoll`):

- `{{skill=...}}`: \
  The name of the skill this ability uses. This will display in large letters under your name at the top of the output card (i.e. "Taariq checks _Skill_")

- `{{roll=...}}`: \
  The inline dice roll formula for your skill, wrapped in double square brackets (`[[...]]`). Use the formula "`[[d100cs<3cf>99]]`" for best results.

- `{{chance=...}}`: \
  The success chance of the skill this ability uses. You should reference the skill from your character sheet directly using "`@{<charactername>|repeating_skills_<rowid>_skill-chance}`" as explained in the "Referencing Skills" section found below.

- `{{note=...}}` (_optional_): \
  An optional note or short description to include at the bottom of the output card. It can include more advanced macro logic (see below), such as referencing an additional skill roll.

#### Attack Template Fields (`TLBattackRoll`):

- `{{move=...}}`: \
  The name of the move you are using. This will display in large letters under your name at the top of the output card (i.e. "Taariq attacks using _Move_")

- `{{weapon=...}}` or `{{weaponN=...}}` (_optional_): \
   The name of the weapon you are using. Replace "N" in the field name with 2-3 if using multiple weapons at once. (Note: You must include a separate weapon field for each weapon). These will display alongside your character name at the top of the output card.

- `{{attack=...}}` or `{{attackN}}`: \
  The inline dice roll formula for your attack, wrapped in double square brackets (`[[...]]`). Replace "N" in the field name with 2-5 if using multiple attacks at once. (Note: You must include a separate attack field for each attack). These will display under the "Attack Roll" heading, followed by the word "Strike"

  _Note that you shouldn't use both `attack` and `defense` fields at the same time._

- `{{defense=...}}` or `{{defenseN}}`: \
  The inline dice roll formula for your defense, wrapped in double square brackets (`[[...]]`). Replace "N" in the field name with 2-5 if using multiple defenses at once. (Note: You must include a separate defense field for each defense). These will display under the "Defense Roll" heading, followed by the word "Defense"

  _Note that you shouldn't use both `attack` and `defense` fields at the same time._

- `{{note=...}}` (_optional_): \
  An optional note or short description to include at the bottom of the output card. It can include more advanced macro logic (see below), such as referencing an additional skill roll.

#### Damage Template Fields (`TLBdamageRoll`):

- `{{weapon=...}}` or `{{weaponN=...}}` (_optional_): \
   The name of the weapon you are using. Replace "N" in the field name with 2-3 if using multiple weapons at once. (Note: You must include a separate weapon field for each weapon). These will display alongside your character name at the top of the output card.

- `{{damage=...}}` or `{{damageN}}`: \
  The inline dice roll formula for your damage, wrapped in double square brackets (`[[...]]`). Replace "N" in the field name with 2-5 if using multiple damages at once. (Note: You must include a separate damage field for each damage). These will display under the "Attack Roll" heading, followed by the damage type

- `{{type=...}}`: \
  The damage type of your weapon(s). Note that only one `type` field is allowed. If multiple damage types are needed, add them together in the same field (i.e. "`{{type=Pierce/Impact`"). This will display after the list of damage results.

- `{{note=...}}` (_optional_): \
  An optional note or short description to include at the bottom of the output card. It can include more advanced macro logic (see below), such as referencing an additional skill roll.

See [Macros on the Roll20 Wiki](https://wiki.roll20.net/Macros) for help with writing more complex macros.

### Referencing Sheet Fields directly

Many fields on the character sheet can be referenced within your macros using the `@{<charactername>|<fieldname>}` syntax, where `<charactername>` is your characters "short name" and `<fieldname>` is the name of the field you want to reference.

Common fields include: `iq`, `wl`, `aw`, `st`, `ag`, and `sm` for the core attribute levels; or `swing`, `thrust`, `throw`, `shoot`, `parry`, `block`, and `evade` for the combat maneuver ratings. Note that appending "\_max" to an attribute (i.e. `iq_max`) will reference the attribute success chance instead.

### Referencing Skills and Weapons directly

When writing your macros, it might be neccessary to reference a specific skill or weapon in order to grab data from your character sheet. Unfortunately there isn't a way to reference table rows by name. Instead, you must find Roll20's internal reference number for the table row.

To make things easier, Skills, Weapons, Techniques, and Prayers all display their row ID. Find it by opening the table entry by clicking the circle icon to the left of the row's name field. You'll see a `</>` symbol followed by a string of letters and numbers in the lower right-hand corner of the card. Click on it to highlight the ID and then copy it using `ctrl+c` or by right clicking and selecting "copy."

If the row IDs aren't displayed for the table you want to reference, right click on the table entry you're trying to find (using Chrome browser). Go to "Inspect." A panel will apear to the right showing the html of the webpage. The row you clicked on should be highlighted. Look for the row's containing `<div class="repitem">`. It should have an attribute called "_data-reprowid_" with a value that looks something like "_-LwuuZJ6lXxVeEgmZ0FJ_". That is the row id. Copy it for later.

#### Referencing Weapons:

In your macro, write `@{<charactername>|repeating_weapons_<rowid>_weapon-<fieldname>}`, where `<charactername>` is your character's "short name," `<rowid>` is the row id number you found previously, and `<fieldname>` is the name of the field you want to reference.

Common fields include: `name`, `swing`, `thrust`, `parry`, and `block`. The `damage1` and `damage1_max` fields reference the weapons primary damage type and primary damage formula respectively. The `offhand` field equals "-2" if the "Mark as an 'off-hand' weapon" checkbox is marked.

#### Referencing Skills:

In your macro, write `@{<charactername>|repeating_skills_<rowid>_skill-<fieldname>}`, where `<charactername>` is your character's "short name," `<rowid>` is the row id number you found previously, and `<fieldname>` is the name of the field you want to reference.

Common fields include: `name`, `level`, and `chance`.
