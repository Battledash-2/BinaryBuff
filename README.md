# 🔢BinaryBuff🐃
## Copyright&copy; MIT ---- Battledash-2 (& BinaryBuff)

## What is it?
#### ***BinaryBuff*** is a module to convert strings and unsigned integers to buffers,<br>then later on save it and read it from a binary file.

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

const hello = bbuf.string.encode("Hello, ");
const world = bbuf.string.encode("world!");

console.log(bbuf.string.decode(hello) + bbuf.string.decode(world));
```

### Encoding multiple values
#### To encode multiple values, we can use `BinaryBuff.encode`
```js
const bbuf = require('binarybuff');

console.log(bbuf.encode(42, "hello"));
```

### Encoding objects/arrays (❗ USAGE IS NOT RECOMMENDED ❗)
#### Usage of object encoding is not recommended:
- Object encoding uses a object-to-string method
- Arbitrary code execution is possible

#### Encoding an object is only possible via `BinaryBuff.encode`
```js
const bbuf = require('binarybuff');

const encoded = bbuf.encode([ 53, 89 ], { hello: "Hello, ", sayHelloTo: (usr)=>{console.log("Hello,", usr);} });
bbuf.decode(encoded)[1].sayHelloTo("me!");
```