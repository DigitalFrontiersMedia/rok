

var goSetup = function() {
	var helloWindow = Alloy.createController('hello').getView();
	helloWindow.open();
};

var goHome = function() {
	global.homeWindow.open();
};

Ti.App.Properties.setBool('configured', true);
Ti.API.info('Configured == ' + JSON.stringify(Ti.App.Properties.getBool('configured')));
if (Ti.App.Properties.getBool('configured')) {
	goHome();
} else {
	$.index.open();
}


/*
Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
function getLocation() {
	Ti.Geolocation.addEventListener('location', function(e) {
		Ti.API.info(JSON.stringify(e));
	});
}
if (Ti.Geolocation.hasLocationPermissions()) {
	getLocation();
} else {
	Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS, function(e) {
		if (e.success) {
			getLocation();
		} else {
			Ti.API.info('could not obtain location permissions');
		}
	});
}*/