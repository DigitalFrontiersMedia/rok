// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;



var goWhiteboard = function() {
	Alloy.createController('whiteboard').getView().open();
};

var sendSMS = function() {
	var accountSid = "ACaab834c22e540ff5fc703ad65195b686";
	var authToken = "c7b5409b787dd9336939e446156e23e7";
	var fromNumber = "+18138561613";
	var toNumber = "+19417732036";
	var text = "ROK Page Superintendent Test SMS";
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onreadystatechange = function (e) {
	    if (xhr.readyState === 4) {
	        if (xhr.status === 201) {
	           Ti.API.info(xhr.responseText);
	        } else {
	           Ti.API.info("Error", JSON.stringify(xhr));
	        }
	    }
	};
	xhr.open("POST", "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json", true);
	// Add Basic Authentication Header (Android doesn't support user:pass@domain.tld format)
	var h = Titanium.Utils.base64encode(accountSid + ':' + authToken);
	xhr.setRequestHeader('Authorization', 'Basic ' + h);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send("From=" + encodeURIComponent(fromNumber) + "&To=" + encodeURIComponent(toNumber) + "&Body=" + encodeURIComponent(text));
};

var siteInfoMenu = function() {
	var siteInfoDialog = Ti.UI.createAlertDialog({
		message: 'Choose which you\'d like to see.',
		project: 'Project Rules',
		building: 'Building Rules',
		posters: 'Government Posters',
		safety: 'Safety Info',
		logistics: 'Site Logistics',
		title: 'Site Info'
	});
	siteInfoDialog.show();
};

var goDrawings = function() {
	Ti.API.info('*** DRAWINGS ***');
};

var goSubmittals = function() {
	Ti.API.info('*** SUBMITTALS ***');
};

$.home.addEventListener('androidback', function() {
	return;
});
