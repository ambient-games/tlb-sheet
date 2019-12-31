class AmbientSheetWorkers {
  constructor(ver = "0.0.0") {
    this.__version = ver;
    this.__toolbox = this.util();

    this.__ctx = {};
    this.__ctx.reset = () => {
      this.__ctx.triggers = [];
      this.__ctx.attrNames = [];
      this.__ctx.fieldNames = [];
      this.__ctx.sectionNames = [];
      this.__ctx.operations = [];
    };
    this.__ctx.addTrigger = trigger => {
      this.__ctx.triggers.push(trigger);
    };
    this.__ctx.addSection = sectionName => {
      this.__ctx.sectionNames.push(sectionName);
    };
    this.__ctx.addFieldName = fieldName => {
      this.__ctx.fieldNames.push(fieldName);
    };
    this.__ctx.addAttrName = attrName => {
      this.__ctx.attrNames.push(attrName);
    };
    this.__ctx.addOperation = op => {
      this.__ctx.operations.push(op);
    };

    // Return 'this' for chaining...
    return this;
  }

  get version() {
    return this.version;
  }

  get toolbox() {
    return this.__toolbox;
  }

  get ctx() {
    return this.__ctx;
  }

  /* ---------------------------------------------------------------------------
   *  Data Collectors
   * ------------------------------------------------------------------------ */
  listen(triggers, sectionName = false) {
    if (!triggers) {
      throw new Error(
        "'listen()' must be called with an 'triggers' argument in the form of a String or an Array<String>."
      );
    }

    // If there are no 'ctx.triggers', reset 'ctx'...
    if (!this.ctx.triggers) this.ctx.reset();

    // Coerce 'triggers' into an Array...
    if (triggers && _.isString(triggers)) triggers = triggers.split(" ");

    // Handle if the name of a repeating section was provided...
    if (sectionName && _.isString(sectionName)) {
      triggers = triggers.map(trigger => {
        trigger = trigger.split(":");
        if (!trigger[1]) {
          return `${trigger[0]}:repeating_${sectionName}`;
        } else {
          return `${trigger[0]}:repeating_${sectionName}:${trigger[1]}`;
        }
      });
    }

    // Add each 'trigger' to 'ctx'...
    triggers.forEach(trigger => {
      this.ctx.addTrigger(trigger);
    });

    // Return 'this' for chaining...
    return this;
  }

  getAttrs(attrNames) {
    // Coerce 'attrNames' into an Array...
    if (attrNames && _.isString(attrNames)) attrNames = [attrNames];

    // Add each 'attrName' to 'ctx'...
    attrNames.forEach(name => {
      this.ctx.addAttrName(name);
    });

    // Return 'this' for chaining...
    return this;
  }

  getFields(fieldNames, sectionName) {
    if (!fieldNames || !sectionName) {
      throw new Error(
        "'getFields()' must receive both 'fieldNames' and 'sectionName' arguments."
      );
    }

    // Coerce 'fieldNames' into an Array...
    if (fieldNames && _.isString(fieldNames)) fieldNames = [fieldNames];

    // Combine each 'fieldName' with the 'sectionName'...
    if (sectionName && _.isString(sectionName)) {
      fieldNames = fieldNames.map(field => {
        return `repeating_${sectionName}_${field}`;
      });
    }

    // Add each 'attrName' to 'ctx'...
    fieldNames.forEach(name => {
      this.ctx.addFieldName(name);
    });

    // Return 'this' for chaining...
    return this;
  }

  getRows(sectionName) {
    if (!sectionName || !_.isString(sectionName)) {
      throw new Error("'getRows()' must receive a 'sectionName' argument.");
    }

    // Add 'sectionName' to 'ctx'...
    this.ctx.addSection(sectionName);

    // Return 'this' for chaining...
    return this;
  }

  /* ---------------------------------------------------------------------------
   * Operations
   * ------------------------------------------------------------------------ */
  tap(func) {
    if (!_.isFunction(func)) {
      throw new Error("'tap()' must receive a function.");
    }

    // Register the tap operation.
    this.ctx.addOperation({
      type: "tap",
      func: func
    });

    // Return 'this' for chaining...
    return this;
  }

  each(sectionName, func) {
    if (!_.isFunction(func)) {
      throw new Error("'each()' must receive a function.");
    }

    // Register the tap operation.
    this.ctx.addOperation({
      type: "each",
      section: sectionName,
      func: func
    });

    // Return 'this' for chaining...
    return this;
  }

  reduce(sectionName, func) {
    if (!_.isFunction(func)) {
      throw new Error("'reduce()' must receive a function.");
    }

    // Register the tap operation.
    this.ctx.addOperation({
      type: "reduce",
      section: sectionName,
      func: func,
      memo: _.noop
    });

    // Return 'this' for chaining...
    return this;
  }

  run() {
    // Collect the data...
    let triggers = this.ctx.triggers;
    let attrNames = this.ctx.attrNames;
    let fieldNames = this.ctx.fieldNames;
    let operations = this.ctx.operations;

    // Run the operations...
    on(triggers.join(" "), e => {
      getAttrs(_.union(attrNames, fieldNames), values => {
        let attrSet;
        let fieldSet;

        // Build the 'attrSet'...
        values = Object.entries(values);
        attrSet = values.filter(([key, val]) => {
          return !key.includes("repeating_");
        });
        attrSet = Object.fromEntries(attrSet);

        // Build the 'fieldSet'...
        // Note that if we're not inside a repeating section when
        // 'fieldSet' is being built, all fields will be empty.
        fieldSet = {};
        values
          .filter(([key, val]) => {
            return key.includes("repeating_");
          })
          .forEach(([key, val]) => {
            let match = key.match(/^repeating_([\w\d-]+)_[\w\d]+-([\w\d-]+)/);
            let section = match[1] ? match[1] : false;
            let field = match[2] ? match[2] : false;

            if (!fieldSet[section]) fieldSet[section] = {};
            fieldSet[section][field] = val;
          });

        // Run the operations...
        operations.forEach(op => {
          try {
            switch (op.type) {
              case "tap":
                _.partial(op.func, {
                  attrSet,
                  fieldSet,
                  setAttrs: _.partial(this.toolbox.setAttrs, {})
                })();
                break;
              case "each":
                getSectionIDs(op.section, sectionIds => {
                  // Compile the 'rowSet'...
                  sectionIds.forEach((rowId, i) => {
                    _.partial(op.func, {
                      attrSet,
                      fieldSet,
                      rowId: rowId,
                      rowNum: i,
                      getFields: _.partial(this.toolbox.getFields, {
                        section: op.section,
                        rowId: rowId
                      }),
                      setAttrs: _.partial(this.toolbox.setAttrs, {
                        section: op.section,
                        rowId: rowId
                      })
                    })();
                  });
                });
                break;
            }
          } catch (err) {
            if (err) throw new Error(`'${op.type}()' failed with error: `, err);
            throw new Error(`'${op.type}()' failed`);
          }
        });
      });
    });

    // Return and end the chain...
    this.ctx.reset();
    return false;
  }

  util() {
    return {
      setAttrs: (ctx, attrs, ...args) => {
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

      getFields: (ctx, fieldNames, func) => {
        if (!fieldNames) {
          throw new Error(
            "'getFields()' must receive a 'fieldNames' argument."
          );
        }

        // Coerce 'fieldNames' into an Array...
        if (fieldNames && _.isString(fieldNames)) fieldNames = [fieldNames];

        // Combine each 'fieldName' with the 'rowId' and 'sectionName'...
        if (
          ctx.section &&
          ctx.rowId &&
          _.isString(ctx.section) &&
          _.isString(ctx.rowId)
        ) {
          fieldNames = fieldNames.map(field => {
            return `repeating_${ctx.section}_${ctx.rowId}_${field}`;
          });
        }

        getAttrs(fieldNames, values => {
          let innerFieldSet = {};

          values = Object.entries(values);
          values.forEach(([key, val]) => {
            let match = key.match(/^repeating_([\w\d-]+)_[\w\d]+-([\w\d-]+)/);
            let field = match[2] ? match[2] : false;
            innerFieldSet[field] = val;
          });
          _.partial(func, { innerFieldSet })();
        });
      }
    };
  }
}

// Pseudo-code:
// const sheet = new AmbientSheetWorkers;
//
// sheet.listen(eventNames<Array>|eventName<String>)
//      .getAttrs(attrNames<Array>|attrName<String>)
//      .tap(({attrSet}) => {
//        ...
//      })
//      .run();

// sheet.listen(...)
//      .getSection(sectionName<String>)
//      .getFields(fieldNames<Array>|field<String>)
//      .tap(({rowSet}) => {
//         ...
//      })
//      .map(({rowSet}) => {
//         ...
//      })
//      .run()

const sheet = new AmbientSheetWorkers();

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
    let rawDamage = fieldSet.weapons.damage;

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
    let weaponType = fieldSet.weapons.type;

    let macro = "";
    if (weaponType === "melee") macro = "@{weapon-meleemacro}";
    if (weaponType === "ranged") macro = "@{weapon-rangedmacro}";
    if (weaponType === "shield") macro = "@{weapon-shieldmacro}";

    let result = {};
    result["weapon-attackmacro"] = macro;

    setAttrs(result, "weapons", () => {
      console.log("Attack macro updated to: ", macro);
    });
  })
  .run();

sheet
  .listen(["change", "remove"], "armor")
  .listen(["change", "remove"], "weapons")
  .listen(["change", "remove"], "items")
  .getAttrs("armor-totalweight")
  .each("armor", ({ rowNum, attrSet, getFields, setAttrs }) => {
    getFields("armor-weight", ({ innerFieldSet }) => {
      console.log("innerFieldSet:", innerFieldSet);
      console.log("rowNum:", rowNum);
      let memo;
      if (rowNum && rowNum === 0) {
        memo = 0;
      } else {
        memo = parseFloat(attrSet["armor-totalweight"], 10) || 0;
      }
      memo += parseFloat(innerFieldSet.weight, 10) || 0;

      let result = {};
      result[`armor-totalweight`] = memo;
      setAttrs(result, "armor", () => {
        console.log("Armor total weight updated to:", memo);
      });
    });
  })
  .run();

sheet
  .listen([
    "change:armor-totalweight",
    "change:weapons-totalweight",
    "change:items-totalweight"
  ])
  .getAttrs(
    ["armor-totalweight", "weapons-totalweight", "items-totalweight"],
    ({ attrSet, setAttrs }) => {
      let armorweight = parseFloat(attrSet["armor-totalweight"], 10) || 0;
      let weaponsweight = parseFloat(attrSet["weapons-totalweight"], 10) || 0;
      let itemsweight = parseFloat(attrSet["items-totalweight"], 10) || 0;

      setAttrs({
        ["combatload-cur"]: armorweight + weaponsweight + itemsweight
      });
    }
  )
  .run();
