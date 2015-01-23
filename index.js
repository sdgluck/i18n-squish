module.exports = function(_opt) {
    var fs = require('fs'),
        deepWalk = require('./deepWalk'),
        watch = require('node-watch');

    // Default settings:
    var opt = {
        dir: 'app/i18n',
        endpoint: '/api/lang',
        whitespace: 0,
        watch: false,
        express: false,
        fetch: null
    };

    // Perform mixin of user settings:
    if(_opt && typeof _opt === 'object') {
        for(var optName in _opt) {
            opt[optName] = _opt[optName];
        }
    } else if(_opt && typeof _opt !== 'object') {
        throw new Error('`opt` is not an object');
    }

    if(opt.fetch && typeof opt.fetch !== 'function') {
        throw new Error('`fetch` must be a function');
    }

    opt.dir = strip(opt.dir);
    opt.out = strip(opt.out || opt.dir + '/_compiled');

    compile(function() {
        opt.watch && watch(opt.dir, compile);

        if(opt.express) {
            opt.express.get(opt.endpoint, function(req, res) {
                if(!req.query.lang) {
                    res.status(500).send('`lang` undefined');
                    return;
                }

                try {
                    res.send(fetchLocale(req.query.lang));
                } catch(err) {
                    res.status(404).send();
                }
            });
        }
    });

    /*******************************************************************************************************************
     * UTILITY *
     ***********/

    /**
     * Removing a trailing forward/backward slash from a string.
     * @param str
     */
    function strip(str) {
        return (['/', '\\'].indexOf(str[str.length - 1]) !== -1) ? str.substr(0, str.length - 1) : str;
    }

    /**
     * Create a directory if does not exist, otherwise delete all its contents.
     * @param dir
     */
    function createOrCleanDir(dir) {
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        } else {
            fs.readdirSync(dir).forEach(function(file) {
                var curPath = dir + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) {
                    createOrCleanDir(curPath);
                } else {
                    fs.unlinkSync(dir + '/' + file);
                }
            });
        }
    }

    /**
     * Remove double quotes from a string.
     * @param str string
     */
    function prop(str) {
        return str.replace(/"/g, '');
    }

    /**
     * Compile all .json files within `opt.dir` into a single, shared locale file. The structure of the compiled file
     * follows the structure of the filesystem.
     * @param done callback
     */
    function compile(done) {
        done = (typeof done === 'function') ? done : function() {};

        var locales = {};

        createOrCleanDir(opt.out);

        deepWalk(opt.dir, function(err, files) {
            if(err) {
                throw err;
            }

            var i;

            for(i = 0; i < files.length; i++) {
                var components = files[i].replace(opt.dir + '/', '').split('/'),
                    filename = components[components.length - 1],
                    localeName = filename.replace('.json', ''), // Remove file ext. for locale name
                    struct = '{', // Stringy JSON to be built and parsed later
                    fullStruct,
                    j;

                if(filename.indexOf('.json') > -1) {
                    if(!locales[localeName]) {
                        locales[localeName] = {};
                    }
                } else {
                    console.log('ignoring \'' + files[i] +'\': file is not .json');
                    continue;
                }

                // Create new nested objects for each component of the filepath:
                for(j = 0; j < components.length; j++) {
                    // If at the last component of the filepath, read in and append the JSON:
                    if(j === components.length - 1) {
                        struct += fs.readFileSync(files[i]);
                    }

                    // Or, if at last component but one do not include opening brace as this
                    // will be read in by fs:
                    else if(j === components.length - 2) {
                        struct += '"' + prop(components[j]) + '":';
                    }

                    // Or, start a new object property with following brace:
                    else {
                        struct += '"' + prop(components[j]) + '":{';
                    }
                }

                // Close all nested objects. We use `struct.length - 1` here as one of the closing braces is
                // supplied by the locale file read in with fs:
                for(j = 0; j < components.length - 1; j++) {
                    struct += '}';
                }

                try {
                    // Parse generated stringy JSON into an actual object:
                    fullStruct = JSON.parse(struct);
                } catch(err) {
                    console.log('ignoring \'' + files[i] + '\': parsing failed');
                    continue;
                }

                (function merge(obj1, obj2) {
                    for(var prop in obj2) {
                        if(typeof obj1[prop] !== 'undefined') {
                            merge(obj1[prop], obj2[prop]);
                        } else {
                            obj1[prop] = obj2[prop];
                        }
                    }
                })(locales[localeName], fullStruct);
            }

            // Write each locale to the filesystem:
            for(var locale in locales) {
                var stringy = JSON.stringify(locales[locale], null, opt.whitespace),
                    fd = fs.openSync(opt.out + '/' + locale + '.json', 'w');

                fs.writeSync(fd, stringy);
                fs.closeSync(fd);
            }

            done();
        });
    }

    /*******************************************************************************************************************
     * RETURN *
     **********/

    /**
     * Read and return a compiled locale.
     * @param locale name of locale to read
     * @param done callback
     */
    var fetchLocale = opt.fetch || function(locale) {
            try {
                return require(process.cwd() + '/' + opt.out + '/' + locale + '.json');
            } catch(err) {
                throw new Error('locale does not exist');
            }
        };

    return fetchLocale;
};