var __ = require('underscore');
var mu = require('mu2');
var fs = require('fs');
var os = require('os');
var dns = require('dns');
var crypto = require('crypto');
var child_process = require('child_process');

configureGrunt = function(grunt) {

  var defaultShellOptions = {
    stdout: true,
    stderr: true,
    failOnError: true
  };

  grunt.initConfig({

    connect: {
      server: {
        options: {
          port: 4000,
          base: './www'
        }
      }
    },

    shell: {
      'setup_production': {
        options: defaultShellOptions,
        command: [
          'echo "var EnvConfig = " | cat - config/production.json > ./www/res/js/env.js'
        ].join(' && ')
      },
      // build application
      'build_desktop': {
        options: defaultShellOptions,
        command: [
          'cp ./www/res/js/phonegap/desktop.js ./www/phonegap.js',
          'cp ./www/res/js/platform/desktop.js ./www/res/js/platform/compiled.js',
          'cp ./www/res/css/platform/desktop.css ./www/res/css/platform/compiled.css'
        ].join(' && ')
      },
      'build_ios': {
        options: defaultShellOptions,
        command: [
          'rm -rf ./platforms/ios/www',
          'cp -rf ./www ./platforms/ios/www',
          'cp ./www/res/js/phonegap/ios.js ./platforms/ios/www/phonegap.js',
          'cp ./www/res/js/platform/ios.js ./platforms/ios/www/res/js/platform/compiled.js',
          'cp ./www/res/css/platform/ios.css ./platforms/ios/www/res/css/platform/compiled.css',
          'rm -rf ./platforms/ios/www/js',
          'rm -rf ./platforms/ios/www/css',
          'rm -rf ./platforms/ios/www/img',
          'rm -rf ./platforms/ios/www/fonts',
          'rm -rf ./platforms/ios/www/app',
          'rm -rf ./platforms/ios/www/res/icon/*',
          'cp -rf ./www/res/icon/ios ./platforms/ios/www/res/icon/',
          'rm -rf ./platforms/ios/www/res/screen/*',
          'cp -rf ./www/res/screen/ios ./platforms/ios/www/res/screen/'
        ].join(' && ')
      },
      'build_android': {
        options: defaultShellOptions,
        command: [
          'rm -rf ./platforms/android/assets/www',
          'cp -rf ./www ./platforms/android/assets/www',
          'cp ./www/res/js/phonegap/android.js ./platforms/android/assets/www/phonegap.js',
          'cp ./www/res/js/platform/android.js ./platforms/android/assets/www/res/js/platform/compiled.js',
          'cp ./www/res/css/platform/android.css ./platforms/android/assets/www/res/css/platform/compiled.css',
          'rm -rf ./platforms/android/assets/www/js',
          'rm -rf ./platforms/android/assets/www/css',
          'rm -rf ./platforms/android/assets/www/img',
          'rm -rf ./platforms/android/assets/www/fonts',
          'rm -rf ./platforms/android/assets/www/app',
          'rm -rf ./platforms/android/assets/www/res/icon/*',
          'cp -rf ./www/res/icon/android ./platforms/android/assets/www/res/icon/',
          'rm -rf ./platforms/android/assets/www/res/screen/*',
          'cp -rf ./www/res/screen/android ./platforms/android/assets/www/res/screen/'
        ].join(' && ')
      },
      'run_android': {
        options: defaultShellOptions,
        command: [
          './platforms/android/cordova/run',
        ].join(' && ')
      },

      'deploy_production': {
        options: defaultShellOptions,
        command: [
          'aws --profile=assets.example.com s3 cp www s3://assets.example.com/ --recursive'
        ].join(' && ')
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('setup_development_env', function() {
    var str = "var EnvConfig = ";
    var hostname = os.hostname();
    dns.lookup(hostname, function (err, ipAddress, fam) {
      var stream = mu.compileAndRender('config/development.json.mustache', {hostname: hostname, ipAddress: ipAddress});
      stream.on('data', function(data) { str += data })
      stream.on('end', function() {
        fs.writeFile('www/res/js/env.js', str, function (err) {
        });
      })
    });
  });

  grunt.registerTask('gen_checksums', 'creates checksums for assets.json files as checksums.json',  function() {
    var algo = 'md5';

    function checksumForAssetFile(filePath) {
      var sum = crypto.createHash(algo);
      var fileContents = fs.readFileSync("www/"+filePath);
      return sum.update(fileContents).digest('hex');
    }
    var fileContents = fs.readFileSync("www/config/assets.json");
    var checksums = {};
    var assets = JSON.parse(fileContents);
    assets.js.forEach(function(item){ checksums[item.src] = checksumForAssetFile(item.src); });
    assets.css.forEach(function(item){ checksums[item.href] = checksumForAssetFile(item.href); });
    assets.files.forEach(function(item){ checksums[item.src] = checksumForAssetFile(item.src); });
    console.log(checksums);
    fs.writeFileSync('www/config/checksums.json',JSON.stringify(checksums));
  });

  grunt.registerTask('setup_development', 'setup development env (localhost using hostname)',
                     ['setup_development_env','shell:build_desktop']);
  grunt.registerTask('setup_production', 'setup production env', ['shell:setup_production']);

  grunt.registerTask('run_desktop', 'run desktop application',function() {
    var asyncDone = grunt.task.current.async();
    var child = child_process.fork('./scripts/web-server.js', function(error, stdout, stderr) {
      grunt.log.writeln('stdout: ' + stdout);
      grunt.log.writeln('stderr: ' + stderr);
    });
  });

  grunt.registerTask('start_development', 'start desktop development environment',['setup_development','run_desktop']);
  grunt.registerTask('s', '"', ['connect', 'start_development']);


  grunt.registerTask('build_ios', 'build iOS by copying to platform directory',['gen_checksums','shell:build_ios']);
  grunt.registerTask('build_android', 'build android by copying to platform directory',['gen_checksums','shell:build_android']);
  grunt.registerTask('run_android', 'build android by copying to platform directory',['build_android','shell:run_android']);

  grunt.registerTask('deploy_production', 'deploy to production on assets.example.com', ['setup_production', 'shell:build_desktop', 'shell:deploy_production']);

  grunt.registerTask('default', 'help get help', function() {
    grunt.log.writeln('\ngrunt -h\t\t# for list of tasks and help');
  });
};

module.exports = configureGrunt;
