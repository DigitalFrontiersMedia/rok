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
// TODO:  Setup REST API endpoint for siteInfo links
// TODO:  Populate and handle siteInfoPickerValues choices

if (!Ti.Locale.currentLanguage) {
	Ti.Locale.setLanguage('en');
}
// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
// configured = false -> setup
// configured = true -> bypass setup
Ti.App.Properties.setBool('configured', false);

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
global.deviceInfo = Ti.App.Properties.getObject('deviceInfo') ? Ti.App.Properties.getObject('deviceInfo') : new Array();
global.siteInfoPickerValues = new Array();

global.domainPrepend = global.usingBasicAuth ? global.basicAuthUser + ':' + global.basicAuthPass + '@' : '';
global.jDrupal.config('sitePath', global.scheme + global.domainPrepend + global.domain);

global.xhr.setStaticOptions({
		
});

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
/*
				global.jDrupal.userLogin(Ti.App.Properties.getString("email"), Ti.App.Properties.getString("password")).then(function(e) {
					account = global.jDrupal.currentUser();
					global.userId = account ? account.id() : null;
					if (global.userId) {
						Ti.API.info('Auto-logged in!');
						//Ti.App.fireEvent('loggedIn');
					}
					global.getDeviceInfo();
					Ti.App.fireEvent('loggedIn');
				});
*/
			} else {
				// Optional default action if not logged in and can't do so.
			}	
		}
	});
}

global.Wifi = require('ti.wifimanager');

/*
 * Get global.getDeviceInfo List
 */
global.getDeviceInfo = function() {
	global.jDrupal.viewsLoad('rest/views/my-devices').then(function(view) {
		var results = view.getResults();
		Ti.API.info('results = ' + JSON.stringify(results));
		global.deviceInfo = results;
		Ti.App.Properties.setObject('deviceInfo', results);
		if (results.length == 1) {
			Ti.App.Properties.setInt("deviceIndex", 0);
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
