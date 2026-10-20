# Packages to Install

```bash
npm i better-sqlite3 chalk cli-table3 inquirer
```

# How To Make It Standalone Application

- Run this command to use this app anywhere in your terminal along with the changes in package.json

```json
"bin": {
    "todo": "./index.js"
}
```

```bash
npm link
```

- Make sure to have this line present at the top of your index.js file

```js
#!/usr/bin/env node
```