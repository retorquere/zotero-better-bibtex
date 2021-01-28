module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "prettier",
        "prettier/@typescript-eslint",
        "zotero-plugin",
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/member-ordering": "off",
        "max-classes-per-file": "off",
        "no-console": "off",
        "no-new-func": "off"
    }
};
