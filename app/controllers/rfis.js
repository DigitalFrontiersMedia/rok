// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var showRfis = function(results) {
	Ti.API.info('konstruction.getRfis results = ' + JSON.stringify(results));
	var dataRow;
	var tableData = [];
	var rfis = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (rfis) {
		rfis.forEach(function(rfi) {
			if (rfi.question) {
				rfiQuestion = $.UI.create('Label', {
					text: rfi.question,
					classes: ["choice"]
				});
				dataRow = Ti.UI.createTableViewRow();
				dataRow.add(rfiQuestion);
				tableData.push(dataRow);
			}
		});
		if (tableData.length) {
			$.ListView_rfis.data = tableData;
		}
	}
};

global.konstruction.getRfis(showRfis);
