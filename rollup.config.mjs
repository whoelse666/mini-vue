// import pkg from "./package.json" assert { type: "json" }; 
import typescript from "@rollup/plugin-typescript";
export default {
  // input: "./src/index.ts",
  input: "./packages/vue/src/index.ts",
  output: [
    {
      format: "cjs",
      file: "packages/vue/dist/mini-vue.cjs.js"
    },
    {
      format: "es",
      file: "packages/vue/dist/mini-vue.esm.js"
    }
    /*   {
      file: pkg.cjs,
      // file: "./lib/ejs.js",
      format: "cjs"
    },
    {
      file: pkg.esm,
      // file: "./lib/esm.js",
      format: "es"
    } */
  ],
  plugins: [typescript()]
};
