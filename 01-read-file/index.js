const {stdout}=process;
const path = require('path');
const fs = require('fs');

const readStream = fs.createReadStream(path.resolve(__dirname,'text.txt'));
readStream.on('data',(chunk) => {
  stdout.write(chunk);
});