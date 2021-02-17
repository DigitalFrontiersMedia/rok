// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;



var goWhiteboard = function() {
	var whiteboardWindow = Alloy.createController('whiteboard').getView();
	whiteboardWindow.open();	
};

var sendSMS = function() {
	// TODO:  Change to LIVE Twilio Creds.
	var accountSid = "AC2bbfa4d5a99d3ebdbe9baf356a89eec3";
	var authToken = "e0913d84503ea6c8ce0445879280d6f3";
	var fromNumber = "<<fromNumber>>";
	var toNumber = "+19417732036";
	var text = "ROK Page Superintendent Test SMS";
	
	var xhr = Titanium.Network.createHTTPClient();
	//xhr.onerror = function(e){alert('Transmission error: ' + e.error);};
	xhr.onreadystatechange = function (e) {
	    if (xhr.readyState === 4) {
	        if (xhr.status === 200) {
	           Ti.API.info(xhr.responseText);
	        } else {
	           Ti.API.info("Error", xhr.statusText);
	        }
	    }
	};
	
	xhr.open("POST", "https://" + accountSid + ":" + authToken + "@api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages", true);
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
	
	//var whiteboardWindow = Alloy.createController('whiteboard').getView();
	//whiteboardWindow.open();	
};
