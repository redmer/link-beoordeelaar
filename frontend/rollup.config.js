import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/index.tsx",
  output: {
    file: "./dist/bundle.min.js",
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      preventAssignment: true,
    }),
    typescript({ tsconfig: "./tsconfig.json" }),
    nodeResolve({ browser: true, extensions: [".js", ".jsx", ".ts", ".tsx"] }),
    commonjs(),
  ],
};
