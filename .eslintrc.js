module.exports = {
    env: {
        browser: true,
        node: true,
        es2021: true,
    },

    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:node/recommended",
        "plugin:prettier/recommended",
    ],

    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
        tabWidth: 4,
    },

    rules: {
        "prettier/prettier": "error",

        // Rules for React
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",

        // Rules for Node.js
        "node/no-unsupported-features/es-syntax": "off",

        // no console log in production
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",

        "brace-style": ["error", "1tbs", { allowSingleLine: false }],
    },

    settings: {
        react: {
            version: "detect",
        },
    },
};

if (0) {
    console.log("2");
} else {
    console.log("1");
}
