# WeVoteSafely

Website for wevotesafely.org.

## Base Dependencies

- [Install Node.js:](https://nodejs.org/)
- [Install Gulp-CLI:](https://gulpjs.com/), `npm install gulp-cli -g`


## NPM Modules

- `cd` into the root directory containing 'package.json'
- Install dependencies: `npm install`


## Workflow

All development work should be done in the 'src' directory. Use the gulp commands below for running the project locally and compiling for production.


## Gulp Commands

- `gulp` : Default task packages all files for delivery to staging or production, and outputs to a 'prod' folder. Copies all static assets, lints and compiles javascript, lints and compiles SASS, optimizes JS and CSS.
- `gulp --dev` : Same as default gulp command minus JS and CSS optimization, and outputs to a 'dev' folder. Runs a local static server with automatic live-reloading, watches all files for changes.


## NPM scripts

- `npm run build` : npm script alias for `gulp`
- `npm start` : npm script alias for `gulp --dev`
