// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var opts = global.xhrOptions;
opts.forceRefresh = args.forceRefresh || null;

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
	var dataRow = null;
	var tableData = [];
	var rfis = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (rfis) {
		global.setRfis(rfis);
		rfis.forEach(function(rfi) {
			if (rfi.title) {
				dataRow = $.UI.create('TableViewRow', {uid: rfi.uid});
				dataRow.leftImage = rfi.locked ? '/images/locked.png' : '/images/unlocked.png';
				dataRow.add($.UI.create('Label', {
					text: rfi.title,
					classes: ["rfiChoice"]
				}));
			}
			if (rfi.status.label) {
				dataRow.add($.UI.create('Label', {
					text: rfi.status.label.charAt(0).toUpperCase() + rfi.status.label.slice(1),
					classes: ["details"]
				}));
			}
			if (rfi.due_at) {			
				dataRow.add($.UI.create('Label', {
					text: 'Due: ' + global.formatDate(rfi.due_at),
					classes: ["details"]
				}));
			}
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
	$.ListView_rfis.data = tableData;
};

var filterRfis = function(e) {
	var rfis = Ti.App.Properties.getObject("rfis");
	switch(e.data[0].value) {
		case 'Locked':
		case 'UnLocked':
			for (var i = 0; i < rfis.length; i++) {
				$.removeClass($.ListView_rfis.data[0].rows[i], 'hidden');
				if (rfis[i].locked != e.data[0].value.toLowerCase()) {
					$.addClass($.ListView_rfis.data[0].rows[i], 'hidden');
				}
			}
			break;
			
		case 'Draft':
		case 'Open':
		case 'Closed':
		case 'Void':
			for (var i = 0; i < rfis.length; i++) {
				$.removeClass($.ListView_rfis.data[0].rows[i], 'hidden');
				if (rfis[i].status.label != e.data[0].value.toLowerCase()) {
					$.addClass($.ListView_rfis.data[0].rows[i], 'hidden');
				}
			}
			break;

		case 'None':
		default:
			for (var i = 0; i < rfis.length; i++) {
				$.removeClass($.ListView_rfis.data[0].rows[i], 'hidden');
			}			
			break;
	}
};

var showRfiFilters = function() {
	var opts = [
		{option_label: 'None'},
		{option_label: 'Locked'},
		{option_label: 'Unlocked'},
		{option_label: 'Draft'},
		{option_label: 'Open'},
		{option_label: 'Closed'},
		{option_label: 'Void'}
	];
	global.showOptions(L('filter_to_apply'), opts, $, filterRfis);
};

global.konstruction.getRfis(showRfis, opts);

$.addClass($.optionCorner.lbl_optionCorner, 'filter');
$.optionCorner.lbl_optionCorner.addEventListener('click', showRfiFilters);
