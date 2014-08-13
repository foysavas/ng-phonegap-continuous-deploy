# Example Angular Phonegap for Continuous Deployment

Got an Angular Phonegap app? Using this a template you can:

* continuously deploying your app without requiring the user to do an app update
* provide users a quick load time by loading local files for unchanged assets

Use `window.assetUrl()` to load asset files in your application. If the latest version of the asset file checksum matches the local file checksum, the local file will be loaded.

## Platform Distributed Files

Note: changing these requires upgrading the app on platform app stores

* /index.html - The web page everything lives on, loads a series of scripts including /phonegap.js and several /res/js/*.js files that start the app. Note that the relative paths on the script src urls are necessary for certain platforms, so don't change them to absolute paths
* /phonegap.js - The phonegap script that must be placed here because of phonegap build quirks, built by Grunt depending on target environment
* /res/js - Essential or platform depedent scripts, including phonegap plugins and configuration variables that maybe be platform dependent
* /res/js/env.js - Defines EnvConfig, built by Grunt depending on target environment
* /res/js/init.js - Checks the web for updated app assets (styles, scripts, and files), loads the assets up, and then bootstraps the angular app
* /res/img - Images for platform distribution
* /res/icons - Icons for platform distribtions
* /res/screens - Loading screens for platform distribution

## Web Distributed Files

Note: changing these only requires modifying config/assets.json and redeploying to the web

Though these files do not need to be include in the platform builds, consider including them anyway as it will speed up load time.

* /config/assets.json - JSON file that defines all the app assets to be loaded
* /config/routes.js - Angular app routes
* /config/http.js - Angular http request defaults
* /config/app.js - Defines the angular js app as 'app'
* /app - AngularJS application files (as you please)
* /fonts - Fonts
* /img - Images
* /js - Other scripts
