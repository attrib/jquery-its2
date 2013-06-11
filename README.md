jQuery ITS2.0
=============

**This the current development version and not yet stable. This Version supports all data categories and hopefully will be releases soon.** (2013-06-06)

JQuery selector plugin for the [International Tag Standard 2.0 (ITS2.0)](http://www.w3.org/TR/its20/).

With this plugin it is possible to select HTML-nodes depending on ITS markup.

This is the repository for the packed JS files.
See the [jquery-its-src](https://github.com/attrib/jquery-its2-src) repository for the original coffeescript source files.

Currently supported data categories from ITS 2.0: (all)
* [Translate](#translate)
* [Localization Note](#locnote)
* [Storage Size](#storagesize)
* [Allowed Characters](#allowedcharacters)
* [Text Analysis](#textanalysis)
* [Terminology](#terminology)
* [Directionality](#dir)
* [Domain](#domain)
* [Locale Filter](#localefilter)
* [Localization Quality Issue](#locqualityissue)
* [Localization Quality Rating](#locqualityrating)
* [MT Confidence](#mtcnfidence)
* [Provenance](#provenance)
* [External Resource](#externalresource)
* [Target Pointer](#targetpointer)
* [ID Value](#idvalue)
* [Language Information](#lang)
* [Elements Within Test](#withinText)

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
      translate: true,
      term: false,
      dir: "ltr",
      locNote: "This is a Note.",
      locNoteType: "alert",
      domains: ["law"]
    }

- OR -

$.getITSData('span')            -> same as above
```

### getITSAnnotatorsRef( dataCategoryName ) ###

Get the [Annotators References](http://www.w3.org/International/multilingualweb/lt/drafts/its20/its20.html#its-tool-annotation) of the selected DOM nodes.

```
$('span').getITSAnnotatorsRef('textAnalysis')    -> get the annotators Reference of all spans
  returns ["http://enrycher.ijs.si"]
```

### $.clearITSCache() ###

Clear internal saved Inheritance and XPaths Objects.
This is needed to be done, after the underlying HTML structure has changed.

If you are 100% sure there were only changes done at the end of the document
(or only none structural changes, like added classes), you don't need to clear the cache.
Just use this, if you have trouble with wrong ITS data.

```
// Add a span somewhere
$('p:first').before('<span></span>');
// Now internal caches are wrong for Inheritance and the ITS Cache has to be cleared.
$.clearITSCache();
// Now you can retrieve the correct ITS values
$('p').getITSData();
```

### :translate ###

Selector for the [translate](http://www.w3.org/TR/its20/#trans-datacat) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:translate')                -> select all nodes with translate = yes
$('*:translate(yes)')           -> select all nodes with translate = yes
$('*:translate(no)')            -> select all nodes with translate = no
```

### :locNote ###

Selector for the [localization note](http://www.w3.org/TR/its20/#locNote-datacat) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:locNote')                  -> select all nodes with a any localization note
$('*:locNote(any)')             -> select all nodes with a any localization note
$('*:locNote(description)')     -> select all nodes with a localization note from type description
$('*:locNote(alert)')           -> select all nodes with a localization note from type alert
```

### :storageSize ###

Selector for the [storage size](http://www.w3.org/TR/its20/#storagesize) data category.

**For all selectors parseITS has to be run once before.**

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

**For all selectors parseITS has to be run once before.**

```
$('*:allowedCharacters')        -> select all nodes with a any allowed characters
$('*:allowedCharacters([a-Z])') -> select all nodes with the specified allowed characters ([a-Z])
```

### :textAnalysis ###

Selector for the [text analysis](http://www.w3.org/TR/its20/#textanalysis) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:textAnalysis')                        -> select all nodes with a any text analysis attribute
$('*:textAnalysis(taConfidence: 0.7)')     -> select all nodes with a confidence of 0.7
$('*:textAnalysis(taConfidence: >0.6)')    -> select all nodes with a confidence above 0.6 (also supported are >,!=,<)
$('*:textAnalysis(taIdentRef: http://dbpedia.org/resource/Dublin)')         -> select all nodes with a given IdentRef
$('*:textAnalysis(taClassRef: http://nerd.eurecom.fr/ontology#Location)')   -> select all nodes with a given ClassRef
$('*:textAnalysis(taSource: Wordnet3.0)')  -> select all nodes with a given Source
$('*:textAnalysis(taIdent: 301467919)')    -> select all nodes with a given Ident
$('*:textAnalysis(taConfidence: >0.5, taSource: Wordnet3.0)')               -> matching query can be combined with , (comma)
                                                                               everything has to be true to be returned
```

### :terminology ###

Selector for the [terminology](http://www.w3.org/TR/its20/#terminology) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:terminology')                        -> select all nodes which are a term
$('*:terminology(termConfidence: 0.7)')   -> select all nodes with a confidence of 0.7
$('*:terminology(termConfidence: >0.6)')  -> select all nodes with a confidence above 0.6 (also supported are >,!=,<)
$('*:terminology(termInfoRef: #TDPV)')    -> select all nodes with a given InfoRef
$('*:terminology(term: yes)')             -> select all nodes which are a term
$('*:terminology(term: no)')              -> select all nodes which are not a term
$('*:terminology(termConfidence: >0.5, term: yes)')  -> matching query can be combined with , (comma)
                                                        everything has to be true to be returned
```

### :dir ###

Selector for the [directionality](http://www.w3.org/TR/its20/#directionality) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:dir')                -> select all nodes with dir = ltr
$('*:dir(ltr)')           -> select all nodes with dir = ltr
$('*:dir(rtl)')           -> select all nodes with dir = rtl
$('*:dir(!rtl)')          -> select all nodes with dir != rtl
```

### :domain ###

Selector for the [domain](http://www.w3.org/TR/its20/#domain) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:domain')                   -> select all nodes with any domain
$('*:domain(automotive)')       -> select all nodes with a specific domain
```

### :localeFilter ###

Selector for the [locale filter](http://www.w3.org/TR/its20/#LocaleFilter) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:localeFilter')                                   -> select all nodes which have a locale filter (not "include" - "*")
$('*:localeFilter(localeFilterList: "de-DE, de-CH")') -> select all nodes with the exactly language list of de-DE, de-CH
$('*:localeFilter(localeFilterType: include)')        -> select all nodes with the filter type of include
$('*:localeFilter(localeFilterType: exclude)')        -> select all nodes with the filter type of exclude
$('*:localeFilter(lang: de-DE)')                      -> select all nodes which should be included with de-DE
                                                         This is true, even if there are more items in the filter list
                                                         or when using *-DE, de-DE or * in filter list
$('*:localeFilter(lang: de-*)')                       -> You even can use * in the query here to,
                                                         see the detailed description from the standard
                                                         for more information
$('*:localeFilter(localeFilterType: include, localeFilterList: "de-DE, de-CH")')
                                                      -> matching query can be combined with , (comma)
                                                         everything has to be true to be returned
```

### :locQualityIssue ###

Selector for the [Localization Quality Issue](http://www.w3.org/TR/its20/#lqissue) data category.

All queries also handles standoff markup. If a node has a reference to a standoff markup
with multiple issues and the query is locQualityIssueSeverity: >50
then the node will be returned, if at least one issue satisfy this query.

**For all selectors parseITS has to be run once before.**

```
$('*:locQualityIssue')                                         -> select all nodes which have a localization quality issue
$('*:locQualityIssue(locQualityIssueComment: "a comment.")')   -> select all nodes which have a specific comment
$('*:locQualityIssue(locQualityIssueEnabled: yes)')            -> select all nodes which are enabled (or not, when no)
$('*:locQualityIssue(locQualityIssueProfileRef: "http://example.org/qaMovel/v1")')
                                                               -> select all nodes which have a localization quality issue
$('*:locQualityIssue(locQualityIssueSeverity: 50)')            -> select all nodes which have a severity of 50
$('*:locQualityIssue(locQualityIssueSeverity: >50)')           -> select all nodes which have a severity above 50 (also supported are >,!=,<)
$('*:locQualityIssue(locQualityIssueType: misspelling)')       -> select all nodes which have a specific type
$('*:locQualityIssue(locQualityIssuesRef: locqualityissue9htmlstandoff.xml#lq1)')
                                                               -> select all nodes which have a specific reference to standoff issues
$('*:locQualityIssue(locQualityIssueSeverity: 50, locQualityIssueEnabled: yes)')
                                                               -> matching query can be combined with , (comma)
                                                                  everything has to be true to be returned
```

### :locQualityRating ###

Selector for the [Localization Quality Rating](http://www.w3.org/TR/its20/#lqrating) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:locQualityRating')                                        -> select all nodes which have a localization quality rating
$('*:locQualityRating(locQualityRatingScore: 50)')             -> select all nodes which have a rating of 50
$('*:locQualityRating(locQualityRatingScoreThreshold: >50)')   -> select all nodes which have a rating threshold above 50 (also supported are >,!=,<)
$('*:locQualityRating(locQualityRatingVote: 50)')              -> select all nodes which have a rating of 50
$('*:locQualityRating(locQualityRatingVoteThreshold: >50)')    -> select all nodes which have a rating threshold above 50 (also supported are >,!=,<)
$('*:locQualityRating(locQualityRatingProfileRef: http://example.org/qamodel/v13)')
                                                               -> select all nodes which have a specific profile reference
$('*:locQualityRating(locQualityRatingScore: 50, locQualityRatingScoreThreshold: <90)')
                                                               -> matching query can be combined with , (comma)
                                                                  everything has to be true to be returned
```

### :mtConfidence ###

Selector for the [MT Confidence](http://www.w3.org/TR/its20/#mtconfidence) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:mtConfidence')                 -> select all nodes which have a mt confidence rating
$('*:mtConfidence(0.4)')            -> select all nodes which have a confidence of 0.4
$('*:mtConfidence(>0.4)')           -> select all nodes which have a confidence above 0.4 (also supported are >,!=,<)
```

### :provenance ###

Selector for the [Provenance](http://www.w3.org/TR/its20/#provenance) data category.

All queries also handles standoff markup. If a node has a reference to a standoff markup
with multiple records and the query is person: John Doe
then the node will be returned, if at least one record satisfy this query.

**For all selectors parseITS has to be run once before.**

```
$('*:provenance')                                 -> select all nodes which have any provenance record
$('*:provenance(person: Jon Doe)')                -> select all nodes which have a the specified person
$('*:provenance(personRef: http://www.provdata.com/person/#John_Doe)')
                                                  -> select all nodes which have a the specified person reference
                Further possible keys you can use:
                person, personRef, org, orgRef, tool, toolRef,
                revPerson, revPersonRef, revOrg, revOrgRef, revTool, revToolRef,
                provRef
$('*:provenance(provenanceRecordsRef: #pr1)')     -> select all nodes which have the specified provenance records reference
$('*:provenance(person: Jon Doe, org: acme-CAT-v2.3)')
                                                  -> matching query can be combined with , (comma)
                                                     everything has to be true to be returned
```

### :externalResource ###

Selector for the [External Resource](http://www.w3.org/TR/its20/#externalresource) data category.

This selector is problematic currently, because often this is only on attribute base, but jQuery selector
is on element base. **This returns only elements, no attributes!**

**For all selectors parseITS has to be run once before.**

```
$('*:externalResource')                  -> select all nodes which have any external resource
$('*:externalResource(image.png)')       -> select all nodes which have a specific external resource
```

### :targetPointer ###

Selector for the [Target Pointer](http://www.w3.org/TR/its20/#target-pointer) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:targetPointer')                -> select all nodes which have any target
$('*:targetPointer(file.txt)')      -> select all nodes which have a specific target
```

### :idValue ###

Selector for the [ID Value](http://www.w3.org/TR/its20/#idvalue) data category.

This should only be used, if you use for what reasons ever not the id attribute.
**But it is strongly recommended to use the id attribute.**

**For all selectors parseITS has to be run once before.**

```
$('*:idValue')             -> select all nodes which have any id value
$('*:idValue(btn.OK)')     -> select all nodes which have a specific id
```

### :lang ###

Selector for the [Language Information](http://www.w3.org/TR/its20/#language-information) data category.

**For all selectors parseITS has to be run once before.**

```
$('*:lang')            -> select all nodes which have any language
$('*:lang(fr)')        -> select all nodes which have a specific language
$('*:lang(!fr)')       -> select all nodes which are not in the given language
```

### :withinText ###

Selector for the [Elements Within Text](http://www.w3.org/TR/its20/#elements-within-text) data category.

Also see getITSSplitText for a function to get text, split correctly depending on withinText values.

**For all selectors parseITS has to be run once before.**

```
$('*:withinText')          -> select all nodes with withinText="yes" or "nested"
$('*:withinText(yes)')     -> select all nodes which have a specific withinText value
```

### getITSSplitText() ###

Special function for the [Elements Within Text](http://www.w3.org/TR/its20/#elements-within-text) data category.

Returns a list of text which should be translated from the input values.
This function splits the text correctly depending on the within Text values.

```
<div withinText="no">
  <p withinText="no">Hello <span withinText="yes">World!</span></p>
  <p withinText="no">I could have cite <cite withinText="nested">A HTML attribute ...</cite> inside my Text.</p>
</div>
```

```
$('div').getITSSplitText() == ['Hello <span withinText="yes">World!</span>', 'A HTML attribute ...', 'I could have cite inside my Text.']
$('p:last').getITSSplitText() == ['A HTML attribute ...', 'I could have cite inside my Text.']
$('span') == ['Hello <span withinText="yes">World!</span>']
```

Credits
-------

* [Cocomore AG](http://www.cocomore.com)
    * Karl Fritsche - [attrib](http://drupal.org/user/619702)
    * Alejandro Leiva - [gloob](http://drupal.org/user/1866660)
* [MultilingualWeb-LT Working Group](http://www.w3.org/International/multilingualweb/lt/)

License
-------

[GNU General Public License, version 2](http://www.gnu.org/licenses/old-licenses/gpl-2.0.html)
