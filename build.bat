@echo off
set "infile=src\myst.js"
set "outfile=dist\myst.min.js"
uglifyjs %infile% --compress --mangle -o %outfile%.tmp | more
type header.txt > %outfile%
type %outfile%.tmp >> %outfile%
del %outfile%.tmp
