class AmbientSheetWorkers {
  /* --------------------------------------------------------------------------
   *  Constructor
   * ------------------------------------------------------------------------ */
  constructor(ver = "0.0.0") {
    this.version = ver;
    this.toolbox = this.__toolbox();
    this.util = this.__util();

    // Define the Context Classe
    this.AmbientContext = class AmbientContext {
      constructor(opts) {
        this.triggers = [];
        this.attrs = [];
        this.fields = [];
        this.operations = [];

        return this;
      }

      getTriggers() {
        return this.triggers.map(trigger => {
          let { event, attr, section } = trigger;
          if (section && attr) {
            return `${event}:repeating_${section}:${attr}`;
          } else if (section && !attr) {
            return `${event}:repeating_${section}`;
          } else {
            return `${event}:${attr}`;
          }
        });
      }

      addTrigger(trigger) {
        this.triggers.push(trigger);
      }
      addAttr(attr) {
        this.attrs.push(attr);
      }
      addField(field) {
        this.fields.push(field);
      }
      addOperation(operation) {
        this.operations.push(operation);
      }
    };
  }

  listen(...args) {
    return this.toolbox.listen(...args);
  }

  getAttrs(...args) {
    return this.toolbox.getAttrs(...args);
  }

  getFields(...args) {
    return this.toolbox.getFields(...args);
  }

  tap(...args) {
    return this.toolbox.tap(...args);
  }

  each(...args) {
    return this.toolbox.each(...args);
  }

  run(...args) {
    return this.toolbox.run(...args);
  }

  resetCtx(opts) {
    this.__context = new this.AmbientContext(opts);
  }
  get ctx() {
    return this.__context;
  }

  __toolbox() {
    return {
      /* -----------------------------------------------------------------------
       *  Toolbox.listen()
       * -------------------------------------------------------------------- */
      listen: (triggers, section = false) => {
        if (!triggers) {
          throw new Error(
            "'listen()' must be called with an 'triggers' argument in the form of a String or an Array<String>."
          );
        }

        // If there are no 'ctx.triggers', reset 'ctx'
        if (!this.ctx || !this.ctx.triggers.length) this.resetCtx();

        // Coerce 'triggers' into an Array
        if (triggers && _.isString(triggers)) triggers = triggers.split(" ");

        // Parse the 'triggers' into an Object
        triggers = triggers.map(trigger => {
          trigger = trigger.split(":");
          return {
            event: trigger[0] ? trigger[0] : _.noop(),
            attr: trigger[1] ? trigger[1] : _.noop(),
            section: section ? section : _.noop()
          };
        });

        // Add each 'trigger' to 'ctx'
        triggers.forEach(trigger => {
          this.ctx.addTrigger(trigger);
        });

        // Return 'this' for chaining
        return this;
      },

      /* -----------------------------------------------------------------------
       *  Toolbox.getAttrs()
       * -------------------------------------------------------------------- */
      getAttrs: attrs => {
        if (!attrs) {
          throw new Error(
            "'getATtrs()' must be called with an 'attrs' argument in the form of a String or an Array<String>."
          );
        }

        // Coerce 'attrs' into an Array
        if (attrs && _.isString(attrs)) attrs = attrs.split(" ");

        // Add each 'attr' to 'ctx'
        attrs.forEach(attr => {
          this.ctx.addAttr(attr);
        });

        // Return 'this' for chaining
        return this;
      },

      /* -----------------------------------------------------------------------
       *  Toolbox.getFields()
       * -------------------------------------------------------------------- */
      getFields: (fields, section, parseOnly = false) => {
        if (!fields) {
          throw new Error(
            "'getFields()' must be called with an 'fields' argument in the form of a String or an Array<String>."
          );
        }

        if (!section) {
          throw new Error(
            "'getFields()' must be called with an 'section' argument in the form of a String."
          );
        }

        // Coerce 'fields' into an Array
        if (fields && _.isString(fields)) fields = fields.split(" ");

        // Parse the 'fields' into an Object
        fields = fields.map(field => {
          return {
            field: field,
            section: section
          };
        });

        // If the 'parseOnly' flag is set, return the 'fields' object
        if (parseOnly) return fields;

        // Otherwise, add each 'field' to 'ctx'
        fields.forEach(field => {
          this.ctx.addField(field);
        });

        // Return 'this' for chaining
        return this;
      },

      /* -----------------------------------------------------------------------
       *  Toolbox.getFieldFromAllRows()
       * -------------------------------------------------------------------- */
      getFieldsFromAllRows: (fields, section, rowIds, func) => {
        if (!_.isArray(fields) || !_.isArray(rowIds) || !_.isFunction(func)) {
          throw new Error(
            "'getFieldsFromAllRows()' must be called with 'fields,' 'section,' 'rowIds,' and 'func' arguments."
          );
        }

        let set = fields.map(field => {
          if (field.section && field.section === section) {
            return rowIds.map(rowId => {
              return `repeating_${section}_${rowId}_${field.field}`;
            });
          }
        });

        set = _.flatten(set);
        set = _.compact(set);

        getAttrs(set, values => {
          // values = this.util.parseValues(values);
          _.partial(func, values)();
        });
      },

      /* -----------------------------------------------------------------------
       *  Toolbox.setAttrs()
       * -------------------------------------------------------------------- */
      setAttrs: (attrs, ...args) => {
        let sectionName, func;

        if (args.length === 1 && _.isFunction(args[0])) {
          func = args[0];
        } else if (args.length === 1 && _.isString(args[0])) {
          sectionName = args[0];
        } else if (
          args.length === 2 &&
          _.isString(args[0]) &&
          _.isFunction(args[1])
        ) {
          sectionName = args[0];
          func = args[1];
        }

        if (sectionName) {
          attrs = Object.entries(attrs);
          attrs = attrs.map(([key, val]) => {
            return [`repeating_${sectionName}_${key}`, val];
          });
          attrs = Object.fromEntries(attrs);
        }

        if (!func) {
          setAttrs(attrs);
        } else {
          setAttrs(attrs, func);
        }
      },

      /* -----------------------------------------------------------------------
       *  Toolbox.tap()
       * -------------------------------------------------------------------- */
      tap: (...args) => {
        if (args.length == 1 && !_.isFunction(args[0])) {
          throw new Error("'tap()' must receive a function.");
        }

        if (
          args.length == 2 &&
          !_.isString(args[0]) &&
          !_.isFunction(args[1])
        ) {
          throw new Error("'tap()' must receive a function.");
        }

        // Register the operation
        this.ctx.addOperation({
          type: "tap",
          section: args[1] ? args[0] : _.noop(),
          func: args[1] ? args[1] : args[0]
        });

        // Return 'this' for chaining
        return this;
      },

      /* -----------------------------------------------------------------------
       *  Toolbox.each()
       * -------------------------------------------------------------------- */
      each: (section, func) => {
        if (!_.isFunction(func)) {
          throw new Error("'each()' must receive a function.");
        }

        // Register the operation
        this.ctx.addOperation({
          type: "each",
          section: section,
          func: func
        });

        // Return 'this' for chaining
        return this;
      },

      /* -----------------------------------------------------------------------
       *  Toolbox.run()
       * -------------------------------------------------------------------- */
      run: () => {
        // Collect the data...
        let triggers = this.ctx.getTriggers();
        let attrs = this.ctx.attrs;
        let fields = this.ctx.fields;
        let operations = this.ctx.operations;

        let attrNames = attrs; // Doesn't need parsing
        let fieldNames = fields.map(field => {
          return `repeating_${field.section}_${field.field}`;
        });

        // Run the operations...
        on(triggers.join(" "), e => {
          getAttrs(_.union(attrNames, fieldNames), values => {
            values = this.util.parseValues(values, true);
            let attrSet = values.attrSet;
            let fieldSet = values.fieldSet;

            operations.forEach(op => {
              try {
                switch (op.type) {
                  case "tap":
                    if (!op.section) {
                      _.partial(op.func, {
                        e,
                        version: this.version,
                        attrSet,
                        fieldSet,
                        setAttrs: _.partial(this.toolbox.setAttrs)
                      })();
                    } else {
                      getSectionIDs(op.section, rowIds => {
                        this.toolbox.getFieldsFromAllRows(
                          fields,
                          op.section,
                          rowIds,
                          values => {
                            _.partial(op.func, {
                              e,
                              version: this.version,
                              attrSet,
                              fieldSet: Object.assign(
                                fieldSet,
                                this.util.parseValues(values).fieldSet
                              ),
                              setAttrs: _.partial(this.toolbox.setAttrs)
                            })();
                          }
                        );
                      });
                    }
                    break;
                  case "each":
                    getSectionIDs(op.section, rowIds => {
                      rowIds.forEach((row, rowNum) => {
                        this.toolbox.getFieldsFromAllRows(
                          fields,
                          op.section,
                          [row],
                          values => {
                            _.partial(op.func, {
                              e,
                              version: this.version,
                              rowNum,
                              attrSet,
                              fieldSet: this.util.parseValues(values, true)
                                .fieldSet,
                              setAttrs: _.partial(this.toolbox.setAttrs)
                            })();
                          }
                        );
                      });
                    });
                    break;
                }
              } catch (err) {
                if (err)
                  throw new Error(`'${op.type}()' failed with error: `, err);
                throw new Error(`'${op.type}()' failed`);
              }
            });
          });
        });

        // End the chain
        this.resetCtx();
        return false;
      }
    };
  }

  __util() {
    return {
      parseValues: (values, singleRowOnly = false) => {
        let attrSet = {};
        let fieldSet = {};

        values = Object.entries(values);

        // Parse the 'attrSet'
        attrSet = values.filter(([key, val]) => {
          return !key.includes("repeating_");
        });
        attrSet = Object.fromEntries(attrSet);

        // Parse the 'fieldSet'
        values
          .filter(([key, val]) => {
            return key.includes("repeating_");
          })
          .forEach(([key, val]) => {
            let match, section, rowId, field;

            match = key.match(
              /^repeating_([A-Za-z0-9-]+)_?(-[A-Za-z0-9-]+)?_([A-Za-z0-9-_]+)$/
            );
            section = match[1] ? match[1] : false;
            rowId = match[2] ? match[2] : false;
            field = match[3] ? match[3] : false;

            if (!fieldSet[section]) fieldSet[section] = [];
            if (fieldSet[section].length) {
              let row = fieldSet[section].filter(row => {
                return row.rowId === rowId;
              })[0];

              if (!row) fieldSet[section].push({ rowId, [field]: val });
              if (row && !row[field]) {
                row[field] = val;
              }
            } else {
              fieldSet[section].push({ rowId, [field]: val });
            }
          });

        // Squash section arrays if 'singleRowOnly' flag is passed
        if (singleRowOnly) {
          fieldSet = Object.entries(fieldSet);
          fieldSet = fieldSet.map(([key, val]) => {
            if (val.length === 1) val = val[0];
            return [key, val];
          });
          fieldSet = Object.fromEntries(fieldSet);
        }

        return { attrSet, fieldSet };
      }
    };
  }
}

sheet = new AmbientSheetWorkers("1.2.3");

sheet
  .listen("sheet:opened")
  .getAttrs(["sheet_ver", "character_name"])
  .tap(({ version, attrSet, setAttrs }) => {
    let ver = attrSet.sheet_ver;
    if (ver && ver != "") {
      setAttrs({ ["sheet_ver"]: version });
      return false;
    }

    setAttrs(
      {
        ["sheet_ver"]: version,
        ["sheet_mode"]: "character",
        ["character-name"]: attrSet["character_name"],
        iq: "",
        wl: "",
        aw: "",
        st: "",
        ag: "",
        sm: ""
      },
      () => {
        console.log("New character created! Have fun!");
      }
    );
  })
  .run();

["skill", "technique", "prayer", "weapon"].forEach(tag => {
  sheet
    .listen("change", `${tag}s`)
    .tap(`${tag}s`, ({ e, setAttrs }) => {
      let match = e.triggerName.match(/_(-[-\d\w]+)$/);
      let rowId = match[1] || "No row ID found";

      let result = {};
      result[`${tag}-id`] = rowId;
      setAttrs(result, `${tag}s`, () => {
        console.log("Row ID# updated");
      });
    })
    .run();
});

sheet
  .listen("change:technique-name", "techniques")
  .getAttrs("character_name")
  .getFields(["technique-name"], "techniques")
  .tap(({ attrSet, fieldSet, setAttrs }) => {
    console.log(attrSet);
    let charName = attrSet["character_name"];
    let techName = fieldSet.techniques["technique-name"];
    let attackMacro = `&{template:TLBattackRoll} {{name=@{character-name}}} {{move=${techName}}} %{${charName}|Move--${techName.replace(
      /\s/g,
      "-"
    )}}`;
    let damageMacro = `&{template:TLBdamageRoll} {{name=@{character-name}}} %{${charName}|Move--${techName.replace(
      /\s/g,
      "-"
    )}--Damage}`;

    let result = {};
    result["technique-attackmacro"] = attackMacro;
    result["technique-damagemacro"] = damageMacro;

    setAttrs(result, "weapons", () => {
      console.log("Technique 'Attack,' and 'Damage' macros updated");
    });
  })
  .run();

sheet
  .listen("change:prayer-name", "prayers")
  .getAttrs("character_name")
  .getFields(["prayer-name", "prayer-parent"], "prayers")
  .getFields(["skill-name", "skill-chance"], "skills")
  .tap("skills", ({ attrSet, fieldSet, setAttrs }) => {
    console.log(fieldSet);
    let charName = attrSet["character_name"];
    let prayerName = fieldSet.prayers["prayer-name"];
    let parent = fieldSet.prayers["prayer-parent"];
    let chance = fieldSet.skills
      .map(skill => {
        if (skill["skill-name"] === parent) return skill["skill-chance"];
        return false;
      })
      .filter(skill => skill);
    let attackMacro = `&{template:TLBabilityRoll} {{name=@{character-name}}} {{title=${prayerName}}} {{skill=${parent}}} {{chance=${chance}}} {{roll=[[d100cs<3cf>99]]}} %{${charName}|Move--${prayerName.replace(
      /\s/g,
      "-"
    )}}`;
    let damageMacro = `&{template:TLBdamageRoll} {{name=@{character-name}}} %{${charName}|Move--${prayerName.replace(
      /\s/g,
      "-"
    )}--Damage}`;

    let result = {};
    result["prayer-attackmacro"] = attackMacro;
    result["prayer-damagemacro"] = damageMacro;

    setAttrs(result, "weapons", () => {
      console.log("Technique 'Attack,' and 'Damage' macros updated");
    });
  })
  .run();

sheet
  .listen("change:weapon-damage", "weapons")
  .getFields(
    [
      "weapon-damage",
      "weapon-damage1",
      "weapon-damage2",
      "weapon-damage3",
      "weapon-damage1_max",
      "weapon-damage2_max",
      "weapon-damage3_max"
    ],
    "weapons"
  )
  .tap(({ fieldSet, setAttrs }) => {
    let rawDamage = fieldSet.weapons["weapon-damage"];

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

    // Prepare the parsed result
    let parsedDamage = {};
    parsedDamage["weapon-damage1"] = damageTypes[0].type;
    parsedDamage["weapon-damage1_max"] = damageTypes[0].damage;
    if (damageTypes[1]) {
      parsedDamage["weapon-damage2"] = damageTypes[1].type;
      parsedDamage["weapon-damage2_max"] = damageTypes[1].damage;
    }
    if (damageTypes[2]) {
      parsedDamage["weapon-damage3"] = damageTypes[2].type;
      parsedDamage["weapon-damage3_max"] = damageTypes[2].damage;
    }

    // Set the damage attributes...
    setAttrs(parsedDamage, "weapons", () => {
      console.log("Damage types updated to: ", parsedDamage);
    });
  })
  .run();

sheet
  .listen("change:weapon-type", "weapons")
  .getFields("weapon-type", "weapons")
  .tap(({ fieldSet, setAttrs }) => {
    let weaponType = fieldSet.weapons["weapon-type"];
    let attackMacro = "";
    let defenseMacro = "";
    let damageMacro = "";
    if (weaponType === "melee") {
      attackMacro = `&{template:TLBattackRoll} {{name=@{character-name}}} {{weapon=@{weapon-name}}} {{note=?{Note}}} ?{Maneuver
      |Swing,{{move=Swing&#125;&#125; {{attack=[[2d6+(@{swing})+(@{weapon-swing})+(@{weapon-offhand-toggle})+(?{Attack modifier&#124;+0&#125;)]]&#125;&#125;
      |Thrust,{{move=Thrust&#125;&#125; {{attack=[[2d6+(@{thrust})+(@{weapon-thrust})+(@{weapon-offhand-toggle})+(?{Attack modifier&#124;+0&#125;)]]&#125;&#125;
      |Throw,{{move=Throw&#125;&#125; {{attack=[[2d6+(@{throw})+(@{weapon-throw})+(@{weapon-offhand-toggle})+(?{Attack modifier&#124;+0&#125;)]]&#125;&#125;}`;
      defenseMacro = `&{template:TLBattackRoll} {{name=@{character-name}}} {{weapon=@{weapon-name}}} {{note=?{Note}}} ?{Maneuver
        |Parry,{{move=Parry&#125;&#125; {{defense=[[2d6+(@{parry})+(@{weapon-parry})+(@{weapon-offhand-toggle})+(?{Defense modifier&#124;+0&#125;)]]&#125;&#125;
        |Block,{{move=Block&#125;&#125; {{defense=[[2d6+(@{block})+(@{weapon-block})+(@{weapon-offhand-toggle})+(?{Defense modifier&#124;+0&#125;)]]&#125;&#125;}`;
      damageMacro = `&{template:TLBdamageRoll} {{name=@{character-name}}} {{weapon=@{weapon-name}}} {{note=?{Note}}} {{damage=?{Damage type
        |@{weapon-damage1},[[@{weapon-damage1|max}+(?{Damage modifier&#124;+0&#125;)]]&#125;&#125;  {{type=@{weapon-damage1}&#125;&#125;
        |@{weapon-damage2},[[@{weapon-damage2|max}+(?{Damage modifier&#124;+0&#125;)]]&#125;&#125; {{type=@{weapon-damage2}&#125;&#125;
        |@{weapon-damage3},[[@{weapon-damage3|max}+(?{Damage modifier&#124;+0&#125;)]]&#125;&#125; {{type=@{weapon-damage3}&#125;&#125;}`;
    }
    if (weaponType === "ranged") {
      attackMacro = `&{template:TLBattackRoll} {{name=@{character-name}}} {{weapon=@{weapon-name}}} {{move=Shoot}} {{attack=[[2d6+(@{shoot})+(@{weapon-shoot})+(?{Aimed|No,+0|Yes,@{weapon-acc}})+(?{Attack modifier|+0})]]}} {{note=?{Note}}}`;
      damageMacro = `&{template:TLBdamageRoll} {{name=@{character-name}}} {{weapon=@{weapon-name}}} {{type=Pierce}} {{damage=[[@{weapon-damage1|max}+(?{Damage modifier|+0})]]}} {{note=?{Note}}}`;
    }
    if (weaponType === "shield") {
      defenseMacro = `&{template:TLBattackRoll} {{name=@{character-name}}} {{weapon=@{weapon-name}}} {{move=Block}} {{defense=[[2d6+(@{block})+(@{weapon-block})+(?{Defense modifier|+0})]]}} {{note=?{Note}}}`;
    }

    let result = {};
    result["weapon-attackmacro"] = attackMacro;
    result["weapon-defensemacro"] = defenseMacro;
    result["weapon-damagemacro"] = damageMacro;

    setAttrs(result, "weapons", () => {
      console.log("Weapon type updated to: ", weaponType);
      console.log("'Attack,' 'Defense,' and 'Damage' macros updated");
    });
  })
  .run();

sheet
  .listen(["change", "remove"], "armor")
  .getAttrs("armor-totalweight")
  .getFields("armor-weight", "armor")
  .tap("armor", ({ attrSet, fieldSet, setAttrs }) => {
    let memo = fieldSet.armor.reduce((acc, cur) => {
      return acc + parseFloat(cur["armor-weight"], 10) || 0;
    }, 0);

    let result = {};
    result[`armor-totalweight`] = memo || 0;
    setAttrs(result, () => {
      console.log("Total armor weight updated to:", memo);
    });
  })
  .run();

sheet
  .listen(["change", "remove"], "weapons")
  .getAttrs("weapon-totalweight")
  .getFields("weapon-weight", "weapons")
  .tap("weapons", ({ attrSet, fieldSet, setAttrs }) => {
    let memo = fieldSet.weapons.reduce((acc, cur) => {
      return acc + parseFloat(cur["weapon-weight"], 10) || 0;
    }, 0);

    let result = {};
    result[`weapons-totalweight`] = memo || 0;
    setAttrs(result, () => {
      console.log("total weapons weight updated to:", memo);
    });
  })
  .run();

sheet
  .listen(["change", "remove"], "items")
  .getFields(["item-quantity", "item-weight"], "items")
  .tap("items", ({ fieldSet, setAttrs }) => {
    let memo = fieldSet.items.reduce((acc, cur) => {
      let quantity = parseFloat(cur["item-quantity"], 10) || 0;
      let weight = parseFloat(cur["item-weight"], 10) || 0;
      return acc + quantity * weight;
    }, 0);

    let result = {};
    result[`items-totalweight`] = memo || 0;
    setAttrs(result, () => {
      console.log("Total item weight updated to:", memo);
    });
  })
  .run();

sheet
  .listen([
    "change:armor-totalweight",
    "change:weapons-totalweight",
    "change:items-totalweight"
  ])
  .getAttrs(["armor-totalweight", "weapons-totalweight", "items-totalweight"])
  .tap(({ attrSet, setAttrs }) => {
    let armorweight = parseFloat(attrSet["armor-totalweight"], 10) || 0;
    let weaponsweight = parseFloat(attrSet["weapons-totalweight"], 10) || 0;
    let itemsweight = parseFloat(attrSet["items-totalweight"], 10) || 0;
    let totalweight = armorweight + weaponsweight + itemsweight || 0;

    let result = {};
    result[`combatload-cur`] = totalweight;
    setAttrs(result, () => {
      console.log("Total weight carried updated to:", totalweight);
    });
  })
  .run();

sheet
  .listen(["change:st"])
  .getAttrs(["st"])
  .tap(({ attrSet, setAttrs }) => {
    let st = attrSet.st || 0;
    let result = {};
    result["combatload-max"] = st * 5;
    setAttrs(result, () => {
      console.log("Combat Load updated to:", result["combatload-max"]);
    });
  })
  .run();

sheet
  .listen(["change:combatload-max", "change:combatload-cur"])
  .getAttrs(["combatload-max", "combatload-cur"])
  .tap(({ attrSet, setAttrs }) => {
    let max = attrSet["combatload-max"] || 0;
    let cur = attrSet["combatload-cur"] || 0;
    let lvl = 0;

    if (cur >= max * 3) lvl = 3;
    if (cur < max * 3) lvl = 2;
    if (cur < max * 2) lvl = 1;
    if (cur < max * 1) lvl = 0;

    let result = {};
    result["combatload-lvl"] = lvl;
    setAttrs(result, () => {
      console.log("Combat Encumbrance updated to:", lvl);
    });
  })
  .run();

sheet
  .listen(["change", "remove"], "otheritems")
  .listen(["change:combatload-cur"])
  .getAttrs("combatload-cur")
  .getFields(["item-quantity", "item-weight"], "otheritems")
  .tap("otheritems", ({ attrSet, fieldSet, setAttrs }) => {
    let combatLoad = parseFloat(attrSet["combatload-cur"], 10) || 0;
    let memo = fieldSet.otheritems.reduce((acc, cur) => {
      let quantity = parseFloat(cur["item-quantity"], 10) || 0;
      let weight = parseFloat(cur["item-weight"], 10) || 0;
      return acc + quantity * weight;
    }, combatLoad);

    let result = {};
    result[`travelload-cur`] = memo || 0;
    setAttrs(result, () => {
      console.log("Total travel weight updated to:", memo);
    });
  })
  .run();

sheet
  .listen(["change:sm"])
  .getAttrs(["sm"])
  .tap(({ attrSet, setAttrs }) => {
    let sm = attrSet.sm || 0;
    let result = {};
    result["travelload-max"] = sm * 10;
    setAttrs(result, () => {
      console.log("Combat Load updated to:", result["travelload-max"]);
    });
  })
  .run();

sheet
  .listen(["change:travelload-max", "change:travelload-cur"])
  .getAttrs(["travelload-max", "travelload-cur"])
  .tap(({ attrSet, setAttrs }) => {
    let max = attrSet["travelload-max"] || 0;
    let cur = attrSet["travelload-cur"] || 0;
    let lvl = 0;

    if (cur >= max * 3) lvl = 3;
    if (cur < max * 3) lvl = 2;
    if (cur < max * 2) lvl = 1;
    if (cur < max * 1) lvl = 0;

    let result = {};
    result["travelload-lvl"] = lvl;
    setAttrs(result, () => {
      console.log("Travel Encumbrance updated to:", lvl);
    });
  })
  .run();

sheet
  .listen([
    "change:health-0",
    "change:health-1",
    "change:health-2",
    "change:health-3",
    "change:health-4",
    "change:health-5"
  ])
  .getAttrs([
    "health-0",
    "health-1",
    "health-2",
    "health-3",
    "health-4",
    "health-5"
  ])
  .getAttrs(["health_max"])
  .tap(({ e, attrSet, setAttrs }) => {
    // if (e.sourceType === "sheetworker") return false;

    let source, sourceMatch, valueMatch, op;
    let value = e.newValue || "0"; // Don't parseInt() yet!
    let previousValue = parseInt(e.previousValue, 10) || 0;
    let maxHealth = parseInt(attrSet["health_max"], 10) || 0;

    if (previousValue === parseInt(e.newValue, 10)) return false;

    source = e.sourceAttribute;
    sourceMatch = source.match(/health-(\d)/);
    if (sourceMatch && sourceMatch[1]) {
      source = parseInt(sourceMatch[1], 10) || 0;
    }

    valueMatch = value.toString().match(/(-|\+)?([\d]+)/);
    if (valueMatch && valueMatch[2]) {
      value = parseInt(valueMatch[2], 10) || 0;
    }
    if (valueMatch && valueMatch[1]) {
      op = valueMatch[1];
    }

    let result = {};
    if (!op) {
      if (value > maxHealth) {
        result[`health-${source}`] = maxHealth;
      } else if (value < 0) {
        result[`health-${source}`] = 0;
      } else {
        result[`health-${source}`] = value;
      }
    } else if (op === "-") {
      let change = previousValue - value;
      result[`health-${source}`] = change;
      if (change < 0) {
        result[`health-${source}`] = 0;
        if (source + 1 <= 5) {
          result[`health-${source + 1}`] = `${change}`;
        }
      }
    } else if (op === "+") {
      let change = previousValue + value;
      result[`health-${source}`] = change;
      if (change > maxHealth) {
        result[`health-${source}`] = maxHealth;
        if (source - 1 >= 0) {
          result[`health-${source - 1}`] = `+${change - maxHealth}`;
        }
      }
    }

    setAttrs(result, () => {
      console.log("Health updated");
    });
  })
  .tap(({ attrSet, setAttrs }) => {
    let maxHealth = parseInt(attrSet["health_max"], 10) || 0;
    let health = [
      parseInt(attrSet["health-0"], 10) || 0,
      parseInt(attrSet["health-1"], 10) || 0,
      parseInt(attrSet["health-2"], 10) || 0,
      parseInt(attrSet["health-3"], 10) || 0,
      parseInt(attrSet["health-4"], 10) || 0,
      parseInt(attrSet["health-5"], 10) || 0
    ];
    health = health.reduce((acc, cur) => acc + cur);
    let woundLevel = 6 - Math.ceil(health / maxHealth);
    woundLevel = woundLevel < 6 ? woundLevel : 6;
    woundLevel = woundLevel > 0 ? woundLevel : 0;
    let result = {};
    result["wound-level"] = woundLevel;
    setAttrs(result);
  })
  .run();

sheet
  .listen("change:vigor")
  .listen("change:resolve")
  .listen("change:favor")
  .getAttrs(["vigor", "vigor_max"])
  .getAttrs(["resolve", "resolve_max"])
  .getAttrs(["favor", "favor_max"])
  .tap(({ e, attrSet, setAttrs }) => {
    if (e.sourceType === "sheetworker") return false;

    let pool = e.sourceAttribute;
    let value = e.newValue || "0"; // Don't parseInt() yet!
    let previousValue = parseInt(e.previousValue, 10) || 0;
    let maxPool = parseInt(attrSet[`${pool}_max`], 10) || 0;

    if (previousValue === parseInt(e.newValue, 10)) return false;

    let valueMatch = value.toString().match(/(-|\+)?([\d]+)/);
    if (valueMatch && valueMatch[2]) {
      value = parseInt(valueMatch[2], 10) || 0;
    }
    if (valueMatch && valueMatch[1]) {
      op = valueMatch[1];
    }

    let result = {};
    if (!op) {
      if (value > maxPool) {
        result[pool] = maxPool;
      } else if (value < 0) {
        result[pool] = 0;
      } else {
        result[pool] = value;
      }
    } else if (op === "-") {
      let change = previousValue - value;
      if (change < 0) {
        result[pool] = 0;
      } else {
        result[pool] = change;
      }
    } else if (op === "+") {
      let change = previousValue + value;
      if (change > maxPool) {
        result[pool] = maxPool;
      } else {
        result[pool] = change;
      }
    }

    setAttrs(result, () => {
      console.log(`Resource (${pool}) updated to:`, result[pool]);
    });
  })
  .run();

sheet
  .listen("change", "sessionlog")
  .getFields(["session-cap"], "sessionlog")
  .tap("sessionlog", ({ fieldSet, setAttrs }) => {
    let memo = fieldSet.sessionlog.reduce((acc, cur) => {
      let cap = parseFloat(cur["session-cap"], 10) || 0;
      return acc + cap;
    }, 0);

    let result = {};
    result[`cap-total`] = memo || 0;
    setAttrs(result, () => {
      console.log("Total CAP updated to:", memo);
    });
  })
  .run();
