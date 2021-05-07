// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

$.Label_subTitle.text = Ti.App.Properties.getString("project");

var chooseSubmittal = function(e) {
	Ti.API.info('RFI index = ', JSON.stringify(e.index));
	Ti.API.info('RFI uid = ', JSON.stringify(e.section.rows[e.index].uid));
	//var uid = e.section.rows[e.index].uid;
	Alloy.createController('submittal', {index: e.index, uid: e.section.rows[e.index].uid}).getView().open();
};

var showSubmittals = function(results) {
	Ti.API.info('konstruction.getSubmittals results = ' + JSON.stringify(results));
	var x = 0;
	var dataRow = null;
	var tableData = [];
	var submittals = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('submittals = ' + JSON.stringify(submittals));
	if (submittals) {
		global.setSubmittals(submittals);
		submittals.forEach(function(submittal) {
			dataRow = $.UI.create('TableViewRow', {uid: submittal.uid});
			dataRow.add($.UI.create('Label', {
				text: submittal.spec_section ? submittal.spec_section : '',
				classes: ["submittalChoice", "colS"]
			}));
			var specWrapper = $.UI.create('View', {
				classes: ["submittalChoice", "specWrapper", "colL"]
			});
			var spec1 = $.UI.create('Label', {
				text: submittal.spec_section ? submittal.spec_section : '',
				classes: ["submittalChoice", "colL"]
			});
			var spec2 = $.UI.create('Label', {
				text: submittal.spec_section_name ? submittal.spec_section_name : '',
				classes: ["submittalChoice", "colL"]
			});
			specWrapper.add(spec1);
			specWrapper.add(spec2);
			dataRow.add(specWrapper);
			dataRow.add($.UI.create('Label', {
				text: submittal.name ? submittal.name : '',
				classes: ["submittalChoice", "colL"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.ball_in_court ? submittal.ball_in_court : '',
				classes: ["submittalChoice", "colL"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.updated_at ? submittal.updated_at : '',
				classes: ["submittalChoice", "colS"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.submittal_due_date ? submittal.submittal_due_date : '',
				classes: ["submittalChoice", "colS"]
			}));
			dataRow.add($.UI.create('Label', {
				text: submittal.transmission_status ? submittal.transmission_status : '',
				classes: ["submittalChoice", "colM"]
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

var filterSubmittals = function(e) {
	var submittals = Ti.App.Properties.getObject("submittals");
	switch(e.data[0].value) {
		case 'Locked':
		case 'UnLocked':
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

global.konstruction.getSubmittals(showSubmittals);

$.addClass($.optionCorner.lbl_optionCorner, 'filter');
$.optionCorner.lbl_optionCorner.addEventListener('click', showSubmittalFilters);
