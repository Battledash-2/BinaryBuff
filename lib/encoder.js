const fs = require('fs');
const OP = require('./op');

const offset = OP.OFFSET;
const max    = 255;

// Internal
const _encodeInt = (int=0) => {
	let oint = int.toString().split('.');
	let op = int < 0 ? OP.NINT : OP.INT;
	int = Math.abs(Math.floor(int)); // remove decs
	const maxInInt = Math.floor(int/max);
	let i = maxInInt;

	let result = [ op ];

	while (i > 0) {
		result.push(255);
		i--;
	}

	result.push(int%max);
	
	if (oint.length > 1) {
		result.push(OP.SPLIT);
		const p2 = parseInt(oint[1]);
		let sp2  = _encodeInt(p2).slice(1, -1);
		result.push(...sp2);
	}

	result.push(OP.END);
	return result;
}
const _decodeInt = (int=[]) => {
	let res = 0;
	for (let c = 0; c<int.slice(1, -1).length; c++) {
		let i = int.slice(1, -1)[c];
		if (i === OP.SPLIT) {
			let l = parseFloat('0.'+_decodeInt([OP.INT, ...int.slice(c+2, -1), OP.END]));
			res += l;
			c = int.length+1;
			// console.log(l, _decodeInt([OP.INT, ...int.slice(c+2, -1), OP.END]), [OP.INT, ...int.slice(c+2, -1), OP.END])
			continue;
		}
		res += i;
	}
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
	if (int < 0) return _encodeInt(int - offset);
	return _encodeInt(int + offset);
}
const decodeInt = (int=[]) => {
	let o = _decodeInt(int);
	if (int[0] === OP.NINT) return -(o - offset);
	return o - offset;
}

// Fake
const encodeArray = (array=[], mode=0) => {
	let out = '[';
	for (let i = 0; i<array.length; i++) {
		let cur = array[i];
		let isEnd = i >= array.length-1;
		switch (typeof cur) {
			default:
			case 'number':
				out += cur;
				break;
			case 'string':
				out += '"'+cur.replace(/"/g, "\\\"")+'"';
				break;
			case 'object':
				if (Array.isArray(cur)) {
					out += encodeArray(cur, 1);
					break;
				}
				out += encodeObject(cur, 1);
		}
		if (!isEnd) out += ', ';
	}
	out += ']';
	let o = out;
	if (!mode) {
		o = encodeString(out);
		o[0] = OP.ARRAY;
	}
	return o;
}

const decodeArray = (arr='[]') => {
	return eval(decodeString(arr));
}

const encodeObject = (object={}, mode=0) => {
	let out = 'let obj = {';
	if (mode) out = '{';
	let objL = Object.keys(object).length;
	let c = 0;
	for (let i in object) {
		let cur = object[i];
		let isEnd = c >= objL-1;
		c++;
		out += '"'+i.replace(/"/g, "\\\"")+'": ';
		switch (typeof cur) {
			default:
			case 'number':
				out += cur.toString();
				break;
			case 'string':
				out += '"'+cur.replace(/"/g, "\\\"")+'"';
				break;
			case 'object':
				if (Array.isArray(cur)) {
					out += encodeArray(cur, 1);
					break;
				}
				out += encodeObject(cur, 1);
		}
		if (!isEnd) out += ', ';
	}
	if (!mode) { out += '}; obj;'; }
	else { out += '}'; }
	let o = out;
	if (!mode) {
		o = encodeString(out);
		o[0] = OP.ARRAY;
	} else {

	}
	return o;
}

const encodeStr1 = (str='') => { return encodeString(str).slice(1, -1); }
const decodeStr1 = (str=[]) => { return decodeString([OP.STRING, ...str, OP.END]); }

const encodeInt1 = (int=1) => { return encodeInt(int).slice(1, -1); }
const decodeInt1 = (int=[]) => { return decodeInt([OP.INT, ...int, OP.END]); }

// Decode Full File
const decode = (buffer=[]) => {
	let result = [];
	let out = [];
	let cout = [];
	
	for (let c of buffer) {
		if (c === OP.END) {
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
			case OP.NINT:
				result.push(decodeInt(c));
				break;
			case OP.ARRAY:
				result.push(decodeArray(c));
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
			case 'object':
				if (Array.isArray(cur)) {
					output.push(encodeArray(cur));
					break;
				}
				output.push(encodeObject(cur));
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
	
	encodeString: encodeStr1,
	decodeString: decodeStr1,
	
	encodeInt: encodeInt1,
	decodeInt: decodeInt1,

	save,
	read,
};