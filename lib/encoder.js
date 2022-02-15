const fs = require('fs');
const OP = require('./op');

const userOps = [];

let offset = OP.OFFSET;
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
	for (let char in string) {
		const charCode = string.charCodeAt(char);
		if (charCode > max) {
			let c = _encodeInt(charCode + offset).slice(1, -1);
			output.push(OP.LONG_CHAR, ...c, OP.LONG_END);
			continue;
		}
		output.push(charCode+offset);
	}
	output.push(OP.END);
	return output;
}
const decodeString = (string=[]) => {
	let output = '';
	let longChar = 0;
	let inLongChar = false;
	for (let char of string.slice(1, -1)) {
		if (char === OP.LONG_CHAR) {
			inLongChar = true;
			continue;
		}
		if (char === OP.LONG_END) {
			if (!inLongChar) throw new Error(`Long character end without being inside of a long character`);
			inLongChar = false;
			output += String.fromCharCode(longChar - offset);
			longChar = 0;
			continue;
		}
		if (inLongChar) {
			longChar += char;
			continue;
		}
		output += String.fromCharCode(char-offset);
	}
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
const encodeWithOperator = (operator=offset, content=[], end=OP.END) => {
	if (typeof content !== 'object') content = [content];
	return [ operator, ...content, end ?? OP.END ];
}
const encodeWithOperatorEasy = (operator=offset, content=[], safe=true, end=OP.END) => {
	if (typeof content !== 'object') content = [content];
	const cont = encode(safe, ...content);
	return encodeWithOperator(operator, cont.slice(1, -1), end);
}

const addOp = (callback=()=>console.log('Empty callback for opcode: '+offset+1)) => {
	offset++;
	userOps.push(callback);
	return offset;
}

// Fake
const encodeArray = (array=[], mode=0, safe=true) => {
	if (!safe) {
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
						out += encodeArray(cur, 1, safe);
						break;
					}
					out += encodeObject(cur, 1, safe);
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
	} else {
		return JSON.parse(array);
	}
}

const decodeArray = (arr=[], safe=true) => {
	const str = decodeString(arr);
	
	if (!safe) {
		if (!(str.startsWith('[') && str.endsWith(']')) &&
			!(str.startsWith('let obj = {') && str.endsWith('}; obj;')))
				throw new Error(`[DecodeObject: FATAL] Detected possible arbitrary code execution.`);

		return eval(str);
	} else {
		return JSON.stringify(str);
	}
}

const encodeObject = (object={}, mode=0, safe=true) => {
	if (!safe) {
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
						out += encodeArray(cur, 1, safe);
						break;
					}
					out += encodeObject(cur, 1, safe);
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
	} else {
		return JSON.parse(object);
	}
}

const encodeStr1 = (str='') => { return encodeString(str).slice(1, -1); }
const decodeStr1 = (str=[]) => { return decodeString([OP.STRING, ...str, OP.END]); }

const encodeInt1 = (int=1) => { return encodeInt(int).slice(1, -1); }
const decodeInt1 = (int=[]) => { return decodeInt([OP.INT, ...int, OP.END]); }

// Decode Full File
const decode = (buffer=[], safe=true) => {
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
				if (safe) {
					result.push(decodeArray(c))
				} else {
					result.push(decodeArray(c, false));
				}
				break;
			default:
				if (mode - offset in userOps) {
					result.push(userOps[mode - offset](c));
				} else {
					throw new Error(`Unknown opcode: ${mode}`);
				}
		}
	}

	return result;
}

const encode = (safe=true, ...input) => {
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
					if (safe) {
						output.push(encodeArray(cur));
					} else {
						output.push(encodeArray(cur, false));
					}
					break;
				}
				if (safe) { output.push(encodeObject(cur)); }
				else { output.push(encodeObject(cur, 0, false)); };
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

	internal: {
		handleOperator: addOp,
		rawEncode: encodeWithOperator,
		encode: encodeWithOperatorEasy,
		opcodeSet: OP,
	},

	save,
	read,
};