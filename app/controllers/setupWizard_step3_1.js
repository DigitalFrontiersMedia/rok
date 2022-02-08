// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var wizardContinue = function() {
	Alloy.createController('UIChoice').getView().open();
};

var chooseDevice = function(e) {
	for (var i = 0; i < $.ListView_devices.data[0].rows.length; ++i) {
	    $.ListView_devices.data[0].rows[i].hasCheck = false;
	}
	$.ListView_devices.data[0].rows[e.index].hasCheck = true;
	Ti.App.Properties.setInt("deviceIndex", e.index);
	global.setDeviceConfig();
	wizardContinue();
	setTimeout(function() {
		$.nxtBtn.visible = true;
	}, 500);
};

var denoteInitial = function(val) {
	for (var i = 0; i < $.ListView_devices.data[0].rows.length; ++i) {
	    $.ListView_devices.data[0].rows[i].hasCheck = (i == val);
	}
};

if (Ti.App.Properties.getInt('deviceIndex') === null) {
	$.nxtBtn.visible = false;
} else {
	$.nxtBtn.visible = true;
}

Alloy.Globals.loading.show(L('syncing'));
global.getDeviceInfo(setup);

var setup = function() {
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
		if (!tableData.length) {
			deviceName = $.UI.create('Label', {
				text: L('no_items'),
				classes: ["choice", 'centered'],
				bottom: 0,
				top: 0
			});
			dataRow = $.UI.create('TableViewRow');
			dataRow.add(deviceName);
			tableData.push(dataRow);
		}
		$.ListView_devices.data = tableData;
		if (Ti.App.Properties.getInt('deviceIndex') != null && Ti.App.Properties.getInt('deviceIndex') != '') {
			denoteInitial(Ti.App.Properties.getInt('deviceIndex'));
		}
	}
	Alloy.Globals.loading.hide();
};
