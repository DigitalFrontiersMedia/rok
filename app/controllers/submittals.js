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
				text: submittal.spec_section ? submittal.spec_section : '',
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
			dataRow.add($.UI.create('Label', {
				text: submittal.subPackage.ball_in_court_status ? submittal.subPackage.ball_in_court_status : '',
				classes: ["submittalChoice", "fontSize20", "colL"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.created_at ? global.formatDate(submittal.created_at) : '',
				classes: ["submittalChoice", "fontSize20", "colS"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.submittal_due_date ? global.formatDate(submittal.submittal_due_date) : '',
				classes: ["submittalChoice", "fontSize20", "colS"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.subPackage.transmission_status ? submittal.subPackage.transmission_status : '',
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

var processSubmittalPackages = function(results) {
	var cachedSubmittals = Ti.App.Properties.getList("submittals", []);
	Ti.API.info('konstruction.getSubmittalPackages results = ' + JSON.stringify(results));
	var subPackages = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('subPackages = ' + JSON.stringify(subPackages));
	if (subPackages) {
		subPackages.forEach(function(subPackage) {
			cachedSubmittals.forEach(function(cachedSubmittal) {
				// Merge with saved drawings before re-saving.
				if (subPackage.items.uids.indexOf(cachedSubmittal.uid) > -1) {
					cachedSubmittal.subPackage = subPackage;
/*
					var myPromise = new Promise(function(resolve, reject) { 
						global.konstruction.getSubmittalPackageHistory(subPackage.uid, resolve, null, null);
					});
					myPromise.then(function(subPackageHistory) {
						Ti.API.info('subPackageHistory = ' + JSON.stringify(subPackageHistory));
						subPackageHistory = subPackageHistory.status == 200 ? JSON.parse(subPackageHistory.data) : JSON.parse(subPackageHistory.data.text).data;
						cachedSubmittal.subPackage.history =  subPackageHistory;
						global.setSubmittals(cachedSubmittals);
					});
					*/
				}
			});
		});
		global.setSubmittals(cachedSubmittals);
	}
	showSubmittals(cachedSubmittals, true);
};

var preprocessSubmittals = function(results) {
	var cachedSubmittals = Ti.App.Properties.getList("submittals", []);
	Ti.API.info('konstruction.getSubmittals results = ' + JSON.stringify(results));
	var submittals = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('submittals = ' + JSON.stringify(submittals));
	if (submittals) {
		global.setSubmittals(submittals);
		global.konstruction.getSubmittalPackages(processSubmittalPackages);
	}
};

var filterSubmittals = function(e) {
	var submittals = Ti.App.Properties.getList("submittals");
	switch(e.data[0].value) {
		case 'Locked':
		case 'Unlocked':
			for (var i = 0; i < submittals.length; i++) {
				$.removeClass($.TableView_submittals.data[0].rows[i], 'hidden');
				if (submittals[i].locked != e.data[0].value.toLowerCase()) {
					$.addClass($.TableView_submittals.data[0].rows[i], 'hidden');
				}
			}
			break;
			
		case 'Draft':
		case 'Open':
		case 'Closed':
		case 'Void':
			for (var i = 0; i < submittals.length; i++) {
				$.removeClass($.TableView_submittals.data[0].rows[i], 'hidden');
				if (submittals[i].status.label != e.data[0].value.toLowerCase()) {
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
		{option_label: 'Locked'},
		{option_label: 'Unlocked'},
		{option_label: 'Draft'},
		{option_label: 'Open'},
		{option_label: 'Closed'},
		{option_label: 'Void'}
	];
	global.showOptions(L('filter_to_apply'), opts, $, filterSubmittals);
};

//global.konstruction.getSubmittals(showSubmittals);
global.konstruction.getSubmittals(preprocessSubmittals);

$.addClass($.optionCorner.lbl_optionCorner, 'filter');
$.optionCorner.lbl_optionCorner.addEventListener('click', showSubmittalFilters);
