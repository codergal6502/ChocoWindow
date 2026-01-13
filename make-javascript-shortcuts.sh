#!/bin/bash

parent_path=$(dirname ${BASH_SOURCE[0]})

# See https://stackoverflow.com/a/24112741/1102726
ln -s ../../ChocoWindow.js ${parent_path}/examples/six-window-example/ChocoWindow.js
ln -s ../../ChocoWindow.js ${parent_path}/examples/pixel-reader-writer/ChocoWindow.js
ln -s ../../ChocoWindow.js ${parent_path}/studio/src/ChocoWindow.js