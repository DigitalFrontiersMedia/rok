// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

global.isHome = false;

var wizardContinue = function() {
	Alloy.createController('setupWizard_step3_2').getView().open();
};

var chooseDevice = function(e) {
	Ti.App.Properties.setInt("deviceIndex", e.index);
	global.setDeviceConfig();
	wizardContinue();
	setTimeout(function() {
		$.nxtBtn.visible = true;
	}, 500);
};

if (Ti.App.Properties.getInt('deviceIndex') === null) {
	$.nxtBtn.visible = false;
} else {
	$.nxtBtn.visible = true;
}

var dataRow;
var tableData = [];
var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
if (deviceInfo) {
	deviceInfo.forEach(function(device) {
		if (device.title) {
			deviceName = $.UI.create('Label', {
				text: device.title,
				classes: ["choice"]
			});
			dataRow = $.UI.create('TableViewRow');
			dataRow.add(deviceName);
			tableData.push(dataRow);
		}
	});
	if (tableData.length) {
		$.ListView_devices.data = tableData;
	}
}
