# i18n-squish

Watch and compile language files into single locales ready to be served to angular-translate using angular-translate-loader-url. Can be used with or without Express and optinally watches files using `node-watch` to recompile upon changes.

## Usage

1. Require the package with an optional parameters object: `require('i18n-squish')(params)`.

## Options

The parameters object accepts the following properties:

1. `dir` (default: 'app/i18n'): the directory where all language files reside relative to root of project
2. `out` (default: `dir` + '/_compiled'): the directory to output compiled locale files relative to root of project
3. `endpoint` (default: '/api/lang'): the endpoint to create an Express GET route for fetching locales - this defaults to the angular-translate-loader-url default
4. `whitespace` (default: 0): number of spaces to use as whitespace in JSON.stringify call
5. `watch` (default: false): boolean indicating whether uncompiled langauge files in `dir` should be watched and recompiled upon changes
6. `express` (default: null): an Express app instance where `endpoint` should be attached

All language files should be named after their respective locale.
A language files filepath denotes the property names which will lead to it in the compiled locale file. For example, if a language file exists at `/app/i18n/routes/login/en.json`, the compiled JSON file `en.json` will contain `routes.login`.

## Example

Given the following file structure and default options:

    /app/i18n
    |
    └─ /branding
         |
         └─en.json
         └─ fr.json
    └─ /routes
         |
         └─ en.json
         └─ fr.json
    
Compiled files will be created as follows:

    /app/i18n
    |
    └─ ... 
    └─ /_compiled
         |
         └─ en.json
         └─ fr.json

Using `express: {ExpressApp}` and default `endpoint: '/api/lang'` options will mean retrieving the `en.json` file is as simple as sending a GET request to `/api/lang?lang=json`. This operation is performed automatically by angular-translate-loader-url when using `$translateProvider.useUrlLoader('/api/lang')`.

## Changelog

`1.0.1`: Express endpoint bugfix (missing `/`) and moved `app` parameter into `_opt` as Express is optional

`1.0.0`: initial release
