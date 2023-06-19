/*
 *   __ __ _____ _____ _____     _
 *  |  |  |  _  |  _  |   __|   |_|___
 *   \_   |     |  _ -|__   |_  | |_ -|
 *    /__/|__|__|_____|_____|_|_| |___|
 *                            |___|
 *
 *  Yet-Another-Build-System.js
 *  https://github.com/pulzed/YABS.js
 *  ---
 *  (c) 2023 Danijel Durakovic
 *  MIT License
 *
 */

/*jshint esversion:9*/

/**
 * @file yabs.js
 * @author Danijel Durakovic
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { EOL } = require('os');

/**
 * yabs.js namespace
 * @namespace
 */
const yabs = {};

yabs.version = '1.0.0'; // YABS.js version

////////////////////////////////////////////////////////////////////////////////
//
//  Constants
//
////////////////////////////////////////////////////////////////////////////////

yabs.DEFAULT_BUILD_ALL_FILE = 'build_all.json';
yabs.DEFAULT_BUILD_FILE = 'build.json';
yabs.COMPILED_SOURCE_EXTENSION = '.min.js';
yabs.PREPROCESS_FILE_EXTENSION = '.pre';
yabs.COMPILE_FILE_EXTENSION = '.cmp';

////////////////////////////////////////////////////////////////////////////////
//
//  Utility
//
////////////////////////////////////////////////////////////////////////////////

yabs.util = {};

/**
 * Checks whether a given file or path exists.
 * 
 * @function exists
 * @memberof yabs.util
 * @instance
 * 
 * @param {string} source_path
 * 
 * @returns {bool}
 */
yabs.util.exists = function(source_path) {
	return fs.existsSync(source_path);
};

/**
 * Checks whether a given path represents a directory.
 * 
 * @function isDirectory
 * @memberof yabs.util
 * @instance
 * 
 * @param {string} source_path
 * 
 * @returns {bool}
 */
yabs.util.isDirectory = function(source_path) {
	return fs.lstatSync(source_path).isDirectory();
};

/**
 * Get modified-time of given path.
 * 
 * @function getModifiedTime
 * @memberof yabs.util
 * @instance
 * 
 * @param {string} source_path
 * 
 * @returns {number}
 */
yabs.util.getModifiedTime = function(source_path) {
	return fs.statSync(source_path).mtime;
};

/**
 * Determines whether or not source filename is newer than destination filename.
 *
 * @param {string} source_path
 * @param {string} destination_path
 *
 * @returns {bool}
 */
yabs.util.isSourceNewer = function(source_path, destination_path) {
	const dtime_modified_source = (Date.now() - yabs.util.getModifiedTime(source_path));
	const dtime_modified_destination = (Date.now() - yabs.util.getModifiedTime(destination_path));
	return (dtime_modified_destination - dtime_modified_source) >= 1000;
};

/**
 * Recursively generates a list of files based on given source and destination directories.
 * Skip source files that are both older than, and have a correlating existing destination file.
 * (This makes it so that repeated builds don't keep cloning already existing files for which
 * there is no need to be repeatedly updated.)
 * 
 * @param {string} source_dir - Source relative directory.
 * @param {string} destination_dir - Destination relative directory.
 * @param {array} mask - Can be one of three states:
 *                       ["*", null] - fetch everything and descent recursively
 *                       ["*", "*"] - fetch everything, but don't descent recursively
 *                       ["*", ".ext"] - fetch everything, don't descent recursively, and it has to match extension
 * 
 * @returns {array} Array of {source, destination} pairs.
 */
yabs.util.getFilesWithRecursiveDescent = function(source_dir, destination_dir, mask, depth = 0) {
	let list = [];
	if (!yabs.util.exists(source_dir)) {
		throw `Could not locate path: ${source_dir}`;
	}
	const source_dir_listing = fs.readdirSync(source_dir);
	source_dir_listing.forEach(listing_entry => {
		const nested_source_path = path.join(source_dir, listing_entry);
		const nested_destination_path = path.join(destination_dir, listing_entry);
		const is_source_directory = yabs.util.isDirectory(nested_source_path);
		if (is_source_directory) { // this is a directory
			if (mask[0] === '*' && mask[1] === null) { // only allow recursive descent with correct mask
				list = list.concat(yabs.util.getFilesWithRecursiveDescent(
					nested_source_path, nested_destination_path, mask, depth + 1
				));
			}
		}
		else { // this is a file
			// validate against mask
			if (mask[0] === '*' && mask[1] !== '*' && mask[1] !== null) {
				// validate against extension type
				const parsed_nested_source_path = path.parse(nested_source_path);
				if (mask[1] !== parsed_nested_source_path.ext) {
					return;
				}
			}
			if (yabs.util.exists(nested_destination_path)) { // destination file already exists
				// check file timestamps
				if (!yabs.util.isSourceNewer(nested_source_path, nested_destination_path)) {
					// source file is not newer than destination, skip this file
					return;
				}
			}
			list.push({
				source: nested_source_path,
				destination: nested_destination_path
			});
		}
	});
	// return the compiled list
	return list;
};

/**
 * Parses JSDoc-style tags from a source file.
 *
 * @returns {array} Array of [key, value] pairs.
 */
yabs.util.parseJSDocTagsFromFile = function(source_file) {
	const output = [];
	const jsdoc_regex = /\/\*\*(.*?)\*\//gs;
	const tag_regex = /\*\s*@(\w+)\s+(.+)/g;
	const file_content = fs.readFileSync(source_file, { encoding: 'utf8', flag: 'r' });
	const jsdoc_regex_matches = file_content.match(jsdoc_regex);
	if (jsdoc_regex_matches) {
		jsdoc_regex_matches.forEach(regex_match => {
			let tag_match;
			while ((tag_match = tag_regex.exec(regex_match)) !== null) {
				const tag_key = tag_match[1];
				const tag_value = tag_match[2];
				output.push([tag_key, tag_value]);
			}
		});
	}
	return output;
};

////////////////////////////////////////////////////////////////////////////////
//
//  Logger
//
////////////////////////////////////////////////////////////////////////////////

yabs.Logger = class {
	/**
	 * Logger constructor.
	 */
	constructor() {
		// detect whether output is a terminal or not
		// (so we can strip color code output if output is redirected)
		const is_tty = process.stdout.isTTY;
		// output constants and color codes
		this._OUTPUT_RESET     = (is_tty) ? '\x1b[0m'  : '';
		this._OUTPUT_BRIGHT    = (is_tty) ? '\x1b[1m'  : '';
		this._OUTPUT_FG_RED    = (is_tty) ? '\x1b[31m' : '';
		this._OUTPUT_FG_GREEN  = (is_tty) ? '\x1b[32m' : '';
	}
	/**
	 * Prints a message, followed by newline.
	 * 
	 * @param {string} message
	 */
	out(message) {
		process.stdout.write(`${message}\n`);
	}
	/**
	 * Prints a raw message.
	 * 
	 * @param {string} message
	 */
	out_raw(message) {
		process.stdout.write(message);
	}
	/**
	 * Ends output with 'ok'.
	 */
	ok() {
		process.stdout.write(
			` ${this._OUTPUT_BRIGHT}${this._OUTPUT_FG_GREEN}` +
			`ok${this._OUTPUT_RESET}\n`
		);
	}
	/**
	 * Prints an info message.
	 * 
	 * @param {string} message
	 */
	info(message) {
		process.stdout.write(`* ${message}\n\n`);
	}
	/**
	 * Prints a newline.
	 */
	endl() {
		process.stdout.write('\n');
	}
	/**
	 * Prints an error message.
	 * 
	 * @param {string} message
	 */
	error(message) {
		process.stdout.write(
			`${this._OUTPUT_BRIGHT}${this._OUTPUT_FG_RED}Error: ` +
			`${this._OUTPUT_RESET}${message}\n`
		);
	}
	/**
	 * Prints a success message.
	 * 
	 * @param {string} message
	 */
	success(message) {
		process.stdout.write(
			`${this._OUTPUT_BRIGHT}${this._OUTPUT_FG_GREEN}Success: ` +
			`${this._OUTPUT_RESET}${message}\n`
		);	
	}
	/**
	 * Prints the YABS.js header.
	 */
	header() {
		this.out_raw(`${this._OUTPUT_BRIGHT}${this._OUTPUT_FG_GREEN}`);
		this.out('  __ __ _____ _____ _____     _');
		this.out(' |  |  |  _  |  _  |   __|   |_|___');
		this.out('  \\_   |     |  _ -|__   |_  | |_ -|');
		this.out('   /__/|__|__|_____|_____|_|_| |___|');
		this.out('                           |___|');
		this.out_raw(`${this._OUTPUT_RESET}`);
		this.out(' Yet');
		this.out(' Another' + ' '.repeat(32 - yabs.version.length) + '[ v' + yabs.version + ' ]');
		this.out(' Build      https://github.com/pulzed/yabs.js');
		this.out(' System.js         (c) 2023 Danijel Durakovic');
		this.endl();
		this.out('---------------------------------------------');
		this.endl();
	}
};

////////////////////////////////////////////////////////////////////////////////
//
//  Build configuration
//
////////////////////////////////////////////////////////////////////////////////

yabs.BuildConfig = class {
	/**
	 * BuildConfig constructor.
	 * 
	 * @param {string} source_file - Build instructions JSON file.
	 */
	constructor(source_file) {
		const parsed_source_file = path.parse(source_file);
		this._source_file = parsed_source_file.base;
		this._base_dir = parsed_source_file.dir;
		// parse source JSON
		const file_data = fs.readFileSync(source_file, { encoding: 'utf8', flag: 'r' });
		const json_data = JSON.parse(file_data);
		// check if this is a batch build
		if (json_data.hasOwnProperty('batch_build')) {
			this._is_batch = true;
			this._batch_listing = [];
			if (json_data.batch_build instanceof Array) {
				json_data.batch_build.forEach(batch_entry => {
					if (typeof batch_entry === 'string') {
						this._batch_listing.push({
							file: batch_entry
						});
					}
					else if (typeof batch_entry === 'object' && batch_entry !== null) {
						const batch_entry_object = {};
						if (batch_entry.hasOwnProperty('file')) {
							if (typeof batch_entry.file === 'string') {
								batch_entry_object.file = batch_entry.file;
							}
						}
						if (batch_entry.hasOwnProperty('options')) {
							if (typeof batch_entry.options === 'string') {
								batch_entry_object.options = batch_entry.options;
							}
						}
						if (batch_entry_object.file) {
							this._batch_listing.push(batch_entry_object);
						}
					}
				});
			}
			else {
				throw 'The "batch_build" entry in build instructions file has to be an Array type!';
			}
			return; // this is a batch build, we are all done here
		}
		// extract source_dir
		if (!json_data.hasOwnProperty('source_dir')) {
			throw 'Build instructions file is missing the source_dir entry!';
		}
		this._source_dir = json_data.source_dir;
		// extract destination_dir
		if (!json_data.hasOwnProperty('destination_dir')) {
			throw 'Build instructions file is missing the destination_dir entry!';
		}
		this._destination_dir = json_data.destination_dir;
		// extract html listing
		if (json_data.hasOwnProperty('html')) {
			if (json_data.html instanceof Array) {
				if (!json_data.html.every(element => typeof element === 'string')) {
					throw 'Every element in "html" entry listing has to be a String type!';
				}
				this._html_listing = json_data.html;
			}
			else if (typeof json_data.html === 'string') {
				this._html_listing = [ json_data.html ];
			}
		}
		if (!this._html_listing) {
			this._html_listing = [];
		}
		// extract sources listing
		if (json_data.hasOwnProperty('sources')) {
			if (json_data.sources instanceof Array) {
				this._sources_listing = [];
				json_data.sources.forEach(source_entry => {
					if (typeof source_entry === 'string') {
						this._sources_listing.push({
							file: source_entry
						});
					}
					else if (typeof source_entry === 'object' && source_entry !== null) {
						const source_entry_object = {};
						if (source_entry.hasOwnProperty('file')) {
							if (typeof source_entry.file === 'string') {
								source_entry_object.file = source_entry.file;
							}
						}
						if (source_entry.hasOwnProperty('output_file')) {
							if (typeof source_entry.output_file === 'string') {
								source_entry_object.output_file = source_entry.output_file;
							}
						}
						if (source_entry.hasOwnProperty('compile_options')) {
							if (typeof source_entry.compile_options === 'string') {
								source_entry_object.compile_options = source_entry.compile_options;
							}
						}
						if (source_entry.hasOwnProperty('header')) {
							if (source_entry.header instanceof Array) {
								if (!source_entry.header.every(element => typeof element === 'string')) {
									throw 'Every element in "sources" entry "header" listing has to be a String type!';
								}
								source_entry_object.header = source_entry.header;
							}
							else if (typeof source_entry.header === 'string') {
								source_entry_object.header = [ source_entry.header ];
							}
						}
						else if (source_entry.hasOwnProperty('use_header')) {
							// using header from reference
							if (json_data.headers && typeof source_entry.use_header === 'string') {
								if (json_data.headers.hasOwnProperty(source_entry.use_header)) {
									const header_ref = json_data.headers[source_entry.use_header];
									if (header_ref instanceof Array) {
										if (!header_ref.every(element => typeof element === 'string')) {
											throw 'Every element in "headers" listing has to be a String type!';
										}
										source_entry_object.header = header_ref;
									}
									else if (typeof header_ref === 'string') {
										source_entry_object.header = [ header_ref ];
									}
								}
							}
						}
						if (source_entry.hasOwnProperty('variables')) {
							if (typeof source_entry.variables === 'object' &&
								!(source_entry.variables instanceof Array) &&
								source_entry.variables !== null) {

								source_entry_object.variables = {};
								for (const variable_key in source_entry.variables) {
									const variable_data = source_entry.variables[variable_key];
									if (variable_data instanceof Array) {
										if (!variable_data.every(element => typeof element === 'string')) {
											throw 'Every element in "variables" listing has to be a String type!';
										}
										source_entry_object.variables[variable_key] = variable_data;
									}
								}
							}
						}
						else if (source_entry.hasOwnProperty('use_variables')) {
							// using variables from reference
							if (json_data.variables && typeof source_entry.use_variables === 'string') {
								if (json_data.variables.hasOwnProperty(source_entry.use_variables)) {
									const variables_ref = json_data.variables[source_entry.use_variables];
									if (typeof variables_ref === 'object' &&
										!(variables_ref instanceof Array) &&
										variables_ref !== null) {

										source_entry_object.variables = {};
										for (const variable_key in variables_ref) {
											const variable_data = variables_ref[variable_key];
											if (variable_data instanceof Array) {
												if (!variable_data.every(element => typeof element === 'string')) {
													throw 'Every element in "variables" listing has to be a String type!';
												}
												source_entry_object.variables[variable_key] = variable_data;
											}
										}
									}
								}
							}
						}
						if (source_entry.hasOwnProperty('preprocess')) {
							if (source_entry.preprocess === true) {
								source_entry_object.preprocess = true;
							}
						}
						if (source_entry_object.file) {
							this._sources_listing.push(source_entry_object);
						}
					}
				});
			}
			else {
				throw 'The "sources" entry in build instructions file has to be an Array type!';
			}
		}
		if (!this._sources_listing) {
			this._sources_listing = [];
		}
		// extract files listing
		if (json_data.hasOwnProperty('files')) {
			if (json_data.files instanceof Array) {
				if (!json_data.files.every(element => typeof element === 'string')) {
					throw 'Every element in "files" entry listing has to be a String type!';
				}
				this._files_listing = json_data.files;
			}
			else if (typeof json_data.files === 'string') {
				this._files_listing = [ json_data.files ];
			}
		}
		if (!this._files_listing) {
			this._files_listing = [];
		}
	}
	/**
	 * Returns the input build instructions filename.
	 */
	getSourceFile() {
		return this._source_file;
	}
	/**
	 * Returns the base directory of the build instructions filename.
	 */
	getBaseDir() {
		return this._base_dir;
	}
	/**
	 * Returns whether or not this is a batch build.
	 * 
	 * @returns {bool}
	 */
	isBatchBuild() {
		return this._is_batch;
	}

	/**
	 * Returns batch listing.
	 * 
	 * @returns {array}
	 */
	getBatchListing() {
		return this._batch_listing;
	}

	/**
	 * Returns source directory.
	 * 
	 * @returns {string}
	 */
	getSourceDir() {
		return this._source_dir;
	}

	/**
	 * Returns destination directory.
	 * 
	 * @returns {string}
	 */
	getDestinationDir() {
		return this._destination_dir;
	}

	/**
	 * Returns HTML listing.
	 * 
	 * @returns {array}
	 */
	getHTMLListing() {
		return this._html_listing;
	}

	/**
	 * Returns sources listing.
	 * 
	 * @returns {array}
	 */
	getSourcesListing() {
		return this._sources_listing;
	}

	/**
	 * Returns files listing.
	 * 
	 * @returns {array}
	 */
	getFilesListing() {
		return this._files_listing;
	}
};

////////////////////////////////////////////////////////////////////////////////
//
//  Builder
//
////////////////////////////////////////////////////////////////////////////////

yabs.Builder = class {
	/**
	 * Builder constructor.
	 * 
	 * @param {object} logger
	 * @param {object} build_config
	 * @param {object} build_params
	 */
	constructor(logger, build_config, build_params) {
		this._logger = logger;
		// build configuration
		this._build_config = build_config;
		// build parameters
		this._build_params = build_params;
		// base directory
		this._base_dir = this._build_config.getBaseDir();
		// source and destination directories
		this._source_dir = path.normalize(this._build_config.getSourceDir());
		this._destination_dir = path.normalize(this._build_config.getDestinationDir());
		// prebuilt manifest lists
		this._files_manifest = null;
		this._sources_manifest = null;
		this._html_manifest = null;
		// build statistics
		this._n_files_updated = 0;
		this._build_start_time = Date.now();
	}

	/**
	 * Creates manifest lists for current build.
	 */
	_buildManifests() {
		function buildFilesManifest() {
			const files_listing = this._build_config.getFilesListing();
			files_listing.forEach(listing_entry => {
				if (listing_entry.includes('*')) { // path includes mask
					// use recursive descent to capture all files
					const full_source_path = path.join(this._base_dir, this._source_dir, listing_entry);
					const parsed_source_path = path.parse(full_source_path);
					const full_destination_path = path.join(this._destination_dir, listing_entry);
					const parsed_destination_path = path.parse(full_destination_path);
					if (!parsed_source_path.dir.includes('*') && parsed_source_path.name === '*') {
						// only allow masks when they are the last part of path
						// (disallow masks in dirname because they make no sense)
						const split_base = parsed_source_path.base.split('.');
						let mask = null;
						if (parsed_source_path.base === '*') {
							mask = ['*', null]; // ["*", null]
						}
						else if (parsed_source_path.base === '*.*') {
							mask = ['*', '*']; // ["*", "*"]
						}
						else if (split_base[0] === '*' && split_base[1] !== '*' && split_base[1] !== '') {
							mask = ['*', parsed_source_path.ext]; // ["*", ".ext"]
						}
						if (mask !== null) {
							this._files_manifest = this._files_manifest.concat(
								yabs.util.getFilesWithRecursiveDescent(parsed_source_path.dir, parsed_destination_path.dir, mask)
							);
						}
					}
				}
				else { // plain path
					const plain_file_source = path.join(this._base_dir, this._source_dir, listing_entry);
					const plain_file_destination = path.join(this._destination_dir, listing_entry);
					if (yabs.util.isDirectory(plain_file_source)) {
						// this is a directory
						return;
					}
					let include_plain_file = false;
					if (!yabs.util.exists(plain_file_destination)) {
						// destination file does not exist yet
						include_plain_file = true;
					}
					else {
						// check if source is newer than destination
						if (yabs.util.isSourceNewer(plain_file_source, plain_file_destination)) {
							include_plain_file = true;
						}
					}
					if (include_plain_file) {
						// make sure source is not the same as destination
						if (plain_file_source === plain_file_destination) {
							throw `Source file: "${plain_file_source}" cannot be the same as the destination!`;
						}
						// add to manifest
						this._files_manifest.push({
							source: plain_file_source,
							destination: plain_file_destination
						});
					}
				}
			});
		}

		function buildSourcesManifest() {
			const sources_listing = this._build_config.getSourcesListing();
			sources_listing.forEach(listing_entry => {
				if (listing_entry.file.includes('*')) {
					// disallow any masks
					return;
				}
				// process header
				const has_header = listing_entry.hasOwnProperty('header');
				const header_data = { has_header: has_header };
				if (has_header) {
					// make sure to clone the array and not use a reference
					// (because we may need to search/replace variables later on)
					header_data.header = [...listing_entry.header];
				}
				// process variables
				const has_variables = listing_entry.hasOwnProperty('variables');
				const variables_data = { has_variables: has_variables };
				if (has_variables) {
					variables_data.variables = listing_entry.variables;
				}
				// process additional flags
				const force_preprocessor = listing_entry.preprocess === true;
				// process output filename
				let output_filename;
				const parsed_file_entry = path.parse(listing_entry.file);
				if (listing_entry.output_file) {
					const parsed_output_file = path.parse(listing_entry.output_file);
					output_filename = path.join(parsed_file_entry.dir, parsed_output_file.base);
				}
				else {
					output_filename = path.join(parsed_file_entry.dir, parsed_file_entry.name + yabs.COMPILED_SOURCE_EXTENSION);
				}
				const source_full_path = path.join(this._base_dir, this._source_dir, listing_entry.file);
				const source_original_path = path.join(this._source_dir, listing_entry.file);
				const destination_full_path = path.join(this._destination_dir, output_filename);
				// make sure source is not the same as destination
				if (source_full_path === destination_full_path) {
					throw `Source file: "${source_full_path}" cannot be the same as the destination!`;
				}
				// process compile options
				const default_compile_options = '--compress --mangle';
				const compile_options = (listing_entry.hasOwnProperty('compile_options')) ? listing_entry.compile_options : default_compile_options;
				// add source listing to manifest
				this._sources_manifest.push({
					source: source_full_path,
					original_source: source_original_path,
					destination: destination_full_path,
					compile_options: compile_options,
					header_data: header_data,
					variables_data: variables_data,
					force_preprocessor: force_preprocessor
				});
			});
		}

		function buildHTMLManifest() {
			const html_listing = this._build_config.getHTMLListing();
			html_listing.forEach(listing_entry => {
				if (listing_entry.includes('*')) {
					// disallow any masks
					return;
				}
				const html_file_source = path.join(this._base_dir, this._source_dir, listing_entry);
				const html_file_destination = path.join(this._destination_dir, listing_entry);
				// make sure source is not the same as destination
				if (html_file_source === html_file_destination) {
					throw `Source file: "${html_file_source}" cannot be the same as the destination!`;
				}
				// add to manifest
				this._html_manifest.push({
					source: html_file_source,
					destination: html_file_destination
				});
			});
		}

		this._files_manifest = [];
		this._sources_manifest = [];
		this._html_manifest = [];

		buildFilesManifest.call(this);
		buildSourcesManifest.call(this);
		buildHTMLManifest.call(this);
	}

	/**
	 * Verifies that source files in the manifest lists exist.
	 */
	_verifySourceFiles() {
		function verifyManifest(manifest_list) {
			manifest_list.forEach(manifest_entry => {
				const path_source = manifest_entry.source;
				const path_resolved = path.resolve(path_source);
				if (!yabs.util.exists(path_resolved)) {
					throw `Could not find file: ${path_source}`;
				}
			});
		}
		verifyManifest.call(this, this._files_manifest);
		verifyManifest.call(this, this._sources_manifest);
		verifyManifest.call(this, this._html_manifest);
	}

	/**
	 * Process source files headers, substituting variables with data where applicable.
	 */
	_processSourceHeaders() {
		this._sources_manifest.forEach(manifest_entry => {
			const header_data = manifest_entry.header_data;
			if (!header_data.has_header) { // this entry has no header, safe to skip
				return;
			}
			let has_variables = false;
			// determine if the header contains variables
			header_data.header.every(header_str => {
				if (/%\S+%/.test(header_str) || /\$YEAR\$/.test(header_str)) {
					has_variables = true;
					return false;
				}
				return true;
			});
			if (!has_variables) { // this entry has a header but no variables, so it's safe to skip
				return;
			}
			// extract JSDoc-style tags from sourcefile
			const source_file = manifest_entry.source;
			const parsed_variables = yabs.util.parseJSDocTagsFromFile(source_file);
			// subtitute variables in header
			for (let i = 0; i < header_data.header.length; ++i) {
				// subtitute variables with extracted tags
				for (let j = 0; j < parsed_variables.length; j++) {
					const variable_entry = parsed_variables[j];
					header_data.header[i] = header_data.header[i].replace(new RegExp(`%${variable_entry[0]}%`, 'g'), variable_entry[1]);
				}
				// special variable
				header_data.header[i] = header_data.header[i].replace(/\$YEAR\$/g, new Date().getFullYear());
			}
		});
	}

	_buildStep_I_UpdateFiles() {
		this._files_manifest.forEach(manifest_entry => {
			this._logger.out_raw(`${manifest_entry.destination} ...`);
			// check if destination directory exists
			const dir = path.dirname(manifest_entry.destination);
			if (!yabs.util.exists(dir)) {
				// directory doesn't exist yet, create it
				fs.mkdirSync(dir, { recursive: true });
			}
			// copy file
			fs.copyFileSync(manifest_entry.source, manifest_entry.destination);
			this._logger.ok();
			this._n_files_updated += 1;
		});
		this._logger.endl();
	}

	async _buildStep_II_CompileSources() {
		function preprocessOneSource(input_file, output_file, params) {
			return new Promise((resolve, reject) => {
				exec(`metascript ${input_file} ${params} > ${output_file}`, (err) => {
					if (err) {
						this._logger.out_raw('\n\n');
						reject(err);
					}
					else {
						resolve();
					}
				});
			});
		}
		function compileOneSource(input_file, output_file, params) {
			return new Promise((resolve, reject) => {
				exec(`uglifyjs ${input_file} ${params} -o ${output_file}`, (err) => {
					if (err) {
						this._logger.out_raw('\n\n');
						reject(err);
					}
					else {
						resolve();
					}
				});
			});
		}
		// compile each source
		for (const manifest_entry of this._sources_manifest) {
			this._logger.out_raw(`${manifest_entry.destination} ...`);
			// check if destination directory exists
			const dir = path.dirname(manifest_entry.destination);
			if (!yabs.util.exists(dir)) {
				// directory doesn't exist yet, create it
				fs.mkdirSync(dir, { recursive: true });
			}
			// check if we should use the preprocessor or not
			let use_preprocessor = false;
			const variable_params = this._build_params.variable;
			const variables_data = manifest_entry.variables_data;
			const has_variables = variables_data.has_variables;
			const variables_listing = variables_data.variables;
			if (manifest_entry.force_preprocessor) {
				use_preprocessor = true;
			}
			else {
				if (has_variables) {
					// check if any entry in variables_list matches a provided -variable parameter
					for (let i = 0; i < variable_params.length; ++i) {
						if (variables_listing.hasOwnProperty(variable_params[i])) {
							use_preprocessor = true;
							break;
						}
					}
				}
			}
			let preprocess_destination_file;
			if (use_preprocessor) { // we are using the preprocessor
				// create the list of preprocessor parameters
				const preprocessor_params_list = [];
				if (has_variables) { // skip listing without variables (might only have "preprocess" set)
					variable_params.forEach(variable_param => {
						// make sure the variable listing is defined
						if (variables_listing.hasOwnProperty(variable_param)) {
							const variables_listing_list = variables_listing[variable_param];
							variables_listing_list.forEach(variable_entry => {
								const variable_split = variable_entry.split('=');
								const variable_key = variable_split[0].trim();
								const variable_value = variable_split[1].trim();
								if (variable_key.length && variable_value.length) {
									preprocessor_params_list.push(`-${variable_key}=${variable_value}`);
								}
							});
						}
					});
				}
				const preprocessor_params = preprocessor_params_list.join(' ');
				// we are ready to run the file through the preprocessor
				const preprocess_source_file = manifest_entry.source;
				preprocess_destination_file = manifest_entry.destination + yabs.PREPROCESS_FILE_EXTENSION;
				await preprocessOneSource.call(this, preprocess_source_file, preprocess_destination_file, preprocessor_params);
			}
			// compile source into temp file
			const source_file = (use_preprocessor) ? preprocess_destination_file : manifest_entry.source;
			const build_destination_file = manifest_entry.destination;
			const compile_destination_file = build_destination_file + yabs.COMPILE_FILE_EXTENSION;
			const compiler_params = manifest_entry.compile_options;
			await compileOneSource.call(this, source_file, compile_destination_file, compiler_params);
			// output header + compiled source into destination file
			const header_data = manifest_entry.header_data;
			const compiled_file_data = fs.readFileSync(compile_destination_file, { encoding: 'utf8', flag: 'r' });
			const output_file_data = (header_data.has_header) ? header_data.header.join(EOL) + EOL + compiled_file_data : compiled_file_data;
			fs.writeFileSync(build_destination_file, output_file_data, { encoding: 'utf8', flag: 'w' });
			// remove temp file(s)
			fs.rmSync(compile_destination_file, { force: true });
			if (use_preprocessor) {
				fs.rmSync(preprocess_destination_file, { force: true });
			}
			// all done
			this._logger.ok();
			this._n_files_updated += 1;
		}
		this._logger.endl();
	}

	_buildStep_III_WriteHTMLFiles() {
		// bake each file
		const script_src_regex = /<script\b[^>]*\bsrc=(["'])(.*?)(\1).*?>/;
		this._html_manifest.forEach(manifest_entry => {
			this._logger.out_raw(`${manifest_entry.destination} ...`);
			// check if destination directory exists
			const dir = path.dirname(manifest_entry.destination);
			if (!yabs.util.exists(dir)) {
				// directory doesn't exist yet, create it
				fs.mkdirSync(dir, { recursive: true });
			}
			// write each HTML
			const html_file_data = fs.readFileSync(manifest_entry.source, { encoding: 'utf8', flag: 'r' });
			const html_line_data = html_file_data.split(/\r?\n/);
			let html_file_output_lines = [];
			html_line_data.forEach(line_str => {
				const src_regex_match = line_str.match(script_src_regex);
				let substitute_line = false;
				let substitute_line_str;
				if (src_regex_match) {
					const extracted_src = src_regex_match[2];
					const src_parsed = path.parse(extracted_src);
					const src_joined = path.join(this._source_dir, src_parsed.dir, src_parsed.base);
					// now that we have the parsed src path, we need to find the matching source in the manifest
					// (so we don't end up changing a path that wasn't referenced in build instructions)
					let matches_sources_manifest = false;
					let destination_src;
					this._sources_manifest.every(sources_manifest_entry => {
						if (sources_manifest_entry.original_source === src_joined) {
							matches_sources_manifest = true;
							const destination_src_parsed = path.parse(sources_manifest_entry.destination);
							destination_src = src_parsed.dir + '/' + destination_src_parsed.base;
							return false;
						}
						return true;
					});
					if (matches_sources_manifest) {
						// now that we have a match, change the src attribute to our destination file
						substitute_line = true;
						substitute_line_str = line_str.replace(extracted_src, destination_src);
					}
				}
				// append next line to output
				html_file_output_lines.push((substitute_line) ? substitute_line_str : line_str);
			});
			// write output file
			const html_file_output_data = html_file_output_lines.join(EOL);
			fs.writeFileSync(manifest_entry.destination, html_file_output_data, { encoding: 'utf8', flag: 'w' });
			this._logger.ok();
			this._n_files_updated += 1;
		});
		this._logger.endl();
	}

	/**
	 * Start the build.
	 */
	async build() {
		const build_instr_dir = this._build_config.getBaseDir();
		const build_instr_file = this._build_config.getSourceFile();
		const build_instr_fullpath = path.join(build_instr_dir, build_instr_file);
		this._logger.info(`Starting build: ${build_instr_fullpath}`);

		this._logger.info('Preparing build ...');

		// prepare build step I
		// build the file manifests. this creates three arrays with unified structures that
		// have "source" and "destination" entries for each file. it also clones the
		// header data into fresh arrays so they can be used for variable substitution
		// on a per-source basis
		this._buildManifests();

		// prepare build step II
		// now we have to verify the existence of all the files listed in manifests
		// as sources, to make sure we don't have missing or unreadable source files
		this._verifySourceFiles();

		// prepare build step III
		// process header data for sourcefiles
		this._processSourceHeaders();

		// build step I
		// update files from files manifest
		if (this._files_manifest.length > 0) { // skip if empty
			this._logger.info('Updating files ...');
			this._buildStep_I_UpdateFiles();
		}

		// build step II
		// preprocess and compile sources
		if (this._sources_manifest.length > 0) { // skip if empty
			this._logger.info('Compiling sources ...');
			await this._buildStep_II_CompileSources();
		}

		// build step III
		// finally, write updates into and clone HTML files
		if (this._html_manifest.length > 0) { // skip if empty
			this._logger.info('Writing HTML files ...');
			this._buildStep_III_WriteHTMLFiles();
		}

		// build finished
		const build_time = ((Date.now() - this._build_start_time) / 1000).toFixed(2);
		this._logger.success('Build finished!\n');
		this._logger.out(`Updated ${this._n_files_updated} files.`);
		this._logger.out(`Build completed in ${build_time}s.`);
	}
};

////////////////////////////////////////////////////////////////////////////////
//
//  BatchBuilder
//
////////////////////////////////////////////////////////////////////////////////

yabs.BatchBuilder = class {
	/**
	 * BatchBuilder constructor.
	 * 
	 * @param {object} logger
	 * @param {object} build_config
	 * @param {object} build_params
	 */
	constructor(logger, build_config, build_params) {
		this._logger = logger;
		// build configuration
		this._build_config = build_config;
		// build parameters
		this._build_params = build_params;
		// base directory
		this._base_dir = this._build_config.getBaseDir();
		// build manifest
		this._batch_manifest = null;
		// build statistics
		this._batch_build_start_time = Date.now();
	}

	_buildBatchManifest() {
		const batch_listing = this._build_config.getBatchListing();
		this._batch_manifest = [];
		batch_listing.forEach(listing_entry => {
			const build_instr_file = listing_entry.file;
			if (!build_instr_file.length) {
				return;
			}
			let options;
			if (listing_entry.options) {
				options = [];
				const split_options = listing_entry.options.trim().split(/\s+/);
				split_options.forEach(options_item => {
					if (options_item.length >= 2 && options_item[0] === '-') {
						options.push(options_item.substring(1));
					}
				});
			}
			else {
				options = this._build_params.variable;
			}
			const build_instr_file_full = path.join(this._base_dir, build_instr_file);
			this._batch_manifest.push({
				file: build_instr_file_full,
				options: options
			});
		});
	}

	async _buildOne(build_index) {
		const build_listing = this._batch_manifest[build_index];
		const build_instr_file = build_listing.file;
		let build_config = null;
		if (yabs.util.exists(build_instr_file)) {
			build_config = new yabs.BuildConfig(build_instr_file);
		}
		else {
			throw 'Cannot find file: ' + build_instr_file;
		}
		if (build_config.isBatchBuild()) {
			throw 'Cannot have nested batch builds: ${build_instr_file}!';
		}
		const build_params = { variable: build_listing.options };
		const builder = new yabs.Builder(this._logger, build_config, build_params);
		await builder.build();
	}

	/**
	 * Start the build.
	 */
	async build() {
		const nofail_flag = this._build_params.option.includes('nofail');

		const build_instr_dir = this._build_config.getBaseDir();
		const build_instr_file = this._build_config.getSourceFile();
		const build_instr_fullpath = path.join(build_instr_dir, build_instr_file);
		this._logger.info(
			`Starting ${this._logger._OUTPUT_BRIGHT}${this._logger._OUTPUT_FG_GREEN}<batch build>` +
			`${this._logger._OUTPUT_RESET}: ${build_instr_fullpath}`
		);

		// build the batch manifest
		this._buildBatchManifest();

		let build_index = 0;
		const n_builds = this._batch_manifest.length;
		let n_successful_builds = 0;
		let n_failed_builds = 0;

		while (build_index < n_builds) {
			this._logger.out(
				`=== ${this._logger._OUTPUT_BRIGHT}${this._logger._OUTPUT_FG_GREEN}<batch build>` +
				`${this._logger._OUTPUT_RESET} ${build_index + 1}/${n_builds} ===\n`
			);
			try {
				// build this item
				await this._buildOne(build_index++);
				// increment successful builds counter
				n_successful_builds++;
			}
			catch (e) {
				if (nofail_flag) {
					// we have --nofail
					// print the error, but keep going
					this._logger.error(e);
					// increment failed builds counter
					n_failed_builds++;
				}
				else {
					// pass exception to main try/catch block
					throw e;
				}
			}
			this._logger.endl();
		}

		// all done
		const batch_build_time = ((Date.now() - this._batch_build_start_time) / 1000).toFixed(2);
		this._logger.out(
			`=== ${this._logger._OUTPUT_BRIGHT}${this._logger._OUTPUT_FG_GREEN}<batch build>` +
			`${this._logger._OUTPUT_RESET} finished! ===\n`
		);
		if (nofail_flag) {
			this._logger.out(`${n_successful_builds} builds finished, ${n_failed_builds} failed in ${batch_build_time}s.`);
		}
		else {
			this._logger.out(`${n_successful_builds} builds finished in ${batch_build_time}s.`);
		}
	}
};

////////////////////////////////////////////////////////////////////////////////
//
//  Application
//
////////////////////////////////////////////////////////////////////////////////

yabs.Application = class {
	/**
	 * Application constructor.
	 */
	constructor() {
		this._logger = new yabs.Logger();
	}
	/**
	 * Program entry point.
	 */
	async main(argv) {
		// parse build parameters
		const build_params = {
			option: [], // --option parameters
			variable: [], // -variable parameters (used for preprocessor)
			free: [] // freestanding parameters (should only contain a single item with the build instructions file)
		};
		argv.slice(2).forEach(str_value => {
			if (str_value.startsWith('--')) { // this is an --option parameter
				build_params.option.push(str_value.slice(2));
			}
			else if (str_value.startsWith('-')) { // this is a -variable parameter
				build_params.variable.push(str_value.slice(1));
			}
			else { // this is a freestanding parameter
				build_params.free.push(str_value);
			}
		});

		// print out header
		this._logger.header();
		try {
			this._logger.info('Configuring build ...');
			// figure out what we're building first
			let build_config = null;
			if (build_params.free.length === 0) { // parametress run
				if (yabs.util.exists(yabs.DEFAULT_BUILD_ALL_FILE)) {
					build_config = new yabs.BuildConfig(yabs.DEFAULT_BUILD_ALL_FILE);
				}
				else if (yabs.util.exists(yabs.DEFAULT_BUILD_FILE)) {
					build_config = new yabs.BuildConfig(yabs.DEFAULT_BUILD_FILE);
				}
			}
			else {
				const build_instr_file = build_params.free[0];
				if (yabs.util.exists(build_instr_file)) {
					build_config = new yabs.BuildConfig(build_instr_file);
				}
				else {
					throw 'Cannot find file: ' + build_instr_file;
				}
			}
			// make sure we have build configuration
			if (!build_config) {
				throw 'Missing input file!';
			}
			// check if this is a batch build
			if (build_config.isBatchBuild()) {
				// this is a batch build
				const builder = new yabs.BatchBuilder(this._logger, build_config, build_params);
				await builder.build();
			}	
			else {
				// this is a normal build
				const builder = new yabs.Builder(this._logger, build_config, build_params);
				await builder.build();
			}
		}
		catch(e) {
			this._logger.error(e);
			this._logger.out('\nBuild aborted.');
		}
		// print out final newline
		this._logger.endl();
	}
};

(new yabs.Application()).main(process.argv); // run yabs.js
