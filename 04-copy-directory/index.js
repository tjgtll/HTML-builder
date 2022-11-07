
const path = require('path');
const fs = require('fs');
const fsProm = require('fs/promises');
const copyFrom = path.resolve(__dirname, 'files');
const copyTo = path.resolve(__dirname, 'files-copy');
async function copyDir (sourceFolder,targetFolder) {
  return await new Promise(function(resolve,reject) {
  let updFlag=[false,0,0];
fsProm.readdir(sourceFolder, {
    withFileTypes: true
  })
  .then((fileListObj) => {
    updFlag[0]=true;
    let fileList = [];
    for (let file of fileListObj) {
      if (file.isDirectory() !== true) {
        fileList.push(file.name);
      }
    }
    fsProm.mkdir(targetFolder, {
        recursive: true
      })
      .then(() => {
        fsProm.readdir(targetFolder)
          .then((oldTargetList) => {
            if (oldTargetList.length > 0) {
              for (let file of oldTargetList) {
                if (!fileList.includes(file)) {
                  updFlag[1]+=1;
                  console.log('file in files-copy folder has to be removed: ', file);
                  fs.rm(path.resolve(targetFolder, file), {recursive: true, force:true}, (err) => {
                    if (err) {
                      console.error(err.message);
                      reject(false);
                      throw err;
                    }
                    console.log(`REMOVE file complete from files-copy: ${file}`);
                    updFlag[1]-=1;
                    if(updFlag[1]===0&&updFlag[2]===0) {
                      console.log('\ncopy/update directory done');
                      resolve(true);
                    }
                  });
                }
              }
              console.log('\n');
            }
            for (let i = 0; i < fileList.length; i++) {
              updFlag[2]+=1;
              fsProm.copyFile(path.resolve(sourceFolder, fileList[i]), path.resolve(targetFolder, fileList[i]))
                .then(() => {
                  console.log(`copy/update file complete from files to files-copy: ${fileList[i]}`);
                  updFlag[2]-=1;
                  if(updFlag[1]===0&&updFlag[2]===0) {
                    console.log('\ncopy/update directory done');
                    resolve(true);
                  }
                })
                .catch(err => {
                  console.error(err);
                  reject(false);
                  throw err;
                });
            }
          });
      })
      .catch(err => {
        console.error(err.message);
        reject(false);
        throw err;
      });
  })
  .catch(err => {
    console.error(err.message);
    throw err;
  });
});
}
async function showStatus () {
console.log('copy/update operation success status: ',await copyDir (copyFrom,copyTo));
}
showStatus ();