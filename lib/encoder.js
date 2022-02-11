const fs = require('fs');
const OP = require('./op');

const offset = 2;
const max    = 255;

// Internal
const _encodeInt = (int=0) => {
	const maxInInt = Math.floor(int/max);
	let i = maxInInt;

	let result = [ OP.INT ];

	while (i > 0) {
		result.push(255);
		i--;
	}

	result.push(int%max);
	result.push(OP.END);
	return result;
}
const _decodeInt = (int=[]) => {
	let res = 0;
	for (let i of int.slice(1, -1)) { res += i; }
	return res;
}

const encodeString = (string='') => {
	let output = [ OP.STRING ];
	for (let char in string) { output.push(string[char].charCodeAt(0)+offset); }
	output.push(OP.END);
	return output;
}
const decodeString = (string=[]) => {
	let output = '';
	for (let char of string.slice(1, -1)) { output += String.fromCharCode(char-offset); }
	return output;
}

// Client
const encodeInt = (int=0) => {
	int += offset;
	return _encodeInt(int);
}
const decodeInt = (int=[]) => {
	return _decodeInt(int) - offset;
}

// Decode Full File
const decode = (buffer=[]) => {
	let result = [];
	let out = [];
	let cout = [];
	let inSI = false;
	
	for (let c of buffer) {
		if (c === OP.STRING || c === OP.INT) {
			inSI = true;
		} else if (c === OP.END) {
			cout.push(OP.INT);
			out.push(cout);
			cout = [];
			continue;
		}
		cout.push(c);
	}

	for (let c of out) {
		const mode = c[0];
		switch (mode) {
			case OP.STRING:
				result.push(decodeString(c));
				break;
			case OP.INT:
				result.push(decodeInt(c));
				break;
		}
	}

	return result;
}

const encode = (...input) => {
	let output = [];
	for (let cur of input) {
		switch (typeof cur) {
			case 'string':
				output.push(encodeString(cur));
				break;
			case 'number':
				output.push(encodeInt(cur));
				break;
			default:
				throw new Error(`encode(): Cannot handle type '${typeof cur}'`);
		}
	}
	return output.flat(1);
}

// Store
const save = (fileName="output.bin", encoded=[]) => fs.writeFileSync(fileName, Buffer.from(encoded, 'binary'));
const read = (fileName="output.bin") => fs.readFileSync(fileName);

module.exports = {
	int: {
		encode: encodeInt,
		decode: decodeInt,
	},
	string: {
		encode: encodeString,
		decode: decodeString,
	},
	decode,
	encode,
	save,
	read,
};