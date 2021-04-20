// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var createRFI = function() {
	Alloy.createController('rfi_entry').getView().open();	
};

var chooseRfi = function(e) {
	Ti.API.info('RFI index = ', JSON.stringify(e.index));
	Ti.API.info('RFI uid = ', JSON.stringify(e.section.rows[e.index].uid));
	//var uid = e.section.rows[e.index].uid;
	Alloy.createController('rfi_view', {index: e.index, uid: e.section.rows[e.index].uid}).getView().open();
};

var showRfis = function(results) {
	Ti.API.info('konstruction.getRfis results = ' + JSON.stringify(results));
	var x = 0;
	var dataRow;
	var tableData = [];
	var rfis = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (rfis) {
		global.setRfis(rfis);
		rfis.forEach(function(rfi) {
			if (rfi.title) {
				rfiName = $.UI.create('Label', {
					text: rfi.title,
					classes: ["choice"]
				});
				dataRow = Ti.UI.createTableViewRow({uid: rfi.uid});
				dataRow.add(rfiName);
				if (x % 2) {
					$.addClass(dataRow, 'zebra');
				}
				x++;
				tableData.push(dataRow);
			}
		});
	} else {
		emptyText = $.UI.create('Label', {
			text: "No items found.",
			classes: ["choice"]
		});
		dataRow = Ti.UI.createTableViewRow();
		dataRow.add(emptyText);
		tableData.push(dataRow);
	}
	$.ListView_rfis.data = tableData;
};

global.konstruction.getRfis(showRfis);
