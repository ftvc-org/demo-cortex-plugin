# Demo Plugin

Demo Plugin is a [Cortex](https://www.cortex.io/) plugin. To see how to run the plugin inside of Cortex, see [our docs](https://docs.cortex.io/docs/plugins).

### Prerequisites

Developing and building this plugin requires either [yarn](https://classic.yarnpkg.com/lang/en/docs/install/) or [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

## Getting started

1. Run `yarn` or `npm install` to download all dependencies
2. Run `yarn build` or `npm run build` to compile the plugin code into `./dist/ui.html`
3. Upload `ui.html` into Cortex on a create or edit plugin page
4. Add or update the code and repeat steps 2-3 as necessary

### Notable scripts

The following commands come pre-configured in this repository. You can see all available commands in the `scripts` section of [package.json](./package.json). They can be run with npm via `npm run {script_name}` or with yarn via `yarn {script_name}`, depending on your package manager preference. For instance, the `build` command can be run with `npm run build` or `yarn build`.

- `build` - compiles the plugin. The compiled code root is `./src/index.tsx` (or as defined by [webpack.config.js](webpack.config.js)) and the output is generated into `dist/ui.html`.
- `test` - runs all tests defined in the repository using [jest](https://jestjs.io/)
- `lint` - runs lint and format checking on the repository using [prettier](https://prettier.io/) and [eslint](https://eslint.org/)
- `lintfix` - runs eslint in fix mode to fix any linting errors that can be fixed automatically
- `formatfix` - runs Prettier in fix mode to fix any formatting errors that can be fixed automatically

## Styling your plugin

The Cortex UI allows for custom brand colors, and has a light/dark mode switcher. We expose CSS variables to your plugin
so you may match the current theme. These styles are injected into your plugin iframe once we receive an `init` message
via plugin-core, and are re-injected each time the theme is changed (such as dark mode switch).

The CSS variables are documented within the demo app in this project. If your plugin requires additional theme
information, please reach out to Cortex to see about having it added!

### Plugin init

Mentioned above, we inject styles once the `init` message is received. This is necessary due to constraints with
iframes. To reduce a "flash of unstyled content", it is important that your plugin sends the init message as soon as possible. Avoid calling `init` within library code, and instead keep it at the top level of your scripts so it runs once
the plugin loads in the browser.
