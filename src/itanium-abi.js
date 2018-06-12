/**
   Demangles C++ function names mangled according to the IA64 C++ ABI

   This is a pretensious and cocky way to say that this file demangles function names
   mangled by GCC and Clang.

   Material used: https://itanium-cxx-abi.github.io/cxx-abi/abi.html#mangling
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

	/* St means std:: in the mangled string 
	   This std:: check is for inside the name, not outside, 
	   unlike the one in the demangle function
	 */
	if (str.substr(1, 2) === "St") {
	    namestr = namestr.concat("std::");
	    str = str.replace("St", "");
	    rlen++;
	}

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

	let template_count = 0;
	let template_types = [];

	// Process the types
	let str = fname.str;
	
	while (str.length > 0) {
	    let process = popChar(str);

	    /* The type info

	       isBase -> is the type the built-in one in the mangler, represented with few letters?
	       typeStr: the type name
	       templateType: type info for the current template.

	       The others are self descriptive
	    */
	    let typeInfo = {isBase: true, typeStr: "", isConst: false, numPtr: 0,
			    isRValueRef: false, isRef: false, isRestrict: false,
			    templateStart: false, templateEnd: false,
			    isVolatile: false, templateType: null};

	    /* Check if we have a qualifier (like const, ptr, ref... )*/
	    var doQualifier = true;

	    while (doQualifier) {
		switch (process.ch) {
		case 'R': typeInfo.isRef = true; process = popChar(process.str); break;
		case 'O': typeInfo.isRValueRef = true; process = popChar(process.str); break;
		case 'r': typeInfo.isRestrict = true; process = popChar(process.str); break;
		case 'V': typeInfo.isVolatile = true; process = popChar(process.str); break;
		case 'K': typeInfo.isConst = true; process = popChar(process.str); break;
		case 'P': typeInfo.numPtr++; process = popChar(process.str); break;
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
	    case 'S':
		/* Abbreviated std:: types */
		process = popChar(process.str);

		switch (process.ch) {
		case 't': {
		    // It's a custom type name
		    const tname = popName(process.str);
		    typeInfo.typeStr = "std::".concat(tname.name);
		    process.str = tname.str;
		    break;
		}
		case 'a': typeInfo.typeStr = "std::allocator"; break;
		case 'b': typeInfo.typeStr = "std::basic_string"; break;
		case 's': typeInfo.typeStr = "std::basic_string<char, std::char_traits<char>, std::allocator<char>>"; break;
		case 'i': typeInfo.typeStr = "std::basic_istream<char, std::char_traits<char>>"; break;
		case 'o': typeInfo.typeStr = "std::basic_ostream<char, std::char_traits<char>>"; break;
		case 'd': typeInfo.typeStr = "std::basic_iostream<char, std::char_traits<char>>"; break;
		default:
		    process.str = process.ch.concat(process.str);
		    break;
		}
		
		break;
		
	    case 'I':
		// Template open bracket (<)
		types[types.length-1].templateStart = true;
		template_types.push(types[types.length-1]);
		template_count++;
		
		break;
	    case 'E':
		// Template closing bracket (>)
		if ((template_count <= 0)) {
		    str = process.str;
		    continue;
		}
		
		typeInfo.templateEnd = true;

		template_count--;
		typeInfo.templateType = template_types[template_count];
		template_types = template_types.slice(0, -1);
		
		break;
				
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

		/* No type code. We have a type name instead */
	    default: {
		if (!isNaN(parseInt(process.ch, 10)) || process.ch == "N") {

		    // It's a custom type name
		    const tname = popName(process.ch.concat(process.str));
		    typeInfo.typeStr = typeInfo.typeStr.concat(tname.name);
		    process.str = tname.str;
		}

	    } break;
	    }


	    types.push(typeInfo);
	    str = process.str;
	}

	/* Create the string representation of the type */
	const typelist = types.map((t) => {
	    let typestr = "";
	    if (t.isConst) typestr = typestr.concat("const ");
	    if (t.isRestrict) typestr = typestr.concat("__restrict ");
	    if (t.isVolatile) typestr = typestr.concat("volatile ");
	    
	    typestr = typestr.concat(t.typeStr);

	    if (t.templateStart) typestr = typestr.concat("<");
	    if (t.templateEnd) typestr = typestr.concat(">");

	    if (!t.templateStart) {
		if (t.isRef) typestr = typestr.concat("&");
		if (t.isRValueRef) typestr = typestr.concat("&&");
		for (let i = 0; i < t.numPtr; i++) typestr = typestr.concat("*");
	    }
	    
	    if (t.templateType) {		
		if (t.templateType.isRef) typestr = typestr.concat("&");
		if (t.templateType.isRValueRef) typestr = typestr.concat("&&");
		for (let i = 0; i < t.templateType.numPtr; i++) typestr = typestr.concat("*");
	    }
	    
	    return typestr;
	});

	/* Those replaces are an stupid shortcut to fix templates and make it fast
	   Without that, we would need to complicate the code

	   What it does is remove the commas where we would have the angle brackets
	   for the templates
	*/
	
	return functionname.concat("(" + typelist.join(', ') + ")").replace(/<, /g, "<")
	    .replace(/<, /g, "<").replace(/, >/g, ">").replace(/, </g, "<");
    }

};
