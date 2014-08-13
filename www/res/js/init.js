(function(){
  window.localAssetChecksums = {};
  window.remoteAssetChecksums = {};

  window.envBasedAssetUrl = function(url) {
    if (false && EnvConfig.platform == 'browser') {
      return url;
    } else {
      return "http://"+EnvConfig.asset_domain+'/'+url;
    }
  }

  window.assetUrl = function(url){
    if ((window.localAssetChecksums[url] === undefined) || (window.remoteAssetChecksums[url] != window.localAssetChecksums[url])) {
      return envBasedAssetUrl(url);
    } else {
      return url;
    }
  }

  var assetManifestPath = "config/assets.json";
  var remoteAssetManifestUrl = "http://"+EnvConfig.asset_domain + assetManifestPath;
  var assetChecksumsPath = "config/checksums.json";
  var remoteAssetChecksumsUrl = "http://"+EnvConfig.asset_domain + assetChecksumsPath;

  var loadAssetManifest = function(cb){
    var req = new XMLHttpRequest();
    req.open('GET', envBasedAssetUrl(assetManifestPath));
    req.onreadystatechange = function() {
      if(req.readyState == 4){
        cb(JSON.parse(req.responseText));
      }
    };
    req.send();
  };

  var loadLocalAssetChecksums = function(cb) {
    var req = new XMLHttpRequest();
    req.open('GET', assetChecksumsPath);
    req.onreadystatechange = function() {
      if(req.readyState == 4){
        cb(JSON.parse(req.responseText));
      }
    };
    req.send();
  };

  var loadRemoteAssetChecksums = function(cb) {
    var req = new XMLHttpRequest();
    req.open('GET', envBasedAssetUrl(assetChecksumsPath));
    req.onreadystatechange = function() {
      if(req.readyState == 4){
        cb(JSON.parse(req.responseText));
      }
    };
    req.send();
  };

  var includeAssets = function(manifest) {
    for (var i in manifest.css) {
      var cssFile = manifest.css[i];
      var fileref = document.createElement("link")
      fileref.setAttribute("rel", "stylesheet")
      fileref.setAttribute("type", "text/css")
      fileref.setAttribute("href", assetUrl(cssFile['href']))
      if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
    var manifestJsSrc = [];
    for (var i in manifest.js) {
      var jsFile = manifest.js[i];
      manifestJsSrc.push(assetUrl(jsFile['src']));
    }
    head.load.apply(head.load, manifestJsSrc.concat(function(){
      document.getElementsByTagName("body")[0].setAttribute("class","initialized");
      window.resetLoadingCancel();
      angular.bootstrap(document.getElementsByTagName('html')[0],['app']);
    }));
  };

  loadAssetManifest(function(assetManifest){
    loadRemoteAssetChecksums(function(rac){
      window.remoteAssetChecksums = rac;
      loadLocalAssetChecksums(function(lac){
        window.localAssetChecksums = lac;
        includeAssets(assetManifest);
      });
    });
  });
})();
