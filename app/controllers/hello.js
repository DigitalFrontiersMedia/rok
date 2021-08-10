// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var windowName;

global.isHome = false;

var goHome = function() {
	global.homeWindow.open();
};

var wizardContinue = function() {
	Alloy.createController('setupWizard_step2').getView().open();
	//goHome();
	$.hello.close();
};

if (!Ti.Geolocation.hasLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS)) {
	var dialog = Ti.UI.createAlertDialog({
		okay: 0,
	    buttonNames: ['OK'],
		message: L('location_permission_required'),
		title: 'Permission'
	});
	dialog.addEventListener('click', function(e) {
		if (e.index === e.source.okay) {
			Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS, function(e) {
		        if (!e.success) {
		        	alert(L('wifi_permission_denied'));
		            Ti.API.info(' *** Location permission is required for WiFi access point scanning.***\nPlease enable Location Permissions in the Settings for this application.');
		        }
		    });
		}
	});
	dialog.show();
}