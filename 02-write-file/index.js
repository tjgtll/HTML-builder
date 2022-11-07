const {
    stdin,
    stdout
  } = process;
  const path = require('path');
  const fs = require('fs');
  const readline = require('readline');
  
  
  const writeToFile = fs.createWriteStream(path.resolve(__dirname, 'newText.txt'));
  
  stdout.write('The new file has created.\n');
    stdout.write('Please, type some text and then press "Enter" to append the text line to new file (type "exit" or press "Ctrl+c" to finish the process):\n');
  stdin.on('data', (data) => {
    if (data.toString().toLowerCase().trim() == 'exit') {
      console.log('File editing is done. Bye! (exit by exit command)');
      writeToFile.end();
      process.exit();
    } else {
      writeToFile.write(data, (err) => {
        if (err) {
          throw err;
        }
      });
    }
  });
  process.on('SIGINT', () => {
    console.log('File editing is done. Bye! (exit by pressing "Ctrl+c")');
    writeToFile.end();
    process.exit();
  });