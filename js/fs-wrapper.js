window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024, function(grantedBytes) {
  window.requestFileSystem(PERSISTENT, grantedBytes, initFS, errorHandler);
}, function(e) {
  console.log('Error', e);
});

var globalFS;
function createDir(dir, folders) {
  // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
  if (folders[0] == '.' || folders[0] == '') {
    folders = folders.slice(1);
  }

  dir.getDirectory(folders[0], {create: true}, function(dirEntry) {
    // Recursively add the new subfolder (if we still have another to create).
    if (folders.length) {
      createDir(dirEntry, folders.slice(1));
    }
  }, errorHandler);
};

function getTags(obj) {

}


// Inner function to read from a file and return the result to the callback.
function readFromFile(file, callback) {
  globalFS.root.getFile(file, {}, function(fileEntry) {
    readFromFileEntry(fileEntry, function(result) {
      callback(result);
    });
  }, errorHandler);
}

// Return to callback whether the file exists.
function fileExists(file, callback) {
  globalFS.root.getFile(file, {}, function(fileEntry) {
    callback(true);
  }, 
    function(err) {
      if(err.code == FileError.NOT_FOUND_ERR) {
        callback(false);
      } else {
        errorHandler(err);
      }
  });
}

// Return to the callback the data of a file given
// a file entry.
function readFromFileEntry(fileEntry, callback) {
  fileEntry.file(function(file) {

      var reader = new FileReader();

      reader.onloadend = function(e) {
        callback(this.result);
      };

      reader.onerror = function(e) {
        errorHandler(e.target.error);
      }

      reader.readAsText(file);
    }, errorHandler);
}

// Recursive function to read all the data from file entries.
// and return the results to the callback.
function readFromFileEntries(fileEntries, results, callback) {
  if(!fileEntries.length) {
    callback(results);
  } else {
    readFromFileEntry(fileEntries[0], function(result) {
      var obj = JSON.parse(result);

      if(obj.tags.length > 0) {
        results.push(obj);
      }

      readFromFileEntries(fileEntries.slice(1), results, callback);
    });
  }

}

// Return tagged objects to the callback.
function getTaggedObjects(cb) {
  globalFS.root.getDirectory(tagFolder, {create: true}, function(dirEntry) {
    var fileEntries = [];
    var dirReader = dirEntry.createReader();
    
    var readEntries = function() {
      dirReader.readEntries(function(entries) {
        if(!entries.length) {
          readFromFileEntries(fileEntries, [], function(result) {
            cb(result);
          });
        } else {
          for(var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            fileEntries.push(entry);
          }
          readEntries();
        }
      });
    }

    readEntries();
  });
}

// Get all the tags that are assigned to objects.
// Returns a unique list of them.
function getTags(cb) {
  var tagSet = {};
  var tags = [];

  // Add static tags
  tagSet["try it"] = true;
  tagSet["tried"] = true;

  getTaggedObjects(function(results) {
    for(var i = 0; i < results.length; i++) {
      var obj = results[i];
      for(var j = 0; j < obj.tags.length; j++) {
        var tag = obj.tags[j];

        if(tag in tagSet) {
          //Nothing
        } else {
          tagSet[tag] = true;
        }
      }
    }

    for(key in tagSet) {
      tags.push(key);
    }

    cb(tags);
  });
}

// Get the tags for a given yelp id.
function getTagsForId(id, cb) {
  var file = tagFolder + id + ".txt";
  fileExists(file, function(exists) {
    if(exists) {
      readFromFile(file, function(result) {
        if(result) {
          var obj = JSON.parse(result);
          cb(obj.tags);
        }
      });
    } else {
      cb([]);
    }

  });
}

// Update the tags for an obj.
function updateTags(obj, cb) {
  var file = tagFolder + obj.yelp_obj.id + ".txt";
  writeToFile(JSON.stringify(obj), file, function(e) {
    if(cb) {
      if(!e.error) {
        cb(true);
      } else {
        cb(false);
        errorHandler(e.target.error);
      }
    }
  });
}

// Inner write to file function.
function writeToFile(data, file, callback) {
  globalFS.root.getFile(file, {create:true}, function(fileEntry) {
    fileEntry.createWriter(function(fileWriter) {
      fileWriter.onwriteend = function(e) {
        fileWriter.onwriteend = function(e) {
          callback(e.target)  
        }
        var blob = new Blob([data], {type: 'text/plain'});
        fileWriter.write(blob);
      }

      fileWriter.truncate(1);

    }, errorHandler);

  }, errorHandler);
}


var tagFolder = "tags/";

// Initiation our file system.
// just create our tags folder.
function initFS(fs){
  createDir(fs.root, tagFolder.split('/'));
  globalFS = fs;
}

function errorHandler(err){
  var msg = 'An error occured: ';
  switch (err.code) {
    case FileError.NOT_FOUND_ERR:
      msg += 'File or directory not found';
      break;
    case FileError.NOT_READABLE_ERR:
      msg += 'File or directory not readable';
      break;
    case FileError.PATH_EXISTS_ERR:
      msg += 'File or directory already exists';
      break;
    case FileError.TYPE_MISMATCH_ERR:
      msg += 'Invalid filetype';
      break;
    default:
      msg += 'Unknown Error:' + err;
      break;
  };
  console.log(msg);
};