const OP   = {};

let enums = {};
let def = 'main';
function Enum(id=def, reset=false) {
	id = id ?? 'main';
	if (!enums.hasOwnProperty(id) || reset) enums[id] = 0;
	return enums[id]++;
}

OP.END       = Enum(null, true); // End of a value (OP.STRING, charcode, charcode, charcode, OP.END)
OP.INT       = Enum(); // : 2
OP.STRING    = Enum(); // : 3

OP.ARRAY     = Enum(); // : 4

OP.OFFSET  = enums[def]-1;

module.exports = OP;