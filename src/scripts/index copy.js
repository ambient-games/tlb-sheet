on("change:repeating_weapons:weapon-damage", () => {
  getAttrs(
    [
      "repeating_weapons_weapon-damage",
      "repeating_weapons_weapon-damage1",
      "repeating_weapons_weapon-damage1_max",
      "repeating_weapons_weapon-damage2",
      "repeating_weapons_weapon-damage2_max",
      "repeating_weapons_weapon-damage3",
      "repeating_weapons_weapon-damage3_max"
    ],
    values => {
      let rowName = "repeating_weapons_";
      let rawDamage = values[rowName + "weapon-damage"];

      let damageTypes = rawDamage.match(/\((.+)\)/)[1];
      damageTypes = damageTypes.replace(/\//g, "");
      damageTypes = damageTypes.split("").map((entry, i) => {
        let type = "";
        if (entry.toLowerCase() === "i") type = "Impact";
        if (entry.toLowerCase() === "s") type = "Slash";
        if (entry.toLowerCase() === "p") type = "Pierce";
        if (entry.toLowerCase() === "r") type = "Rend";

        let mod = 0;
        if (i === 0) mod = 0;
        if (i === 1) mod = -2;
        if (i === 2) mod = -4;

        return { type, mod };
      });

      // Get the raw damage
      rawDamage = rawDamage.match(/^(\d+[Dd]\d+)([\+\-]\d)/);
      damageTypes = damageTypes.map(entry => {
        let dice = rawDamage[1];
        let mod = parseInt(rawDamage[2], 10) + entry.mod;
        let damage = `${dice}${mod >= 0 ? "+" : ""}${mod.toString()}`;
        return { type: entry.type, damage };
      });

      console.log("Damage types: ", damageTypes);

      let parsedDamage = {};
      parsedDamage[rowName + "weapon-damage1"] = damageTypes[0].type;
      parsedDamage[rowName + "weapon-damage1_max"] = damageTypes[0].damage;
      if (damageTypes[1]) {
        parsedDamage[rowName + "weapon-damage2"] = damageTypes[1].type;
        parsedDamage[rowName + "weapon-damage2_max"] = damageTypes[1].damage;
      }
      if (damageTypes[2]) {
        parsedDamage[rowName + "weapon-damage3"] = damageTypes[2].type;
        parsedDamage[rowName + "weapon-damage3_max"] = damageTypes[2].damage;
      }

      // Set the damage attributes...
      setAttrs(parsedDamage);
    }
  );
});

on("change:repeating_weapons:weapon-type", () => {
  getAttrs(["repeating_weapons_weapon-type"], values => {
    let rowName = "repeating_weapons_";
    let weaponType = values[rowName + "weapon-type"];

    console.log("Damage type: ", weaponType);

    let damageMacro = "";
    if (weaponType === "melee") damageMacro = "@{weapon-meleemacro}";
    if (weaponType === "ranged") damageMacro = "@{weapon-rangedmacro}";
    if (weaponType === "shield") damageMacro = "@{weapon-shieldmacro}";

    let result = {};
    result[rowName + "weapon-attackmacro"] = damageMacro;

    console.log("Damage Macro: ", result);

    setAttrs(result);
  });
});

on(
  "change:repeating_armor change:repeating_weapons change:repeating_items remove:repeating_armor remove:repeating_weapons remove:repeating_items",
  e => {
    // Count item weights...
    let armorweight = 0;
    let weaponsweight = 0;
    let itemsweight = 0;

    getSectionIDs("armor", items => {
      items.forEach(id => {
        getAttrs([`repeating_armor_${id}_armor-weight`], values => {
          let weight = values[`repeating_armor_${id}_armor-weight`];
          armorweight += parseFloat(weight, 10) || 0;
          setAttrs({ ["armor-totalweight"]: armorweight });
        });
      });
    });
    getSectionIDs("weapons", items => {
      items.forEach(id => {
        getAttrs([`repeating_weapons_${id}_weapon-weight`], values => {
          let weight = values[`repeating_weapons_${id}_weapon-weight`];
          weaponsweight += parseFloat(weight, 10) || 0;
          setAttrs({ ["weapons-totalweight"]: weaponsweight });
        });
      });
    });
    getSectionIDs("items", items => {
      items.forEach(id => {
        getAttrs(
          [
            `repeating_items_${id}_item-weight`,
            `repeating_items_${id}_item-quantity`
          ],
          values => {
            let weight =
              parseFloat(values[`repeating_items_${id}_item-weight`], 10) || 0;
            let quantity =
              parseFloat(values[`repeating_items_${id}_item-quantity`], 10) ||
              1;

            itemsweight += weight * quantity;
            setAttrs({ ["items-totalweight"]: itemsweight });
          }
        );
      });
    });
  }
);

on(
  "change:armor-totalweight change:weapons-totalweight change:items-totalweight",
  () => {
    getAttrs(
      ["armor-totalweight", "weapons-totalweight", "items-totalweight"],
      values => {
        let armorweight = parseFloat(values["armor-totalweight"], 10) || 0;
        let weaponsweight = parseFloat(values["weapons-totalweight"], 10) || 0;
        let itemsweight = parseFloat(values["items-totalweight"], 10) || 0;

        setAttrs({
          ["combatload-cur"]: armorweight + weaponsweight + itemsweight
        });
      }
    );
  }
);


on("change:st",()=>{

  getAttrs
})

const 