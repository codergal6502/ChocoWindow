# ChocoWindow
A small suite of tools to generate retro JRPG-style windows and window layouts for streamers. 

## Table of contents

* [Introduction](#introduction)
* [Using ChocoWindow in your Projects](#using-chocowindow-in-your-projects)
* [License](#license)
* [Acknowledgments](#acknowledgments)

## Introduction

ChocoWindow exists to make it easier for retro streamers to create backgrounds reminiscent of the windows used in the JRPGs of 8- and 16-bit platforms.

## Using ChocoWindow in your Projects

Download [`ChocoWindow.js`](ChocoWindow.js) and include it in your web page. You will have to supply your own spritesheet and corresponding `ChocoWinTileSet` definitions.

### Examples

For an example of using the library, please see the [Six Window Sample](examples/six-window-example/six-window-sample.html). It demonstrates tile scaling and color substitution.

## Running Examples or Studio Locally

If you want to run the examples or Choco Window Studio locally, you first must make symbolic links for [`ChocoWindow.js`](ChocoWindow.js) in those applications' directories. This can be done by running [`make-javascript-shortcuts.sh`](make-javascript-shortcuts.sh). The `.gitignore` files are already set up to ignore the symbolic links.

## License

Copyright 2025

This project is distributed under the terms of the [GPL-3.0 License](https://www.gnu.org/licenses/gpl-3.0.en.html). The license applies to this file and other files in the [GitHub repository](https://github.com/codergal6502/ChocoWindow) hosting this file.

## Acknowledgments

Special thanks to The Spriters Resource, which hosts sprites and other images. Thanks also to to Michael Hucka for the README template upon which this README is based. Thanks to vaibhav chandra for free, open-source window code used as the basis for the example project.

* [The Spriters Resource](https://www.spriters-resource.com/)
* [READMINE: Suggested template for software READMEs](https://mhucka.github.io/readmine/)
* [Uiverse Card](https://uiverse.io/vaibhavchandranv/swift-ladybug-51)
