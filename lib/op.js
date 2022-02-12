const OP   = {};

let enums = {};
let def = 'main';
function Enum(id=def, reset=false) {
	id = id ?? def;
	if (!enums.hasOwnProperty(id) || reset) enums[id] = 0;
	return enums[id]++;
}

OP.END       = Enum(null, true); // End of a value (OP.STRING, charcode, charcode, charcode, OP.END)

OP.INT       = Enum(); // integer
OP.NINT      = Enum(); // negative integer
OP.SPLIT     = Enum(); // decimal numbers 

OP.STRING    = Enum();

OP.ARRAY     = Enum();

OP.OFFSET  = enums[def]-1;

module.exports = OP;