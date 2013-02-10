jQuery ITS2.0
=============

JQuery selector plugin for the [International Tag Standard 2.0 (ITS2.0)](http://www.w3.org/TR/its20/).

With this plugin it is possible to select HTML-nodes depending on ITS markup.

This is the repository for the packed JS files.
See the [jquery-its-src](https://github.com/attrib/jquery-its2-src) repository for the original coffeescript source files.

Currently supported data categories from ITS 2.0:
* Translate
* Localization Note
* Storage Size
* Allowed Characters

Usage
-----

Get the created jquery.its-parser.min.js and link it in your project.
There are two new methods for jquery (jQuery.parseITS, jQuery.getITSData) and a new selector for each supported data category.

For all selectors parseITS has to be run once before.

### parseITS ( callback ) ###

Parse the current HTML and loads global rules. This step is important to use the selectors.
Otherwise global rules are not initialised and the selectors doesn't work.

```
$.parseITS();                   -> starts the parser
$.parseITS(function() {})       -> use callback to start working with selectors after the rules has been loaded and parsed
```

### getITSData ###

Get all the ITS Information from a specified node in the DOM.

```
$('span').getITSData()          -> get the ITS Data for this node
    returns a object
    {
      translate: yes,
      locNote: "This is a Note.",
      locNoteType: "alert",
    }

- OR -

$.getITSData('span')            -> same as above
```

### :translate ###

Selector for the [translate](http://www.w3.org/TR/its20/#trans-datacat) data category.

** For all selectors parseITS has to be run once before. **

```
$('*:translate')                -> select all nodes with translate = yes
$('*:translate(yes)')           -> select all nodes with translate = yes
$('*:translate(no)')            -> select all nodes with translate = no
```

### :locNote ###

Selector for the [localization note](http://www.w3.org/TR/its20/#locNote-datacat) data category.

** For all selectors parseITS has to be run once before. **

```
$('*:locNote')                  -> select all nodes with a any localization note
$('*:locNote(any)')             -> select all nodes with a any localization note
$('*:locNote(description)')     -> select all nodes with a localization note from type description
$('*:locNote(alert)')           -> select all nodes with a localization note from type alert
```

### :storageSize ###

Selector for the [storage size](http://www.w3.org/TR/its20/#storagesize) data category.

** For all selectors parseITS has to be run once before. **

```
$('*:storageSize')                  -> select all nodes with a any storage size
$('*:storageSize(size: 25)')        -> select all nodes with a storage size from 25
$('*:storageSize(size: >25)')       -> select all nodes with a storage size above 25 (also supported are >,!=,<)
$('*:storageSize(encoding: UTF-8)') -> select all nodes with a storage size encoding of UTF-8
$('*:storageSize(linebreak: lf)')   -> select all nodes with a storage size line break "lf"
$('*:storageSize(size: 25, linebreak: lf)') -> matching query can be combined with , (comma)
                                               everything has to be true to be returned
```

### :allowedCharacters ###

Selector for the [allowed characters](http://www.w3.org/TR/its20/#allowedchars) data category.

** For all selectors parseITS has to be run once before. **

```
$('*:allowedCharacters')        -> select all nodes with a any allowed characters
$('*:allowedCharacters([a-Z])') -> select all nodes with the specified allowed characters ([a-Z])
```

Credits
-------

* [Cocomore AG](http://www.cocomore.com)
** Karl Fritsche - [attrib](http://drupal.org/user/619702)
** Alejandro Leiva - [gloob](http://drupal.org/user/1866660)
* [MultilingualWeb-LT Working Group](http://www.w3.org/International/multilingualweb/lt/)

License
-------

[GNU General Public License, version 2](http://www.gnu.org/licenses/old-licenses/gpl-2.0.html)
