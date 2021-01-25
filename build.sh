#!/bin/bash
INFILE=src/myst.js
OUTFILE=dist/myst.min.js
uglifyjs $INFILE --compress --mangle -o $OUTFILE.tmp
cat header.txt > $OUTFILE
cat $OUTFILE.tmp >> $OUTFILE
rm $OUTFILE.tmp
