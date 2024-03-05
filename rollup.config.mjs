import pkg from "./package.json" assert { type: "json" }; 
import typescript from "@rollup/plugin-typescript";
export default {
  input: "./src/index.ts",
  output: [
    {
      file: pkg.ejs,
      // file: "./lib/ejs.js",
      format: "cjs"
    },
    {
      file: pkg.esm,
      // file: "./lib/esm.js",
      format: "es"
    }
  ],
  plugins: [typescript()]
};
