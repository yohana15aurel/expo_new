const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const port = 2000;
const baseFolder = path.join(__dirname, '../');
const config = require('./config');
const delimiter = config.options.ejs.delimiter;
ejs.delimiter = delimiter;

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

function viewFile(fileName, response) {
  let fileRequest;
  let baseDirectory = baseFolder + '/';

  if (fileName == "favicon.ico") {
    fileRequest = path.join(baseDirectory + fileName);
  } else {
    fileRequest = path.join(baseDirectory + fileName + ".html");
  }

  fs.exists(fileRequest, function (exists) {
    if (exists) {
      let config = requireUncached('./config');
      let data = config.data;
      let options = config.options;

      ejs.renderFile(fileRequest, data, options, function (err, str) {
        response.send(str);
      });
    } else {
      response.send("The requested file does not exist.");
    }
  });
}

console.log(baseFolder);

// Expose folders
app.use('/assets', express.static(baseFolder + '/assets'));
app.use('/xpo', express.static(baseFolder + '/xpo'));

// Main routes
app.get('/', (req, res) => viewFile('index', res));
app.get('/:fileName', (req, res) => viewFile(req.params.fileName, res));

// Initialize
http.listen(port, () => console.log(`Server is listening on port ${port}!`));
