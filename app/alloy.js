// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};
//

if (!Ti.Locale.currentLanguage) {
	Ti.Locale.setLanguage('en');
}
// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
// configured = false -> setup
// configured = true -> bypass setup
//Ti.App.Properties.setBool('configured', false);

// For development purposes to bypass or induce language setup.
// Uncomment and set as desired.
// language = 'English' -> skip button
// language = '' -> no skip button
//Ti.App.Properties.setString('language', '');

// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
// global.userId = 0 -> setup
// global.userId = 1 -> bypass setup
//global.userId = 1;

// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
//Ti.App.Properties.setString("email", 'stephen@digitalfrontiersmedia.com');
//Ti.App.Properties.setString("password", 'DL9Xptgo.irdt');

// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
Ti.App.Properties.setInt("deviceIndex", 0);

global.jDrupal = require('jdrupal');
//global.Promise = require('bluebird.core');
/*
global.Promise.config({
    warnings: false
 });
*/
global.UTIL = require("utilities");
global.xp = require('xp.ui');
global.xhr = new(require("ti.xhr"))();
global.konstruction = new(require("konstruction"))();

Alloy.Globals.rotate180 = Ti.UI.create2DMatrix().rotate(180);
Alloy.Globals.rotate45 = Ti.UI.create2DMatrix().rotate(45);
Alloy.Globals.rotateM45 = Ti.UI.create2DMatrix().rotate(-45);

Alloy.Globals.loading = Alloy.createWidget("nl.fokkezb.loading");

global.gridHeightMultiplier = 1.5;
var home = Alloy.createController('home').getView();
global.homeWindow = home;
var setupWizard_step1Window = Alloy.createController('setupWizard_step1').getView();
global.setupWizardWindow = setupWizard_step1Window;

global.userId = null;
global.usingBasicAuth = true;
global.basicAuthUser = 'guest';
global.basicAuthPass = 'dfmrokkormfd';
global.basicAuthHeader = Titanium.Utils.base64encode(global.basicAuthUser + ':' + global.basicAuthPass);
global.domain = 'dev-dfm-rok.pantheonsite.io';
global.scheme = 'https://';
global.siteInfoPickerValues = new Array();

global.domainPrepend = global.usingBasicAuth ? global.basicAuthUser + ':' + global.basicAuthPass + '@' : '';
global.jDrupal.config('sitePath', global.scheme + global.domainPrepend + global.domain);

global.xhrOptions = {
	ttl : 60,
	debug : true	
};
global.xhr.setStaticOptions(global.xhrOptions);

global.setXHROauthParams = function() {
    // Add received tokens to xhr config for subsequent requests.
    global.xhrOptions.shouldAuthenticate = true;
    global.xhrOptions.oAuthToken = Ti.App.Properties.getString('azure-ad-access-token');
	global.xhr.setStaticOptions(global.xhrOptions);
};

global.onXHRError = function (xhrResults) {
    if (xhrResults.status === 401) {
        Ti.App.fireEvent('app:unauthorizedRequest');
    } else {
		Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
		alert('An error occurred: \n', JSON.stringify(xhrResults));
	}
};

global.Wifi = require('ti.wifimanager');
global.oauth = Alloy.createWidget('ti.oauth2');

global.oauth.customServer = true;  
global.oauth.responseType = "code";  
global.oauth.grantType = "authorization_code";  
global.oauth.saveTokensToTiProperties = true;    //saves to Ti.App.Properties.getString  ('azure-ad-access-token');

global.onOauthSuccess = function (authResults) {
    var secondsToSetExpiration = parseInt(authResults.expires_in) - 86400;  //subtract 10 minutes
    var expDate = Date.now() + (secondsToSetExpiration * 1000);          //find that timestamp
    Ti.App.Properties.setInt('azure-ad-access-token-exp', expDate);      //set the time stamp for future reference
    global.oauth.close();
};

global.onOauthError = function (authResults) {
	Ti.API.info('ERROR: ', JSON.stringify(authResults));
	global.oauth.close();
	alert('An error occurred: \n', JSON.stringify(authResults));
};

global.onOauthCancel = function (authResults) {
	global.oauth.close();
};

global.closeAllWindows = function() {
	for (i = 4; i > 0; i--) {
		windowName = 'setupWizard_step' + i;
		Ti.API.info('*** Closing:  ' + windowName + ' ***');
		Alloy.createController(windowName).getView().close();
	}
};

Ti.App.addEventListener('resumed', function(e) {	Ti.API.info("APP RESUMED");
	var tokenExp = Ti.App.Properties.getInt('azure-ad-access-token-exp');
	var currentExp = Date.now();
	if (currentExp > tokenExp) {
		// TODO:  update to slightly different callbacks for refresh purposes?
		//global.oauth.authorize(false, global.onOauthSuccess, global.onOauthError, true, global.onOauthCancel);
		global.oauth.refresh();
	} //else no refresh needed, more than 10 minutes before expiring
});

Ti.App.addEventListener('app:unauthorizedRequest', function(e) {
	global.oauth.refresh();
});

if (Ti.App.Properties.getString('azure-ad-access-token')) {
	global.setXHROauthParams();
}
if (!Ti.Network.online) {
	alert("It appears that your network connection dropped or that you haven't yet connected.  Currently using cached assets until connection is re-established to re-sync documents & configurations.");
} else {
	Ti.API.info('Attempting to connect...');
	global.jDrupal.connect().then(function() {
		// global.jDrupal.currentUser() is now ready...
		var account = global.jDrupal.currentUser();
		global.userId = account ? account.id() : null;
		Ti.API.info('Initial User id: ' + global.userId);
		if (global.userId) {
			global.getDeviceInfo();
			Ti.App.fireEvent('loggedIn');
		} else {
			Ti.API.info('*** No Active Session ***');
			Ti.API.info('email = ' + Ti.App.Properties.getString("email"));
		    if (Ti.App.Properties.getString("password") && Ti.App.Properties.getString("email")) {
		    	Ti.API.info('Attempting auto-login...');
	    		Alloy.Globals.loading.show('Attempting auto-login...');
				global.jDrupal.userLogin(Ti.App.Properties.getString("email"), Ti.App.Properties.getString("password")).then(function(e) {
					account = global.jDrupal.currentUser();
					global.userId = account ? account.id() : null;
					if (global.userId) {
						Ti.API.info('Auto-logged in!');
						//Ti.App.fireEvent('loggedIn');
					}
					Alloy.Globals.loading.hide();
					global.getDeviceInfo();
					Ti.App.fireEvent('loggedIn');
				});
			} else {
				// Optional default action if not logged in and can't do so.
			}	
		}
	});
}

global.setProjects = function(projects) {
	switch(Ti.App.Properties.getString("constructionApp")) {
		case 'PlanGrid':
		default:
			Ti.App.Properties.setObject("projects", projects);
			break;
	}
};

global.setRfis = function(rfis) {
	switch(Ti.App.Properties.getString("constructionApp")) {
		case 'PlanGrid':
		default:
			Ti.App.Properties.setObject("rfis", rfis);
			break;
	}
};

global.setOauthParams = function(platform) {
	switch(platform) {
		case 'PlanGrid':
			global.oauth.customAuthUrl = "https://io.plangrid.com/oauth/authorize";  
			global.oauth.customTokenUrl = "https://io.plangrid.com/oauth/token";  
			global.oauth.clientId = "7fc99cd6-c209-40f4-b112-588bc624492f";  
			global.oauth.state = "ROK-standard";  
			global.oauth.clientSecret = "68fdd6ff-9bd0-4d3d-b1d9-78851eee384b";  
			global.oauth.scope = "write:projects";  
			global.oauth.redirectUrl = "https://dev-dfm-rok.pantheonsite.io/";  
			global.oauth.customTitleText = "PlanGrid Authorization"; 
		default:
			break;
	}
};

global.setDeviceConfig = function() {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	if (deviceInfo.length == 1) {
		Ti.App.Properties.setInt("deviceIndex", 0);
	}
	if (Ti.App.Properties.getInt("deviceIndex") !== null) {
		Ti.App.Properties.setString('deviceName', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].title);
		// TODO: add below commented fields to Drupal and then correct and uncomment.
		//Ti.App.Properties.setString('constructionApp', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].construction_app);
		//Ti.App.Properties.setString('project', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].project);
		Ti.App.Properties.setString('superName', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_name);
		Ti.App.Properties.setString('superPhone', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_mobile_numb);
		Ti.App.Properties.setString('admin_secret', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_admin_secret);
	}
	if (Ti.App.Properties.getString('constructionApp')) {
		global.konstruction.setPlatform(Ti.App.Properties.getString('constructionApp'));
		Ti.API.info('konstruction.platform = ', global.konstruction.platform);
		global.setOauthParams(global.konstruction.platform);
	}
};

/*
 * Get global.getDeviceInfo List
 */
global.getDeviceInfo = function(callback) {
	global.jDrupal.viewsLoad('rest/views/my-devices').then(function(view) {
		var results = view.getResults();
		Ti.API.info('results = ' + JSON.stringify(results));
		Ti.App.Properties.setObject('deviceInfo', results);
		global.setDeviceConfig();
		if (callback) {
			callback();
		}
	});
};

global.showOptions = function(prompt, opts, context, callback) {
	var options = {};
	for (var i = 0; i < opts.length; i++) {
		options[i] = global.UTIL.cleanString(opts[i].option_label);
	}
	Alloy.createWidget('danielhanold.pickerWidget', {
		id : 'picker',
		outerView : context,
		hideNavBar : false,
		type : 'single-column',
		selectedValues : [0],
		pickerValues : [options],
		onDone : function(e) {
			// Do something
			Ti.API.info(JSON.stringify(e));
			if (!e.cancel && e.data[0].key && callback) {
				callback(e);
			}
		},
		title: global.UTIL.cleanString(prompt)
	});
};


global.copyFileToAppData = function(name) {
	var oldfile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, name);
	Ti.API.info('#### oldfile path: ' + oldfile.nativePath);
	var newfile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, name);
	newfile.write(oldfile.read()); // both old.txt and new.txt exist now
	Ti.API.info('#### newfile path: ' + newfile.nativePath + '\n\n');
	return newfile;
};

global.recursiveResourcesCopy = function(name) {
	var node;
	var nodeHandle;
    var secDir = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, name);
    var secDirArr = secDir.getDirectoryListing();
	Ti.API.info(name + ' Dir = ' + JSON.stringify(secDirArr));
    if (secDirArr != null) {
	    for (i = 0; i < secDirArr.length; i++) {
	    	node = secDirArr[i].toString();
	        Ti.API.info('Processing.....' + name + Titanium.Filesystem.separator + node);
	        nodeHandle = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, name + Titanium.Filesystem.separator + node);
	        if (nodeHandle.isDirectory()) {
	        	global.recursiveResourcesCopy(name + Titanium.Filesystem.separator + node);
	        } else {
	        	global.copyFileToAppData(name + Titanium.Filesystem.separator + node);
	        }
    	}	
    }
    return;
};
