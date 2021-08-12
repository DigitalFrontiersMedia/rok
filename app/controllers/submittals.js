// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var chooseSubmittal = function(e) {
	Ti.API.info('submittal index = ', JSON.stringify(e.index));
	Ti.API.info('submittal uid = ', JSON.stringify(e.section.rows[e.index].uid));
	//var cachedSubmittals = Ti.App.Properties.getList("submittals", []);
	//Ti.API.info('submittal = ', JSON.stringify(cachedSubmittals[e.index]));
	//var uid = e.section.rows[e.index].uid;
	Alloy.createController('submittal', {index: e.index, uid: e.section.rows[e.index].uid}).getView().open();
};

var showSubmittals = function(results, preFetched) {
	Ti.API.info('showSubmittals results = ' + JSON.stringify(results));
	var x = 0;
	var dataRow = null;
	var tableData = [];
	var submittals;
	//var cachedSubmittals = Ti.App.Properties.getList("submittals", []);
	if (preFetched) {
		submittals = results;
	} else {
		submittals = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	}
	Ti.API.info('submittals = ' + JSON.stringify(submittals));
	if (submittals) {
		global.setSubmittals(submittals);
		submittals.forEach(function(submittal) {
			dataRow = $.UI.create('TableViewRow', {uid: submittal.uid});
			dataRow.add($.UI.create('Label', {
				text: submittal.spec_section ? submittal.custom_id : '',
				classes: ["submittalChoice", "fontSize20", "colS"]
			}));
			var specWrapper = $.UI.create('View', {
				classes: ["specWrapper", "colL"]
			});
			var spec1 = $.UI.create('Label', {
				text: submittal.spec_section ? submittal.spec_section : '',
				classes: ["submittalChoice", "fontSize20", "fillWidth"]
			});
			var spec2 = $.UI.create('Label', {
				text: submittal.spec_section_name ? submittal.spec_section_name : '',
				classes: ["submittalChoice", "fillWidth", "fontSize14"]
			});
			specWrapper.add(spec1);
			specWrapper.add(spec2);
			dataRow.add(specWrapper);
			dataRow.add($.UI.create('Label', {
				text: submittal.name ? submittal.name : '',
				classes: ["submittalChoice", "fontSize20", "colL"]
			}));
			var userInfo = global.historyUsers[submittal[submittal.ball_in_court_status + 's'][0].uid] ? global.historyUsers[submittal[submittal.ball_in_court_status + 's'][0].uid] : false;
			dataRow.add($.UI.create('Label', {
				text: (submittal[submittal.ball_in_court_status + 's'].length ==1 && userInfo) ? global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name) : submittal.ball_in_court_status.charAt(0).toUpperCase() + submittal.ball_in_court_status.slice(1) + 's',
				classes: ["submittalChoice", "fontSize20", "colL"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.created_at ? global.formatDate(submittal.updated_at) : '',
				classes: ["submittalChoice", "fontSize20", "colS"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.submittal_due_date ? global.formatDate(submittal.submittal_due_date) : '',
				classes: ["submittalChoice", "fontSize20", "colS"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.transmission_status ? submittal.transmission_status : '',
				classes: ["submittalChoice", "fontSize20", "colM"]
			}));
			if (x % 2) {
				$.addClass(dataRow, 'zebra');
			}
			x++;
			tableData.push(dataRow);
		});
	} else {
		dataRow = Ti.UI.createTableViewRow();
		dataRow.add($.UI.create('Label', {
			text: "No items found.",
			classes: ["choice"]
		}));
		tableData.push(dataRow);
	}
	$.TableView_submittals.data = tableData;
};

var preprocessSubmittals = function(results) {
	submittals = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('submittals = ' + JSON.stringify(submittals));
	if (submittals) {
		submittals.forEach(function(submittal) {
			var bicInfo = submittal[submittal.ball_in_court_status + 's'];
			if (bicInfo.length == 1) {
				if (!global.historyUsers.hasOwnProperty(bicInfo[0].uid)) {
					var myPromise = new Promise(function(resolve, reject) { 
						global.konstruction.getUserInfo(bicInfo[0], resolve);
					});
					myPromise.then(function(userInfo) {
						//Ti.API.info('userInfo = ' + JSON.stringify(userInfo));
						userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
						global.historyUsers[submittal[submittal.ball_in_court_status + 's'][0].uid] = userInfo;
						Ti.App.Properties.setObject('historyUsers', global.historyUsers);
					});
				}
			}
		});
	}
	showSubmittals(submittals, true);
};

var filterSubmittals = function(e) {
	var submittals = Ti.App.Properties.getList("submittals");
	switch(e.data[0].value) {
		case 'In review':
		case 'Revise & Resubmit':
		case 'Awaiting Submission':
		case 'Approved':
		case 'Reviewed only':
		case 'Approved as noted':
		case 'Published':
		case 'For information only':
		case 'Rejected':
			for (var i = 0; i < submittals.length; i++) {
				$.removeClass($.TableView_submittals.data[0].rows[i], 'hidden');
				if (submittals[i].transmission_status != e.data[0].value) {
					$.addClass($.TableView_submittals.data[0].rows[i], 'hidden');
				}
			}
			break;
			
		case 'None':
		default:
			for (var i = 0; i < submittals.length; i++) {
				$.removeClass($.TableView_submittals.data[0].rows[i], 'hidden');
			}			
			break;
	}
};

var showSubmittalFilters = function() {
	var opts = [
		{option_label: 'None'},
		{option_label: 'In review'},
		{option_label: 'Revise & Resubmit'},
		{option_label: 'Awaiting Submission'},
		{option_label: 'Approved'},
		{option_label: 'Reviewed only'},
		{option_label: 'Approved as noted'},
		{option_label: 'Published'},
		{option_label: 'For information only'},
		{option_label: 'Rejected'}
	];
	global.showOptions(L('filter_to_apply'), opts, $, filterSubmittals);
};

//global.konstruction.getSubmittalPackages(showSubmittals);
global.konstruction.getSubmittalPackages(preprocessSubmittals);

$.addClass($.optionCorner.lbl_optionCorner, 'filter');
$.optionCorner.lbl_optionCorner.addEventListener('click', showSubmittalFilters);
