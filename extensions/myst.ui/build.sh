#!/bin/bash
INFILE=src/myst.ui.js
OUTFILE=../../dist/myst.ui.min.js
uglifyjs $INFILE --compress --mangle -o $OUTFILE.tmp
cat header.txt > $OUTFILE
cat $OUTFILE.tmp >> $OUTFILE
rm $OUTFILE.tmp
