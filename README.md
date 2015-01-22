# i18n-squish

Watch and compile language files into single locales ready to be served to angular-translate using angular-translate-loader-url. Can be used with or without Express and optinally watches files using `node-watch` to recompile upon changes.

## Usage

1. Require the package with an Express app and optional parameters object: `require('i18n-squish')(app, params)`.

## Options

1. `dir` (default: 'app/i18n'): the directory where all language files reside
2. `out` (default: `dir` + '/_compiled'): the directory to output compiled locale files
3. `endpoint` (default: '/api/lang'): the endpoint to create an Express GET route for fetching locales - this defaults to the angular-translate-loader-url default
4. `whitespace` (default: 0): number of spaces to use as whitespace in JSON.stringify call
5. `watch` (default: false): boolean indicating whether uncompiled langauge files in `dir` should be watched and recompiled upon changes
6. `express` (default: false): boolean indicating whether the module should create the Express endpoint defined by `endpoint`
