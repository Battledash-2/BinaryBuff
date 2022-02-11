const OP   = {};

let enums = {};
function Enum(id='main', reset=false) {
	id = id ?? 'main';
	if (!enums.hasOwnProperty(id) || reset) enums[id] = 0;
	return enums[id]++;
}

OP.END     = Enum(null, true); // End of a value (OP.STRING, charcode, charcode, charcode, OP.END)
OP.INT     = Enum(); // : 2
OP.STRING  = Enum(); // : 3

module.exports = OP;