/**
   Demangles C++ function names mangled according to the IA64 C++ ABI

   This is a pretensious and cocky way to say that this file demangles function names
   mangled by GCC and Clang.
**/

module.exports = {

    /* Check if the name passed is a IA64 ABI mangled name */
    isMangled: function(name) {
	return name.startsWith("_Z");
    },

    demangle: function(name) {
	


	
    }
    
};
