// encode base64
if (typeof Buffer.from === "function") {
  // Node 5.10+
  buf = Buffer.from(str).toString('base64'); // Ta-da
} else {
  // older Node versions
  buf = new Buffer(str).toString('base64'); // Ta-da
}

// decode base64
if (typeof Buffer.from === "function") {
  // Node 5.10+
  buf = Buffer.from(b64string, 'base64'); // Ta-da
} else {
  // older Node versions
  buf = new Buffer(b64string, 'base64'); // Ta-da
}
