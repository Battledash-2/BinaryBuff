const encoder = require('./encoder');

const encoded = encoder.encode(-784.42);
console.log(encoded);

const decoded = encoder.decode(encoded);
console.log(decoded);

// encoder.save('exec.bin', encoded);
// console.log(encoder.decode(encoder.read('exec.bin')));