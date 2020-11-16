const TARGET_DIRECTORY = './../booths';

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const esprima = require('esprima');
const esquery = require('esquery');
const argv = require('process').argv;

function argvIs(key) {
  let bool = false;

  argv.forEach(v => {
    if (v.replace(/^\-\-/, '') == key) {
      bool = true;
    }
  });

  return bool;
}

// Don't watch on deploy mode
const isDeploy = argvIs('deploy');

function exploreFiles(base, callback) {
  fs.readdir(base, (err, files) => {
    files.forEach(file => {
      let fileLocation = path.join(base, file);

      fs.lstat(fileLocation, (err, stat) => {
        if (fs.existsSync(fileLocation)) {
          if (stat.isDirectory()) {
            exploreFiles(fileLocation, callback);
          } else {
            callback({
              fileLocation: fileLocation,
              fileName: file
            }, stat);
          }
        }
      });
    });
  });
};

// Clean commented scripts e.g.
// `//#disabled alert(1)` so we will remove the `//#disabled ` part
// target is the replaceTexture video
function enableTarget(inputScript) {
  return inputScript.replace(/\/\/#disabled\s/g, '');
}

// Comment target scripts e.g.
// `alert(1)` will be `//#disabled alert(1)` part
// target is the replaceTexture video
function disableTarget(inputScript) {
  var output = inputScript.split(/\r?\n/);

  var isReplaceTextureVideo = function (str) {
    return str.indexOf('replaceTexture(') > -1 &&
      str.indexOf('loadVideo(') > -1;
  };

  var isReplaceTexturePoster = function (str) {
    return str.indexOf('replaceTexture(') > -1 &&
      str.indexOf('Poster') > -1;
  };

  output.forEach(function (v, i) {
    if (isReplaceTextureVideo(v) || isReplaceTexturePoster(v)) {
      output[i] = '//#disabled ' + v;
    }
  });

  return output.join('\n');
}

function injectScripts(location) {
  let input = enableTarget(fs.readFileSync(location, 'utf-8'));
  let result = esprima.parseScript(input, {
    range: true,
    loc: true
  });
  let searchPattern = esquery.parse('[callee.name=replaceTexture]');
  let resultOutput = esquery.match(result, searchPattern);
  let arrOfReplacedTextures = [];

  resultOutput.forEach((v) => arrOfReplacedTextures.push(getArgumentsValue(v)));

  let rInjected = /(\/\/\s*#INJECTED)([\s\S]+?)(\/\/\s*\#ENDINJECTED)/i;
  let injectedCode = `// #INJECTED
  // timestamp: ${(new Date()).getTime()}
  // location: ${location}
  if (window !== parent) {
    parent.verge = {
      replacedTextures: ${JSON.stringify(arrOfReplacedTextures)},
      replaceTexture: replaceTexture,
      loadVideo: loadVideo,
      volume: volume,
      playSound: playSound
    };
  }
  // #ENDINJECTED`;

  if (rInjected.test(input)) {
    // inject update existing
    fs.writeFileSync(location, disableTarget(input.replace(rInjected, injectedCode)));
  } else {
    // inject new
    let arrInput = input.split(/\r?\n/g);

    if (Array.isArray(resultOutput) && resultOutput.length > 0) {
      let lastItem = resultOutput[resultOutput.length - 1];
      let pos = lastItem.callee.loc.start.line;

      arrInput.splice(pos, 0, injectedCode);
      fs.writeFileSync(location, disableTarget(arrInput.join('\n')));
    } else {
      log('nothing injected.');
    }
  }
}

function getArgumentsValue(item) {
  let r = [];

  item.arguments.forEach((arg) => {
    switch (arg.type.toLowerCase()) {
      case 'literal':
        r.push(arg.value);
        break;
      case 'callexpression':
        r.push(getArgumentsValue(arg));
        break;
    }
  });

  return r.length == 1 ? r[0] : r;
}

function log(...args) {
  console.log.apply(null, [(new Date).toISOString()].concat(args));
}

function onExploring(fileInfo, stat) {
  let location = fileInfo.fileLocation;

  if (fileInfo.fileName == 'visual_logic.js') {
    log('[new][injecting]', location)
    injectScripts(location);

    if (!isDeploy) {
      watcher.add(location);
      log('[registered]', location);
    }
  }
}

let watcher;

if (!isDeploy) {
  let configWatcher = {
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 250
    }
  };
  let watcherDir = chokidar.watch(TARGET_DIRECTORY, Object.assign({ ignoreInitial: true }, configWatcher));
  watcher = chokidar.watch(__filename, configWatcher);

  watcher.unwatch(__filename);
  watcher.on('change', function (path, stats) {
    log('[changed]', path);
    watcher.unwatch(path);
    injectScripts(path);
    watcher.add(path);
  });
  watcherDir.on('addDir', function (path, stats) {
    exploreFiles(path, onExploring);
  });
}

// register target file(s) to the watcher on first run
exploreFiles(TARGET_DIRECTORY, onExploring);
