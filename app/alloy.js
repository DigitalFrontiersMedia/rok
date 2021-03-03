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

global.jDrupal = require('jdrupal');
//global.Promise = require('bluebird.core');
/*
global.Promise.config({
    warnings: false
 });
*/
global.UTIL = require("utilities");
//var Waterwheel = require('waterwheel');
global.xp = require('xp.ui');

Alloy.Globals.rotate180 = Ti.UI.create2DMatrix().rotate(180);

global.gridHeightMultiplier = 1.5;
var home = Alloy.createController('home').getView();
global.homeWindow = home;
var setupWizard_step1Window = Alloy.createController('setupWizard_step1').getView();
global.setupWizardWindow = setupWizard_step1Window;

global.userId = null;
global.usingBasicAuth = false;
global.basicAuthUser = 'guest';
global.basicAuthPass = 'rokkor';
global.domain = 'www.rok.com';
global.scheme = 'https://';
global.siteInfo = new Array();
global.siteInfoPickerValues = new Array();

global.domainPrepend = global.usingBasicAuth ? global.basicAuthUser + ':' + global.basicAuthPass + '@' : '';
global.jDrupal.config('sitePath', global.scheme + global.domainPrepend + global.domain);

if (!Ti.Network.online) {
	alert("It appears that your network connection dropped or that you haven't yet connected.  Currently using cached assets until connection is re-established to re-sync documents & configurations.");
} else {
	/*
	global.jDrupal.connect().then(function() {
		// global.jDrupal.currentUser() is now ready...
		var account = global.jDrupal.currentUser();
		global.userId = account.id();
		//Ti.API.info('Initial User id: ' + global.userId);
		if (global.userId) {
			global.getSiteInfo();
			Ti.App.fireEvent('loggedIn');
		} else {
			Ti.API.info('*** No Active Session ***');
			Ti.API.info('email = ' + Ti.App.Properties.getString("email"));
		    if (Ti.App.Properties.getString("password") && Ti.App.Properties.getString("email")) {
		    	Ti.API.info('Attempting auto-login...');
				global.jDrupal.userLogin(Ti.App.Properties.getString("email"), Ti.App.Properties.getString("password")).then(function(e) {
					account = global.jDrupal.currentUser();
					global.userId = account.id();
					if (global.userId) {
						Ti.API.info('Auto-logged in!');
						//Ti.App.fireEvent('loggedIn');
					}
					global.getSiteInfo();
					Ti.App.fireEvent('loggedIn');
				});
			} else {
				// Optional default action if not logged in and can't do so.
			}	
		}
	});
	*/
}

global.Wifi = require('ti.wifimanager');
//var intent = Ti.Android.createIntent({
//    action: Wifi.ACTION_PICK_WIFI_NETWORK
//});
//intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
//Ti.Android.currentActivity.startActivity(intent);

/*
 * Get global.siteInfo List
 */
global.getSiteInfo = function() {
	global.jDrupal.viewsLoad('rest/views/site-info').then(function(view) {
		var results = view.getResults();
		//Ti.API.info('results = ' + JSON.stringify(results));
		var valuesObject = {};
		global.siteInfo[0] = {};
		global.siteInfo[0].id = 0;
		global.siteInfo[0].title = '- Any -';
		valuesObject[0] = global.siteInfo[0].title;
		//valuesObject[0].color = '#ffffff';
		for (var i = 0; i < results.length; i++) {
			//var entity = new global.jDrupal.Entity('taxonomy_term', 'global.siteInfo', results[i].tid);
			//Ti.API.info('entity = ' + JSON.stringify(entity));
			var url = results[i].url[0].value;
			var name = results[i].name[0].value;
			global.siteInfo[i + 1] = {};
			global.siteInfo[i + 1].url = url;
			global.siteInfo[i + 1].title = name;
			valuesObject[i + 1] = global.siteInfo[i + 1].title;
			//valuesObject[i + 1].color = '#ffffff';
		}
		global.siteInfoPickerValues[0] = valuesObject;
	});
};

