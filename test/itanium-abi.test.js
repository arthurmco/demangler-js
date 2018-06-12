/* Test the itanium abi compatibility */


const assert = require('assert');
const itanium_abi = require('./../src/itanium-abi');

/* It seems that you can't retrieve the return type from the demangled name */

describe('Free Functions', () => {

    it('Receives nothing, return void', (done) => {
	assert.equal(itanium_abi.demangle("_Z7doThingv"), "doThing()");
	done();
    });

    it('receives integer', (done) => {
	assert.equal(itanium_abi.demangle("_Z5isInti"), "isInt(int)");
	done();
    });

    it('receives long int', (done) => {
	assert.equal(itanium_abi.demangle("_Z9test_longl"), "test_long(long int)");
	done();
    });


    it('receives long long int', (done) => {
	assert.equal(itanium_abi.demangle("_Z9test_longx"), "test_long(long long int)");
	done();
    });

    it('receives unsigned int', (done) => {
	assert.equal(itanium_abi.demangle("_Z9test_uintj"), "test_uint(unsigned int)");
	done();
    });

    it('receives size_t', (done) => {
	assert.equal(itanium_abi.demangle("_Z10test_sizetm"), "test_sizet(size_t)");
	done();
    });

    it('receives signed size_t', (done) => {
	assert.equal(itanium_abi.demangle("_Z11test_ssizetl"), "test_ssizet(ssize_t)");
	done();
    });

    it('receives double', (done) => {
	assert.equal(itanium_abi.demangle("_Z5isIntd"), "isInt(double)");
	done();
    });

    it('receives double+int', (done) => {
	assert.equal(itanium_abi.demangle("_Z5isIntdi"), "isInt(double, int)");
	done();
    });

    it('receives const char ptr', (done) => {
	assert.equal(itanium_abi.demangle("_Z13testConstCharPKc"), "testConstChar(const char*)");
	done();
    });

    it('receives char ptr', (done) => {
	assert.equal(itanium_abi.demangle("_Z11testCharPtrPc"), "testCharPtr(char*)");
	done();
    });

    it('receives reference to an int', (done) => {
	assert.equal(itanium_abi.demangle("_Z16testIntReferenceRi"), "testIntReference(int&)");
	done();
    });

    it('receives reference to an int and a double', (done) => {
	assert.equal(itanium_abi.demangle("_Z16testIntReferenceRid"),
		     "testIntReference(int&, double)");
	done();
    });

    it('receives a custom struct', (done) => {
	assert.equal(itanium_abi.demangle("_Z16testCustomStruct11test_struct"),
		     "testCustomStruct(test_struct)");
	done();
    });

    it('receives a pointer to a custom struct', (done) => {
	assert.equal(itanium_abi.demangle("_Z16testCustomStructP11test_struct"),
		     "testCustomStruct(test_struct*)");
	done();
    });


    it('receives a reference to a custom struct', (done) => {
	assert.equal(itanium_abi.demangle("_Z16testCustomStructR11test_struct"),
		     "testCustomStruct(test_struct&)");
	done();
    });


    it('receives a custom struct and an int', (done) => {
	assert.equal(itanium_abi.demangle("_Z16testCustomStruct11test_structi"),
		     "testCustomStruct(test_struct, int)");
	done();
    });

});

describe('classes', () => {
    it('public function, receives nothing', (done) => {
	assert.equal(itanium_abi.demangle("_ZN10test_class4testEv"), "test_class::test()");
	done();
    });

    it('public function, receives an integer', (done) => {
	assert.equal(itanium_abi.demangle("_ZN10test_class4testEi"), "test_class::test(int)");
	done();
    });

    it('private function, receives nothing', (done) => {
	assert.equal(itanium_abi.demangle("_ZN10test_class12test_privateEv"),
		     "test_class::test_private()");
	done();
    });
    
    it('private function, receives an integer', (done) => {
	assert.equal(itanium_abi.demangle("_ZN10test_class12test_privateEi"),
		     "test_class::test_private(int)");
	done();
    });

    it('free function, receives a class', (done) => {
	assert.equal(itanium_abi.demangle("_Z21function_return_class10test_class"),
		     "function_return_class(test_class)");
	done();
    });

    it('free function, receives a class ref', (done) => {
	assert.equal(itanium_abi.demangle("_Z21function_return_classR10test_class"),
		     "function_return_class(test_class&)");
	done();
    });
    
    it('free function, receives a class ptr', (done) => {
	assert.equal(itanium_abi.demangle("_Z21function_return_classP10test_class"),
		     "function_return_class(test_class*)");
	done();
    });

});

describe('namespaces', () => {
    it('receives integer', (done) => {
	assert.equal(itanium_abi.demangle("_ZN4test14testNamespacedEi"), "test::testNamespaced(int)");
	done();
    });

    it('receives integer and a struct within another namespace', (done) => {
	assert.equal(itanium_abi.demangle("_ZN4test14testNamespacedEiN9othertest10teststructE"),
		     "test::testNamespaced(int, othertest::teststruct)");
	done();
    });


    it('receives integer and a reference to a struct within another namespace', (done) => {
	assert.equal(itanium_abi.demangle("_ZN4test14testNamespacedEiRN9othertest10teststructE"),
		     "test::testNamespaced(int, othertest::teststruct&)");
	done();
    });

});

describe('std types', () => {
    it('receives std::string', (done) => {
	assert.equal(itanium_abi.demangle(
	    "_Z10testStringNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEEE"),
		     "testString(std::string)");
	done();
    });

    it('receives std::string ref', (done) => {
	assert.equal(itanium_abi.demangle(
	    "_Z10testStringRNSt7__cxx1112basic_stringIcSt11char_traitsIcESaIcEEE"),
		     "testString(std::string&)");
	done();
    });

    it('receives std::vector<int>', (done) => {
	assert.equal(itanium_abi.demangle(
	    "_Z10testVectorSt6vectorIiSaIiEE"), "testVector(std::vector<int>)");
	done();
    });

});
