/**

   Demangler for C++ function names, written in Javascript
   Copyright (C) Arthur Mendes, licensed under the MIT license

**/

const itanium_abi = require('./itanium-abi.js');

module.exports = {

    demangle: function(fname) {
	if (itanium_abi.isMangled(fname))
	    return itanium_abi.demangle(fname);

	return fname;
    }
    
};
