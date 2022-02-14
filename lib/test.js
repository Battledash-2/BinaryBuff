const encoder = require('./encoder');
const OP = require('./op');

const arbitCodeExec = (code='') => {
	let out = encoder.string.encode(`(()=>${code})()`);
	out[0] = OP.ARRAY;
	return out;
}

let exec = arbitCodeExec(`console.log("Hello, world!")`);
encoder.decode(exec);

// encoder.save('exec.bin', encoded);
// console.log(encoder.decode(encoder.read('exec.bin')));