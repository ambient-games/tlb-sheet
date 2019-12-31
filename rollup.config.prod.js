import svelte from "rollup-plugin-svelte";
import ssr from "rollup-plugin-svelte-ssr";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import fs from "fs";
import path from "path";
import write from "write";
import { name } from "./package.json";

import { postcss, globalStyle } from "svelte-preprocess";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/Main.svelte",
  output: {
    format: "cjs",
    file: "dist/ssr.js"
  },
  plugins: [
    svelte({
      generate: "ssr",
      preprocess: [
        postcss({
          plugins: [
            require("postcss-preset-env")({
              features: { "nesting-rules": true }
            }),
            require("autoprefixer")()
          ]
        }),
        globalStyle()
      ]
    }),

    ssr({
      fileName: "README.md",
      skipEmit: true,
      configureExport: (html, css) => {
        const fileName = name;

        // Load sheet scripts
        let sheetJs = fs.readFileSync(
          path.resolve("./src/scripts/index.js"),
          "utf8"
        );

        // Create output html file
        let sheetHtml = [
          html.replace(/svelte-/g, "sheet-").replace(/\\n/g, ""),
          `<script type="text/worker">${sheetJs}<\/script>`
        ].join("");

        write("./dist/" + fileName + ".html", sheetHtml, err => {
          if (err) throw err;
        });

        // Create output css file
        let sheetCss = css.replace(/svelte-/g, "sheet-");
        write("./dist/" + fileName + ".css", sheetCss, err => {
          if (err) throw err;
        });

        return require("./lib/generateReadme.js");
      }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({
      browser: true,
      preferBuiltins: true,
      dedupe: importee =>
        importee === "svelte" || importee.startsWith("svelte/")
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `lib` directory and refresh the
    // browser on changes when not in production
    !production && livereload("lib"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true
        });
      }
    }
  };
}
