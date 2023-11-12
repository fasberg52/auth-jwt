module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true, // Add Node.js environment
  },
  extends: ["airbnb-base"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 12, // Specify the ECMAScript version
    sourceType: "module", // Use 'module' for ES6 modules
  },
  rules: {},
};
