// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var submittal = Ti.App.Properties.getList("submittals", []);
var rowIndex = 0;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var listHistoryEvents = function(results) {
	var cachedSubmittals = Ti.App.Properties.getList("submittals", []);
	var historyEventLabel;
	var username;
	var dataRow;
	//var tableData = [];
	var historyEvents = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('historyEvents = ' + JSON.stringify(historyEvents));
	cachedSubmittals[args.index].subPackage.history =  historyEvents;
	global.setSubmittals(cachedSubmittals);
	historyEvents.forEach(function(historyEvent) {
		if (historyEvent.event_data.uploader_name) {
			username = global.UTIL.cleanString(historyEvent.event_data.uploader_name);
		}
		if (historyEvent.event_data.creator_name) {
			username = global.UTIL.cleanString(historyEvent.event_data.creator_name);
		}
		if (historyEvent.event_type) {
			historyEventLine = historyEvent.event_type.split('_').join(' ');
		}
		historyEventLine = historyEventLine.charAt(0).toUpperCase() + historyEventLine.slice(1);
		historyEventLine += '. | ' + username + ', ' + global.formatDate(historyEvent.created_at) + '.';
		//Ti.API.info('historyEventLine = ' + historyEventLine);
		historyEventLabel = $.UI.create('Label', {text: historyEventLine, classes: ["listLabels"]});
		dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel']});
		dataRow.add(historyEventLabel);
		rowIndex++;
		if (rowIndex % 2) {
			$.addClass(dataRow, 'zebra');
		}
		//tableData.push(dataRow);
		$.ListView_history.appendRow(dataRow);
	});
};


$.Label_submittalNumValue.text = submittal[args.index].spec_section;
$.Label_specValue.text = submittal[args.index].spec_section_name;
$.Label_versionValue.text = submittal[args.index].subPackage.version;
$.Label_dueValue.text = submittal[args.index].submittal_due_date;
$.Label_statusValue.text = submittal[args.index].subPackage.transmission_status;
$.Label_submitterValue.text = submittal[args.index].submitters[0] ? submittal[args.index].submitters[0].uid : '';
$.Label_managerValue.text = submittal[args.index].managers[0] ? submittal[args.index].managers[0].uid : '';
$.Label_reviewerValue.text = submittal[args.index].reviewers[0] ? submittal[args.index].reviewers[0].uid : '';
$.Label_watchingValue.text = submittal[args.index].watchers[0] ? submittal[args.index].watchers[0].uid : '';

global.konstruction.getSubmittalPackageHistory(submittal[args.index].subPackage.uid, listHistoryEvents);