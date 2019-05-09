module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "globals": {
        "jb": true,
        "st": true,
        "global": true,
        "self": true,
        "module": true
    },  
    "rules": {
        "no-unused-vars": ["error", { "argsIgnorePattern": "ctx|_|e" }],
        "no-debugger": [0],
        "no-console": [0],
    }
};