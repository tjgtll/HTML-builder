const path = require('path');
const fs = require('fs');
const fsProm = require('fs/promises');

async function getFilesArr(folder, ext) {
  const fileList = await fsProm.readdir(folder, {
    withFileTypes: true
  }).then(res => res);
  const fileArr = fileList.filter((file) => {
    return (file.isDirectory() === false) && (path.extname(path.resolve(folder, file.name)) === `.${ext}`);
  }).map((e) => e.name);
  return fileArr;
}
async function getFileContentObjArray(folder, ext) {
  const filesArr = await getFilesArr(folder, ext).then(res => res);
  const stylesArrProm = Promise.all(filesArr.map((elem) => {
    return fsProm.readFile(path.resolve(folder, elem), 'utf-8');
  }));
  const stylesArr = await stylesArrProm.then(res => res);
  const styleObjArr = [];
  for (let i = 0; i < filesArr.length; i++) {
    styleObjArr.push({
      [filesArr[i].slice(0, filesArr[i].lastIndexOf("."))]: stylesArr[i]
    });
  }
  return styleObjArr;
}
async function appendFileContent(trgtFilePath, dataArr) {
  const fileContent = dataArr
    .map((elem) => Object.values(elem)[0])
    .join('\n');
  return fsProm.writeFile(trgtFilePath, fileContent);
}
/*-----Copy directory function---------START------*/
const copyFrom = path.resolve(__dirname, 'assets');
const copyTo = path.resolve(__dirname, 'project-dist', 'assets');

async function copyDir(sourceFolder, targetFolder) {
  return new Promise(function (resolve, reject) {
    let updFlag = [false, 0, 0];
    fsProm.readdir(sourceFolder, {
        withFileTypes: true
      })
      .then((fileListObj) => {
        updFlag[0] = true;
        let fileList = [];
        for (let file of fileListObj) {
          if (file.isDirectory() !== true) {
            fileList.push(file.name);
          } else {
            copyDir(path.resolve(sourceFolder, file.name), path.resolve(targetFolder, file.name));
          }
        }
        fsProm.mkdir(targetFolder, {
            recursive: true
          })
          .then(() => {
            fsProm.readdir(targetFolder)
              .then((oldTargetList) => {
                for (let i = 0; i < fileList.length; i++) {
                  updFlag[2] += 1;
                  fsProm.copyFile(path.resolve(sourceFolder, fileList[i]), path.resolve(targetFolder, fileList[i]))
                    .then(() => {
                      console.log(`copy/update file complete from assets to project-dist/assets: ${fileList[i]}`);
                      updFlag[2] -= 1;
                      if (updFlag[1] === 0 && updFlag[2] === 0) {
                        console.log('copy/update directory done\n');
                        resolve(true);
                      }
                    })
                    .catch((err) => {
                      reject(false);
                      throw err;
                    });
                }
              });
          })
          .catch(err => {
            reject(false);
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  });
}
/*-----Copy directory function---------END------*/

async function buildPage() {
  const del = new Promise(function (resolve, reject) {
    fs.rm(path.resolve(__dirname, 'project-dist', 'assets'), {
      recursive: true,
      force: true
    }, () => {
      resolve();
    });
  });
  await del;
  let tempHtml = await fs.promises.readFile(path.resolve(__dirname, 'template.html'), 'utf-8');
  let compHtmlArr = await getFileContentObjArray(path.resolve(__dirname, 'components'), 'html');
  compHtmlArr = compHtmlArr.map((elem) => Object.entries(elem).flat());
  for (const comp of compHtmlArr) {
    if (tempHtml.match(`{{${comp[0]}}}`)) {
      tempHtml = tempHtml.replace(`{{${comp[0]}}}`, `${comp[1]}`);
    }
  }
  await fsProm.mkdir(path.resolve(__dirname, 'project-dist'), {
    recursive: true
  });
  await fsProm.writeFile(path.resolve(__dirname, 'project-dist', 'index.html'), tempHtml);
  const styles = await getFileContentObjArray(path.resolve(__dirname, 'styles'), 'css');
  await appendFileContent(path.resolve(__dirname, 'project-dist', 'style.css'), styles);
  await copyDir(copyFrom, copyTo);
}
buildPage();