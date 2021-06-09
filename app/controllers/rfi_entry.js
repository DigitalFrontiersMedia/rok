// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var rfi = Ti.App.Properties.getObject("rfis");
var editMode = false;
var editableFields = ['TextField_title', 'TextArea_question', 'TextField_due_at'];

Ti.API.info('RFI = ' + JSON.stringify(rfi[args.index]));

var handleEdit = function(e) {
	Ti.API.info('handleEdit clicked = ' + JSON.stringify(clicked));
	var clicked = e.source.id;
	var clickedField = clicked.split('Wrapper').join('');
	if (clickedField != 'TextField_due_at') {
		$[clickedField].focus();
	} else {
		Ti.UI.Android.hideSoftKeyboard();
		var minDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
		var maxDate = new Date(new Date().getFullYear() + 3, 11, 31);
		var defaultValue = global.formatDate(new Date());
		var maxSelectedDate = maxDate;
		var datePicker = Alloy.createWidget('danielhanold.pickerWidget', {
			id: 'datePicker',
			outerView: $.rfi_entry,
			hideNavBar: false,
			type: 'date-picker',
			pickerParams: {
				minDate: minDate,
				maxDate: maxDate,
				value: defaultValue,
			},
			onDone: function(e) {
				//Ti.API.info('e = ' + JSON.stringify(e));
				if (e.data) {
					$[clickedField].value = global.formatDate(e.data.date);
					//$[clickedField].width = Ti.UI.FILL;
				}
			},
			title: 'Due Date',
			height: 0,
			top: '25%',
			bottom: '10%',
			width: '33%',
			backgroundColor: '#333'
		});
	}
};

var closeAndRefreshRfis = function() {
	$.rfi_entry.close();
	Alloy.createController('rfis').getView().close();
	Alloy.createController('rfis', {forceRefresh: true}).getView().open();
};

var saveSuccess = function(results) {
	//Ti.API.info('saveSuccess results = ' + JSON.stringify(results));
	Alloy.Globals.loading.hide();
	var rfi = results.status == 201 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	var message = $.UI.create('Label', {text: String.format(L('rfi_created'), global.konstruction.platform)});
	var arg = {
		title : L('rfi') + ' #' + rfi.number,
		container : $.getView().parent,
		callback : closeAndRefreshRfis
	};
	var commonView = Alloy.createController('commonView', arg).getView();
	commonView.getViewById('contentWrapper').add(message);
	$.getView().parent.add(commonView);
};

var saveRfi = function() {
	var dirty = false;
	var data = {};
	var fieldsLeftEmpty = false;
	Ti.UI.Android.hideSoftKeyboard();
	editableFields.forEach(function(field) {
		var originalFieldName = field.split('TextField_').join('').split('TextArea_').join('');
		if ($[field].value == '') {
			fieldsLeftEmpty = true;
			return;
		}
		data[originalFieldName] = $[field].value;
		dirty = true;
	});
	if (fieldsLeftEmpty) {
		alert(L('fields_empty'));
		return;
	}
	// Perform RFI submission if required
	if (dirty) {
		data.sent_at = new Date().toISOString();
		if (data.due_at) {
			data.due_at = new Date(data.due_at).toISOString();
		}
		Alloy.Globals.loading.show(L('loading'));
		global.konstruction.createRfi(JSON.stringify(data), saveSuccess);
	}
};

// Dismiss keyboard if user "clicks away" from fields being edited.
$.rfi_entry.addEventListener('click', function(e) {
	if (!editableFields.includes(e.source.id)) {
		Ti.UI.Android.hideSoftKeyboard();
		// editableFields.forEach(function(field) {
			// $[field].top = 0;
		// });
		editableFields.forEach(function(field) {
			$[field].blur();
		});
	}
});

$.addClass($.optionCorner.lbl_optionCorner, 'save');
$.optionCorner.lbl_optionCorner.addEventListener('click', saveRfi);

$.Label_subTitle.text = Ti.App.Properties.getString("project");


