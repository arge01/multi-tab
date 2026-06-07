const path = require("path");

module.exports = {
  base: "/",
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "../src"),
      },
    ],
  },
  esbuild: {
    jsx: "automatic",
  },
};
