/**
   Demangles C++ function names mangled according to the IA64 C++ ABI

   This is a pretensious and cocky way to say that this file demangles function names
   mangled by GCC and Clang.
**/

/* Removes a mangled name from 'str', in the mangled name format
   Returns an object. The 'name' property is the name, the 'str' is the remainder of the string */
function popName(str) {
    /* The name is in the format <length><str> */

    let isLast = false;
    let namestr = "";
    let rlen = 0;
    const ostr = str;
    let isEntity = false;

    while (!isLast) {
	
	/* This is used for decoding names inside complex namespaces
	   Whenever we find an 'N' preceding a number, it's a prefix/namespace
	*/
	isLast = str[0] != "N";

	/* This is used for us to know we'll find an E in the end of this name
	   The E marks the final of our name
	*/
	isEntity = isEntity || !isLast;
	
	if (!isLast)
	    str = str.substr(1);
	
	const res = /(\d*)/.exec(str);
	
	const len = parseInt(res[0], 10);

	rlen += res[0].length + len;
	
	const strstart = str.substr(res[0].length);
	namestr = namestr.concat(strstart.substr(0, len));

	if (!isLast) namestr = namestr.concat("::");
	str = strstart.substr(len);
    }

    if (isEntity)
	rlen += 2; // Take out the "E", the entity end mark

    return {name: namestr, str: ostr.substr(rlen)};
}

function popChar(str) {
    return {ch: str[0], str: str.slice(1)};
}

module.exports = {

    /* Check if the name passed is a IA64 ABI mangled name */
    isMangled: function(name) {
	return name.startsWith("_Z");
    },

    demangle: function(name) {

	if (!this.isMangled(name)) return name;

	/* Encoding is the part between the _Z (the "mangling mark") and the dot, that prefix
	   a vendor specific suffix. That suffix will not be treated here yet */
	const encoding = name.substr(2,
				     (name.indexOf('.') < 0) ? undefined : name.indexOf('.')-2);


	let fname = popName(encoding);
	let functionname = fname.name;
	let types = [];

	// Process the types
	let str = fname.str;

	while (str.length > 0) {
	    let process = popChar(str);

	    /* The type info

	       isBase -> is the type the built-in one in the mangler, represented with few letters?
	       typeStr: the type name

	       The others are self descriptive
	    */
	    let typeInfo = {isBase: true, typeStr: "", isConst: false, isPtr: false,
			    isRValueRef: false, isRef: false, isRestrict: false,
			    isVolatile: false};

	    /* Check if we have a qualifier (like const, ptr, ref... )*/
	    var doQualifier = true;

	    while (doQualifier) {
		switch (process.ch) {
		case 'R': typeInfo.isRef = true; process = popChar(process.str); break;
		case 'O': typeInfo.isRValueRef = true; process = popChar(process.str); break;
		case 'r': typeInfo.isRestrict = true; process = popChar(process.str); break;
		case 'V': typeInfo.isVolatile = true; process = popChar(process.str); break;
		case 'K': typeInfo.isConst = true; process = popChar(process.str); break;
		case 'P': typeInfo.isPtr = true; process = popChar(process.str); break;
		default: doQualifier = false;
		}
	    }

	    /* Get the type code. Process it */
	    switch (process.ch) {
	    case 'v': typeInfo.typeStr = "void"; break;
	    case 'w': typeInfo.typeStr = "wchar_t"; break;
	    case 'b': typeInfo.typeStr = "bool"; break;
	    case 'c': typeInfo.typeStr = "char"; break;
	    case 'a': typeInfo.typeStr = "signed char"; break;
	    case 'h': typeInfo.typeStr = "unsigned char"; break;
	    case 's': typeInfo.typeStr = "short"; break;
	    case 't': typeInfo.typeStr = "unsigned short"; break;
	    case 'i': typeInfo.typeStr = "int"; break;
	    case 'j': typeInfo.typeStr = "unsigned int"; break;
	    case 'l': typeInfo.typeStr = "long int"; break;
	    case 'm': typeInfo.typeStr = "unsigned long int"; break;
	    case 'x': typeInfo.typeStr = "long long int"; break;
	    case 'y': typeInfo.typeStr = "unsigned long long int"; break;
	    case 'n': typeInfo.typeStr = "__int128"; break;
	    case 'o': typeInfo.typeStr = "unsigned __int128"; break;
	    case 'f': typeInfo.typeStr = "float"; break;
	    case 'd': typeInfo.typeStr = "double"; break;
	    case 'e': typeInfo.typeStr = "long double"; break;
	    case 'g': typeInfo.typeStr = "__float128"; break;
	    case 'z': typeInfo.typeStr = "..."; break;	    
	    default: {
		if (!isNaN(parseInt(process.ch, 10))) {
		    
		    // It's a custom type name
		    const tname = popName(process.ch.concat(process.str));
		    typeInfo.typeStr = tname.name;
		    process.str = tname.str;
		}
		
	    } break;
	    }


	    types.push(typeInfo);
	    str = process.str;
	}

	const typelist = types.map((t) => {
	    let typestr = "";
	    if (t.isConst) typestr = typestr.concat("const ");
	    if (t.isRestrict) typestr = typestr.concat("__restrict ");
	    if (t.isVolatile) typestr = typestr.concat("volatile ");

	    typestr = typestr.concat(t.typeStr);
	    if (t.isRef) typestr = typestr.concat("&");
	    if (t.isRValueRef) typestr = typestr.concat("&&");
	    
	    if (t.isPtr) typestr = typestr.concat("*");

	    return typestr;
	});

	return functionname.concat("(" + typelist.join(', ') + ")");
    }

};
