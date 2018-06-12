# demangler-js

A C++ demangler written in pure Javascript code

For now, it only demangles C++ functions generated from GCC and
Clang. MSVC will be supported soon, though.

You can also add support to your compiler (see below). And it doesn't
even need to be C++!

## Usage

```js

const demangler = require('demangler');

const fname = demangler.demangle("_Z23this_function_is_a_testi") 
console.log(fname);

// prints 'this_function_is_a_test(int)'

```

Since neither the variable names or the result type are encoded in the
mangled string, it is not known, and it will print only the types of
the parameters.

## License

MIT license.
