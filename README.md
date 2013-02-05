jQuery ITS2.0
=============

JQuery selector plugin for the [International Tag Standard 2.0 (ITS2.0)](http://www.w3.org/TR/its20/).

With this plugin it is possible to select HTML-nodes depending on ITS markup.

This is the repository for the packed JS files.
See the [jquery-its-src](https://github.com/attrib/jquery-its2-src) repository for the original coffeescript source files.

Usage
-----

Get the created jquery.its-parser.min.js and link it in your project.

Examples:

```
$('*:translate')                -> select all nodes with translate = yes
$('*:translate(no)')            -> select all nodes with translate = no
//TODO add more examples
```

Currently supported data categories:
* Translate
* Localization Note
* Storage Size
* Allowed Characters

Credits
-------

* [Cocomore AG](http://www.cocomore.com)
** Karl Fritsche - [attrib](http://drupal.org/user/619702)
** Alejandro Leiva - [gloob](http://drupal.org/user/1866660)
* [MultilingualWeb-LT Working Group](http://www.w3.org/International/multilingualweb/lt/)

License
-------

[GNU General Public License, version 2](http://www.gnu.org/licenses/old-licenses/gpl-2.0.html)
