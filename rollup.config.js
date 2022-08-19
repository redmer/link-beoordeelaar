import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./src/index.js",
  output: {
    file: "./build/bundle.min.js",
    format: "es",
    name: "bundle",
    generatedCode: "es2015",
  },
  plugins: [nodeResolve()],
};
