const path = require('path');
const fs = require('fs');
const fsProm = require('fs/promises');

async function getFileContentObjArray(folder,ext) {
  const filesArr = await getFilesArr(folder,ext).then(res => res);
  console.log('File list to bundle:',filesArr);
  const stylesArrProm = Promise.all(filesArr.map((elem) => {
    return fsProm.readFile(path.resolve(folder,elem),'utf-8');
  }));
  const stylesArr=await stylesArrProm.then(res=>res);
  const styleObjArr=[];
  for (let i=0;i<filesArr.length;i++) {
    styleObjArr.push({[filesArr[i].slice(0,filesArr[i].lastIndexOf("."))]:stylesArr[i]});
  }
  return styleObjArr;
}
async function getFilesArr(folder, ext) {
  const fileList = await fsProm.readdir(folder, {
    withFileTypes: true
  }).then(res => res);
  const fileArr = fileList.filter((file) => {
    return (file.isDirectory() === false) && (path.extname(path.resolve(folder, file.name)) === `.${ext}`);
  }).map((e) => e.name);
  return fileArr;
}

async function appendFileContent(trgtFilePath,dataArr) {
  const fileContent=dataArr
  .map((elem)=>Object.values(elem)[0])
  .join('\n');
  console.log('\nNew bundle.css file:\n-------------------\n',fileContent);
  return fsProm.writeFile(trgtFilePath,fileContent);
}

async function bundleCssFiles () {
  const fileArr=await getFileContentObjArray(path.resolve(__dirname, 'styles'),'css');
  await appendFileContent(path.resolve(__dirname, 'project-dist','bundle.css'),fileArr);
}
bundleCssFiles ().then(_res=>console.log('____________________\n','Bundle files done'));
