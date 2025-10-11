module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }
    ],
    "react/jsx-key": "off",
    "prefer-const": "off",
    "@next/next/no-img-element": "off",
    "jsx-a11y/role-supports-aria-props": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
};
