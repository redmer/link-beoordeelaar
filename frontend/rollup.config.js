import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/index.ts",
  output: {
    file: "./build/bundle.min.js",
    format: "es",
    name: "bundle",
    generatedCode: "es2015",
  },
  plugins: [typescript(), nodeResolve()],
};
