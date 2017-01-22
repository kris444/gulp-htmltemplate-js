var _ = require('lodash');
var gutil = require('gulp-util');
var through = require('through2');
var cheerio = require("cheerio");
var fs = require("fs");

const PLUGIN_NAME = 'gulp-htmltemplate-js';
module.exports = function (options) {
    var defaultOptions = {
        'ext': 'js'
    };

    if (!options) {
        options = defaultOptions
    }
    options.ext = options.ext === undefined ? defaultOptions.ext : options.ext;
    return through.obj(function (chunk, enc, callback) {
        if (chunk.isNull()) {
            callback(null, chunk);
            return;
        }

        if (chunk.isStream()) {
            var error = new gutil.PluginError(PLUGIN_NAME, 'Streaming error', { showStack: true });
            callback(error);
            return;
        }

        if (chunk.isBuffer()) {
            var t = translateTemplate(chunk, options);
            chunk.contents = new Buffer(_.template('var htmlTemplates = <%= htmlTemplates %>')({ htmlTemplates: JSON.stringify(t) }));
        }

        chunk.path = chunk.path.replace(/\.\w+$/gi, '.' + options.ext);
        this.push(chunk);
        return callback();
    });
};

function translateTemplate(chunk, options) {
    var cheerioProp = {
        withDomLvl1: true,
        normalizeWhitespace: true,
        xmlMode: false,
        decodeEntities: true
    };
    var $ = cheerio.load(chunk.contents.toString(), cheerioProp);
    var translations = options.i18nfile ? JSON.parse(fs.readFileSync(options.i18nfile)) : null;
    var data = {};
    $('#htmlTemplates').children().each(function (i, element) {
        var id = $(element).attr('id');
        if (translations) {
            for (var lan in translations) {
                var node = cheerio.load($(element).html());
                node('*[data-i18n]').each(function (i, e) {
                    var key = node(e).attr('key');
                    if (key !== undefined) {
                        node(e).prepend(translations[lan][key]);
                    }
                    node(e).removeAttr('key');
                    node(e).removeAttr('data-i18n');
                })

                var text = node.html();
                text = text.replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"');
                data[id + '-' + lan] = text;
            }
        }
        else {
            var text = $(element).html();
            text = text.replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"');
            data[$(element).attr('id')] = text;
        }
    });

    return data;
}