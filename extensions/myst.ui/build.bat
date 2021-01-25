@echo off
set "infile=src\myst.ui.js"
set "outfile=..\..\dist\myst.ui.min.js"
uglifyjs %infile% --compress --mangle -o %outfile%.tmp | more
type header.txt > %outfile%
type %outfile%.tmp >> %outfile%
del %outfile%.tmp
