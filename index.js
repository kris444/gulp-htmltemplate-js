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
			var cheerioProp = {
				withDomLvl1: true,
				normalizeWhitespace: true,
				xmlMode: false,
				decodeEntities: true
			};
			var $ = cheerio.load(chunk.contents.toString(), cheerioProp);
			var t = translateTemplate($, options);
			chunk.contents = new Buffer(_.template('var htmlTemplates = <%= htmlTemplates %>')({ htmlTemplates: JSON.stringify(t) }));
		}

		chunk.path = chunk.path.replace(/\.\w+$/gi, '.' + options.ext);
		this.push(chunk);
		return callback();
	});
};

function translateTemplate($, options) {

	var translations = options.i18nfile ? JSON.parse(fs.readFileSync(options.i18nfile)) : null;
	var data = {};
	$('#htmlTemplates').children().each(function (i, element) {
		if (translations) {
			for (var lan in translations) {
				$('*[data-i18n]').each(function (i, e) {
					var key = $(e).attr('key');
					if (key !== undefined) {
						$(e).text(translations[lan][key]);
					}
				})

				var text = $(element).html();
				text = text.replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"');
				data[$(element).attr('id') + '-' + lan] = text;
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
