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
