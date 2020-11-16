# Auto-include

This module is used for injecting required scripts into Verge3D's
`visual-logic.js` file for extended usage of online exhibition: **Xpomania**.

There are two modes, one is no watcher, one is with watcher. Watcher will
automatically
detect changes on `visual-logic.js` file(s) on directory.

## Prerequisite(s)
- Having Node.js v10 and above is required.
- Set the `TARGET_DIRECTORY` variable on `app.js` file, make sure it points to
the booth(s) directory

## Installing
Just run following command:
```js
npm install
```

## Production (no watcher)
```js
npm run deploy
```

## Development/Production (with watcher)
```js
npm run start
```

Enjoy!
