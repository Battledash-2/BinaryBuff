# 🔢BinaryBuff🐃
## Copyright&copy; MIT ---- Battledash-2 (& BinaryBuff)

## What is it?
#### ***BinaryBuff*** is a module to convert strings and floats or integers to buffers<br>then later on save it and read it from a binary file.

### Usage:
#### Encoding an value:
##### Encoding an integer is simple.
##### Use the `int.encode`. To encode a string, we use `string.encode`
```js
const bbuf = require('binarybuff');

const encodedInt = bbuf.int.encode(532);
const encodedStr = bbuf.string.encode("hello");
```

#### Decoding a value:
##### Decoding a value is the exact same as encoding, except we use `decode` instead of `encode`
```js
const bbuf = require('binarybuff');

const hello = bbuf.string.encode(true, "Hello, ");
const world = bbuf.string.encode(true, "world!");

console.log(bbuf.string.decode(hello) + bbuf.string.decode(world));
```

### Encoding multiple values
#### When we use the `encode` function directly, we have to specify whether we would like to encode it in safe mode or not.
#### To encode multiple values, we can use `BinaryBuff.encode`
```js
const bbuf = require('binarybuff');

console.log(bbuf.encode(true, 42, "hello"));
```

### Creating a custom operator
#### If you're looking for custom functionality in `BinaryBuff`, you can add your own operator for the decoder
#### `BinaryBuff.internal.handleOperator` creates a new operator and returns the opcode of your operator
```js
const bbuf = require('binarybuff');
const helloOperator = bbuf.internal.handleOperator((value) => {
	console.log('My custom operator!');
	return "Hello, " + bbuf.string.decode(value);
});

const encodeHelloOperator = (helloTo='me') => {
	return bbuf.internal.encode(helloOperator, helloTo);
};

console.log(bbuf.decode(encodeHelloOperator('BinaryBuff')));
```

### Encoding objects/arrays (❗ USAGE IS NOT RECOMMENDED ❗)
#### Encoding an object is only possible via `BinaryBuff.encode`
#### If you'd like to store any sort of Javascript functions,<br/> you have to encode and decode it as an unsafe object.
```js
const bbuf = require('binarybuff');

const encoded = bbuf.encode(false, [ 53, 89 ], { hello: "Hello, ", sayHelloTo: (usr)=>{console.log("Hello,", usr);} });
bbuf.decode(encoded, false)[1].sayHelloTo("me!");
```