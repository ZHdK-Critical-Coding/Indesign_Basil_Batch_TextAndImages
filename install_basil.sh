#!/bin/sh
# Copies the basil.js library from this repository to ~/Documents/basiljs,
# where Basil scripts look for it (see @includepath in the .jsx files).
# An existing installation is left as it is.
# Usage: ./install_basil.sh
cd "$(dirname "$0")"
target="$HOME/Documents/basiljs"

if [ -f "$target/basil.js" ]; then
  echo "basil.js is already installed in $target – nothing to do."
  exit 0
fi

# a folder or link without basil.js, e.g. a link to a folder that was moved
if [ -e "$target" ] || [ -L "$target" ]; then
  echo "$target exists, but contains no basil.js."
  echo "Remove it and run this script again."
  exit 1
fi

mkdir -p "$HOME/Documents"
cp -R basiljs "$target"
echo "basil.js installed in $target"
