# Mobile Localization

![Mobile Localization cover](logo.png)

A small tool for generating localized files for major mobile platforms.

## Installation

	$ npm install mobile-localization -g

You can also use it locally by removing the `-g` parameter and replacing it by `-save` to add the dependency in your `package.json` project file .

## Usage

	$ mobile-localization [options]

	Options:

	  -h, --help           output usage information
	  -V, --version        output the version number
	  -f, --file <path>    The csv file containing all localized labels
	  -o, --output <path>  The output folder
	  -s, --os <id>        Generates localized file only for a specified os (ios, android, windows)
	  -c, --culture <iso>  Generates localized file only for a specified culture (iso 3166-1 alpha2)
	  -m, --mapping <path> Adds a yaml mapping file. Each key will be mapped to extra keys.
	  -r, --report		   Generates an html report of all the labels.

It will generates subfolders for each system with its localization files.

For example, this command will generate labels only for iOS, with default culture :

	$ mobile-localization --file example/labels.csv --output example/output/ --os ios --culture default

## Input format

The incoming format is a **csv** (`;` column separator) file with a first line describing the columns :

* *0* - `optional` - **os** : os concerned by this resource (default: `ios, android, windows, javascript`, example : `ios, windows`)
* *1* - `required` - **key** : key of the resource (example : `title`)
* *2* - `required` - **description** : international description of the resource (example : `The main title of the application`)
* *3* - `required` - **value** : default value for the resource (example : `My Application`)
* *X* - `optional` - **<ISO 3166-1 alpha 2>** : translation in a foreign language (example : `FR` `Mon Application`)

The escaped characters in label values are :

* `\n` : breakline.
* `\s` : semicolon.

You can create formatted strings by adding `%@` where the formatted segments will be inserted. Those elements will be replaced by :

* `android` : `%s`
* `ios` : `%@`
* `windows` : `{i}` (where `i` is the index of the element)
* `javascript` : `{i}` (where `i` is the index of the element)

## Output format

* **iOS** : `/<culture>/Localizable.strings`
* **Android** : `/values-<culture>/strings.xml`
* **WPF / Windows 8.0 / Windows Phone 8.0 / Windows 8.1 / Windows Phone 8.1** : `/strings/<culture>/Resources.resw`
* **Javascript** : `/strings.<culture>.js`

## Author

[@aloisdeniel](https://twitter.com/aloisdeniel)
