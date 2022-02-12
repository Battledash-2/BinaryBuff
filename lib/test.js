const encoder = require('./encoder');

const encoded = encoder.encode([
	"nested",
	[
		"arrays",
		"ftw",
	],
	"boii"
]);
console.log(encoded);

const decoded = encoder.decode(encoded);
console.log(decoded);

// encoder.save('exec.bin', encoded);
// console.log(encoder.decode(encoder.read('exec.bin')));