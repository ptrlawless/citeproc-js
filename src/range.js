/*
 * Copyright (c) Frank G. Bennett, Jr. 2009. All Rights Reserved.
 *
 * The contents of this file are subject to the Common Public
 * Attribution License Version 1.0 (the “License”); you may not use
 * this file except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://bitbucket.org/fbennett/citeproc-js/src/tip/LICENSE.
 *
 * The License is based on the Mozilla Public License Version 1.1 but
 * Sections 14 and 15 have been added to cover use of software over a
 * computer network and provide for limited attribution for the
 * Original Developer. In addition, Exhibit A has been modified to be
 * consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an “AS IS”
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is the citation formatting software known as
 * "citeproc-js" (an implementation of the Citation Style Language
 * [CSL]), including the original test fixtures and software located
 * under the ./std subdirectory of the distribution archive.
 *
 * The Original Developer is not the Initial Developer and is
 * __________. If left blank, the Original Developer is the Initial
 * Developer.
 *
 * The Initial Developer of the Original Code is Frank G. Bennett,
 * Jr. All portions of the code written by Frank G. Bennett, Jr. are
 * Copyright (c) Frank G. Bennett, Jr. 2009. All Rights Reserved.
 */
dojo.provide("csl.range");
if (!CSL) {
	load("./src/csl.js");
}

/**
 * An output instance object representing a number or a range
 *
 * with attributes next and start, and
 * methods isRange(), renderStart(), renderEnd() and renderRange().
 * At render time, the output queue will perform optional
 * collapsing of these objects in the queue, according to
 * configurable options, and apply any decorations registered
 * in the object to the output elements.
 * @namespace Range object and friends.
 */

CSL.Output.Number = function(num,mother_token){
	this.alldecor = new Array();
	this.num = num;
	this.blobs = num.toString();
	this.status = CSL.START;
	this.strings = new Object();
	if (mother_token){
		this.decorations = mother_token.decorations;
		this.strings.prefix = mother_token.strings.prefix;
		this.strings.suffix = mother_token.strings.suffix;
		this.successor_prefix = mother_token.successor_prefix;
		this.range_prefix = mother_token.range_prefix;
		this.splice_prefix = "";
		this.formatter = mother_token.formatter;
		if (!this.formatter){
			this.formatter =  new CSL.Output.DefaultFormatter();
		}
		if (this.formatter){
			this.type = this.formatter.format(1);
		}
	} else {
		this.decorations = new Array();
		this.strings.prefix = "";
		this.strings.suffix = "";
		this.successor_prefix = "";
		this.range_prefix = "";
		this.splice_prefix = "";
		this.formatter = new CSL.Output.DefaultFormatter();
	}
};


CSL.Output.Number.prototype.setFormatter = function(formatter){
	this.formatter = formatter;
	this.type = this.formatter.format(1);
};


CSL.Output.DefaultFormatter = function (){};
CSL.Output.DefaultFormatter.prototype.format = function (num){
	return num.toString();
};

//
// XXXXX: This needs a little attention.  Non-sequential numbers
// that follow other numbers should be marked SUCCESSOR.  They are
// currently marked START (i.e. they are ignored).  It looks like
// there are more combinations than can be expressed or handled
// with the three state flags in place at the moment.
//
CSL.Output.Number.prototype.checkNext = function(next){
	if ( ! next || ! next.num || this.type != next.type || next.num != (this.num+1)){
		if (this.status == CSL.SUCCESSOR_OF_SUCCESSOR){
			this.status = CSL.END;
		}
		if ("object" == typeof next){
			next.status = CSL.SEEN;
		}
	} else { // next number is in the sequence
		if (this.status == CSL.START || this.status == CSL.SEEN){
			next.status = CSL.SUCCESSOR;
		} else if (this.status == CSL.SUCCESSOR || this.status == CSL.SUCCESSOR_OF_SUCCESSOR){
			if (this.range_prefix){
				next.status = CSL.SUCCESSOR_OF_SUCCESSOR;
				this.status = CSL.SUPPRESS;
			} else {
				next.status = CSL.SUCCESSOR;
			}

		}
		// won't see this again, so no effect of processing, but this
		// wakes up the correct delimiter.
		if (this.status == CSL.SEEN){
			this.status = CSL.SUCCESSOR;
		}
	};
};
