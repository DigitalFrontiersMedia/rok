/**
 * @author S.Barker
 */
module.exports = function(grunt) {
	var fs = require('fs');

        // Usage "grunt version:patch", "grunt version:major.minor"	
	grunt.registerTask('version', function (what) {
	
	    // map name to index and default to patch index
	    var index = ['major', 'minor', 'patch'].indexOf(what);
	
	    var tiapp = fs.readFileSync('tiapp.xml', {
	        encoding: 'utf-8'
	    });
	
	    if (index !== -1) {
	
	        tiapp = tiapp.replace(/()([^< ]+)(<\/version>)/, function (match, before, version, after) {
	            version = version.split('.');
	
	            // bump index and reset following
	            for (var i = index; i <= 2; i++) {
	                version[i] = (i === index) ? (parseInt(version[i], 10) + 1).toString() : '0';
	            }
	
	            version = version.join('.');
	
	            grunt.log.writeln('Bumped version to: ' + version);
	
	            return before + version + after;
	        });

	        tiapp = tiapp.replace(/(android:versionName=")([^"]+)(")/, function (match, before, version, after) {
	            version = version.split('.');
	
	            // bump index and reset following
	            for (var i = index; i <= 2; i++) {
	                version[i] = (i === index) ? (parseInt(version[i], 10) + 1).toString() : '0';
	            }
	
	            version = version.join('.');
	
	            grunt.log.writeln('Bumped android:versionName to: ' + version);
	
	            return before + version + after;
	        });
		}

	    tiapp = tiapp.replace(/(android:versionCode=")([^"]+)(")/, function (match, before, versionCode, after) {
	        versionCode = parseInt(versionCode, 10) + 1;
	
	        grunt.log.writeln('Bumped android:versionCode to: ' + versionCode);
	
	        return before + versionCode + after;
	    });
	
	    tiapp = tiapp.replace(/(CFBundleVersion< \/key>\s*)([^< ]+)(<\/string>)/mg, function (match, before, CFBundleVersion, after) {
	        CFBundleVersion = parseInt(CFBundleVersion, 10) + 1;
	
	        grunt.log.writeln('Bumped CFBundleVersion to: ' + CFBundleVersion);
	
	        return before + CFBundleVersion + after;
	    });
	
	    fs.writeFileSync('tiapp.xml', tiapp);
	});
};
