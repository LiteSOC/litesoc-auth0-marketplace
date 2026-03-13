import js from "@eslint/js";

export default [
  js.configs.recommended,
  // Action files — Auth0 Node 18 runtime globals
  {
    files: ["integration/**/integration.action.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        module: "readonly",
        exports: "writable",
        require: "readonly",
        process: "readonly",
        global: "readonly",
        Buffer: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": ["error", { "args": "none" }],
    },
  },
  // Spec files — Jest test environment globals
  {
    files: ["integration/**/*.spec.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        module: "readonly",
        require: "readonly",
        global: "writable",
        console: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
