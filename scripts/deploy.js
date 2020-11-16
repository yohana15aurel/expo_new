
const fs = require('fs');
const ejs = require('ejs');
const config = require('./config');
const Path = require('path');
const sourceFolder = __dirname + "/../mockup";
const baseFolder = __dirname + "/../mockup-deploy";
const delimiter = config.options.ejs.delimiter;
ejs.delimiter = delimiter;
const deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = Path.join(path, file);

      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

console.log("Deploying...");

// if (fs.existsSync(baseFolder)) {
//   console.log("Deleting mockup-deploy folder...");
//   deleteFolderRecursive(baseFolder);
// }

// console.log("Create new mockup-deploy folder...");
// fs.mkdirSync(baseFolder);

// if (fs.existsSync(sourceFolder)) {
//   fs.readdirSync(sourceFolder).forEach((file, index) => {
//     let fileSrc = Path.join(sourceFolder, file);
//     let data = config.data;
//     let options = config.options;
//     let targetSrc = Path.join(baseFolder, file);

//     if (fs.lstatSync(fileSrc).isFile() && /\.html$/.test(fileSrc)) {
//       ejs.renderFile(fileSrc, data, options, function (err, str) {
//         console.log('[Injecting] ' + file);
//         fs.writeFileSync(targetSrc, str);
//       });
//     }
//   });
// }

console.log("Done...");
