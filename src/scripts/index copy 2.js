class AmbientSheetWorkers {
  constructor(ver, opts = {}) {
    if (!(this instanceof AmbientSheetWorkers)) {
      throw new Error(
        "'AmbientSheetWorkers' needs to be called with the new keyword"
      );
    }
    if (!ver) {
      throw new Error("No version number supplied to 'AmbientSheetWorkers'");
    }

    this.ctx = this.init.call(this, ver);
    return this;
  }

  get version() {
    return this.ctx.version;
  }

  get toolbox() {
    return this.ctx.toolbox;
  }

  init(ver) {
    return {
      version: ver,
      toolbox: this.util.call(this)
    };
  }

  registerUpdate(updateVersion, updateHandler = false) {
    console.log("registerUpdate() called!");
    if (!updateHandler) {
      updateHandler = (ctx, updateVersion) => {
        console.log(
          `Updates for version '${updateVersion}' completed. No changes necessary.`
        );
      };
    }
    if (!_.isObject(this.registeredUpdates)) {
      this.registeredUpdates = {};
    }
    this.registeredUpdates[updateVersion] = updateHandler.bind(
      null,
      this,
      updateVersion
    );

    return this;
  }

  updateSheet(sheetVersion) {
    console.log("updateSheet() called!");
    const { checkVersion } = this.toolbox;
    const registeredUpdates = this.registeredUpdates;

    for (const updateVersion in registeredUpdates) {
      if (
        checkVersion(sheetVersion, this.version) &&
        checkVersion(sheetVersion, updateVersion)
      ) {
        try {
          let updated = registeredUpdates[updateVersion]();
          if (updated) {
            this.setAttrs({ sheet_ver: updateVersion });
            console.log(
              `Sheet successfully updated to version '${updateVersion}'`
            );
          }
        } catch {
          console.log(
            `Update failed at version '${updateVersion}' with error: `,
            err
          );
          throw new Error(err);
        }
      }
    }
  }

  on(...args) {
    // Grab the arguments...
    let triggers = args[0] || false;
    let sectionName = false;
    let cb = false;

    if (args.length === 2 && _.isFunction(args[1])) {
      cb = args[1];
    } else if (
      args.length === 3 &&
      _.isString(args[1]) &&
      _.isFunction(args[2])
    ) {
      sectionName = args[1];
      cb = args[2];
    }

    // Sanitize the 'triggers' prop...
    if (triggers && _.isString(triggers)) {
      triggers = triggers.split(" ");
    }

    // Handle if the name of a repeating section is provided...
    if (sectionName && _.isString(sectionName)) {
      triggers = triggers.map(trigger => {
        trigger = trigger.split(":");
        return `${trigger[0]}:repeating_${sectionName}:${trigger[1]}`;
      });
    }

    // Call roll20's version of 'on()'...
    if (cb) on(triggers.join(" "), cb);
    else throw new Error("No callback function provided to 'on()'");
  }

  getAttrs(attrs, cb) {
    if (attrs && _.isString(attrs)) attrs = [attrs];
    return getAttrs(attrs, cb);
  }

  setAttrs(values, opts = {}, cb = false) {
    if (cb && _.isFunction(cb)) {
      return setAttrs(values, opts, cb);
    } else {
      return setAttrs(values, opts);
    }
  }

  util() {
    return {
      /**
       * Compares two semantic version numbers.
       * @param {String} ver1 The 'old' version number (i.e. '1.0.2')
       * @param {String} ver2 The 'new' version number (i.e. '1.0.3')
       * @returns Returns true only if <ver1> is younger than <ver2>.
       */
      checkVersion: (ver1, ver2) => {
        ver1 = ver1
          .split(".")
          .map(s => s.padStart(10))
          .join(".");
        ver2 = ver2
          .split(".")
          .map(s => s.padStart(10))
          .join(".");
        return ver1 < ver2;
      }
    };
  }
}

const sheet = new AmbientSheetWorkers("1.2.0", {
  // Sheet options go here
});

console.log("=====> Sheet init'd: ", sheet);

sheet.on("sheet:opened", e => {
  console.log("Sheet opened", e);

  sheet.getAttrs("sheet_ver", attrs => {
    sheet
      .registerUpdate("0.0.1", (ctx, updateVersion) => {
        console.log("called from registered update: ", updateVersion);
        console.log("Update ctx: ", ctx);
        console.log("Update version: ", updateVersion);
        return true;
      })
      .updateSheet(attrs.sheet_ver);
  });
});

sheet.on("change:weapon-damage", "weapons", e => {
  sheet.getAttrs(
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
      sheet.setAttrs(parsedDamage);
    }
  );
});

// Pseudo-code:
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
