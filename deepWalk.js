// Adapted from https://stackoverflow.com/a/5827895
module.exports = function(dir, done) {
    deepWalk(dir, done);

    function deepWalk(dir, done) {
        var fs = require('fs'),
            results = [],
            list = fs.readdirSync(dir),
            i = 0;

        (function next() {
            var file = list[i++];

            if(!file) {
                return done(null, results);
            }

            file = dir + '/' + file;

            var stat = fs.statSync(file);
            if(stat && stat.isDirectory()) {
                deepWalk(file, function(err, res) {
                    results = results.concat(res);
                    next();
                });
            } else {
                results.push(file);
                next();
            }
        })();
    };
};