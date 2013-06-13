Version 1.2.0 (development)
===========================

* attrib: Added Inheritance and XPath data to the tag itself (performance)
* attrib: Changed Inheritance to not use XPath at all (performance)
* attrib: Removed automatic build of XPath as its not needed everywhere (performance)
* attrib: Fixed couple of performance issues.
* attrib: Fixed XPath instances got initialized multiple times for the same element
* attrib: Added not dir operator for directionality rule.
* attrib: Added not language operator for language information rule.
* attrib: Minor changes and minor performance updates.
* attrib: Moved jQuery selectors into Rules objects to have a better separation
* attrib: Refactoring all rules to remove duplicate code
* attrib: Changed elements withing text data category to use HTML defaults.
* attrib: Changed translate data category to use HTML defaults.
* attrib: Added getITSSplitText() function.
* attrib: Added elements within text data category support.
* attrib: Added language information data category support.
* attrib: Added id value data category support.
* attrib: Added target pointer data category support.
* attrib: Added external resource data category support.
* attrib: Fixed handling of attributes in xpath
* attrib: Added provenance data category support.
* attrib: Fixed wrong usage of relative selectors in most of all pointers.
* attrib: Added MT Confidence data category support.
* attrib: Fixed wrong inheritance
* attrib: Fixed wrong number handling in jQuery selectors
* attrib: Added localization quality rating data category support.
* attrib: Added localization quality issue data category support.
* attrib: Added locale filter data category support.
* attrib: Added domain data category support.
* attrib: Added directionality data category support.
* attrib: Changing order in text analysis to be conferment with ITS 2.0 Testsuite
* attrib: Added localization note type normalization.
* attrib: Added data category terminology support.
* attrib: Fixed annotators ref inheritance bug.
* attrib: Added annotators ref support.
* attrib: Added data category text analysis support.
* attrib: Added GPL header for released javascript files
* attrib: Fixed error when using Attributes for translate data category.

Version 1.1.1
=============

* attrib: Fixed translate doesn't recognize locale data
* attrib: Added correct handling of translate in Chrome
* attrib: Fixed error when no element was given in XPath
* attrib: Fixed Bug with internal rules in a script tag Fixed allowedCharacters doesn't work
* attrib: Fixed problem with translate=false local attribute Fixed not a string error in translate rule normalizer
* attrib: Added getITSData method
* attrib: Added locNote, allowedCharacters, storageSize selectors
* attrib: Added better README
* attrib: Added phantomJS dependency
* attrib: Using phantomJS to create output of implementors automatically
* attrib: Added update script Testsuite.html

Version 1.0.0
=============

* gloob: Adding VERSION file.
* gloob: Adding build directory.
* gloob: updating headers.
* gloob: Fixing authors.
* gloob, attrib: Initial commit
  Integration of translate, localization note, storage size and allowed
  characters data categories.
