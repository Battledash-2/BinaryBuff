const encoder = require('./encoder');

const helloOperator = encoder.internal.handleOperator((value) => {
	console.log('My custom operator!');
	return "Hello, " + encoder.string.decode(value);
});

const encodeHelloOperator = (helloTo='me') => {
	return encoder.internal.encode(helloOperator, helloTo);
};

console.log(encoder.decode(encodeHelloOperator('BinaryBuff')));