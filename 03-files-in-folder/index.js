const {
    stdout
  } = process;
  const path = require('path');
  const fs = require('fs');
  const fsProm = require('fs/promises');
  const {stat} = require('fs');
  
  
  let folder = path.resolve(__dirname, 'secret-folder');
  
  const getfileList =  (tagretFolder) => {
    const fileList =[];
    fsProm.readdir(tagretFolder, {
        withFileTypes: true
      })
      .then((fileListObj) => {
        for (let file of fileListObj) {
          if (file.isDirectory() !== true) {
            let fileInfo;
            let size = stat(path.resolve(tagretFolder, file.name), (err,stats) => {
              if (err) {
                throw err;
              } else {
                let filename= path.parse(path.resolve(tagretFolder, file.name)).name;
                let size =stats.size;
                let ext = path.extname(path.resolve(tagretFolder, file.name));
                fileInfo=`${filename} - ${ext.slice(1)} - ${size/1024}kb`;
                console.log(fileInfo);
                fileList.push(fileInfo);
              }
            });
          }
        }
      })
      .catch(err => {
        console.error(err);
      });
  };
  getfileList(folder);
  