# htmltemplate-2-js-i18n
 

gulp plugin that translates html templates define into as a javascript object with templates as a sstring.

plugin also facilitates translations applied from translation file provided.

Write your templates in html with i18n attributes, plugin takes care of converting as javascript object by applying translations

##Usage

```js
var gulp = require('gulp');
var htmltemplate2Js = require('htmltemplate-2-js-i18n');

gulp.task('template', function() {
	return gulp.src('exampleTemplates.html' )
	.pipe(htmltemplate2Js() )
	.pipe(gulp.dest('output') );
});
```
Additional options can be passed by passing an object as the main arguments

```js
var gulp = require('gulp');
var htmltemplate2Js = require('htmltemplate-2-js-i18n');

gulp.task('template', function() {
	return gulp.src('exampleTemplates.html' )
	.pipe(htmltemplate2Js({
            "i18nfile" : "./src/i18n.json" 
        }) )
	.pipe(gulp.dest('output') );
});
```
Translations expected in the following format 

```json
{
    "en": {
        "key": "value"
    },
    "fr": {
        "key": "F value"
    }
}
```

##Examples

**template**
```html
<div id="htmlTemplates">
    <div id="test1">
        <div class="consent-content" data-i18n key='text'></div>
    </div>
</div>

```
and 

**translation file**
```json
{
    "en": {
        "text": "value"
    },
    "fr": {
        "text": "F value"
    }
}
```

**output is :**

```js
 var htmlTemplates = {"test1-en":"<div class=\"consent-content\">value</div>", 
                      "test1-fr":"<div class=\"consent-content\">F value</div>"}
```