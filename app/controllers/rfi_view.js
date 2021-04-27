// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var rfi = Ti.App.Properties.getObject("rfis");
var editMode = false;
var editableFields = ['TextField_title', 'TextArea_question', 'TextField_due_at'];

Ti.API.info('RFI = ' + JSON.stringify(rfi[args.index]));

var listUser = function(results) {
	var userInfo = results.status == 200 ? JSON.parse(results.data) : JSON.parse(results.data.text);
	Ti.API.info('userInfo = ' + JSON.stringify(userInfo));
	$.TextField_assigned.value += global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name) + '\n';
};

var getAndListAssignedUserInfo = function(users) {
	users.forEach(function(user) {
		global.konstruction.getUserInfo(user, listUser);
	});
};

var showRef = function(title, url) {
	if (url.indexOf('response-content-disposition=attachment') == -1) {
		var dialog = require('ti.webdialog');
		if (dialog.isSupported()) {
			dialog.open({
				id: 'refDisplay',
		    	title: title,
		    	url: url,
		        tintColor: '#ffffff',
		        barColor: '#ff9200',
		        showTitle: true,
		        animated: true,
		        fadeTransition: true,
		        enableSharing: false
		   });
	   }
	 } else {
	    var hashedURL = Titanium.Utils.md5HexDigest(url);
	    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);
	    var modal = Alloy.createWidget("com.caffeinalab.titanium.modalwindow", {
			title : 'ROK ' + title,//file.name,
			classes : ["modal"]
		});
		var webview = Titanium.UI.createWebView({
			backgroundColor: 'transparent',
			url: Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, '/pdfViewer/viewer.html').nativePath + '?file=' + file.nativePath
		});
		modal.add(webview);
		modal.open();
	}
};

var chooseRef = function(e) {
	Ti.API.info('e.section.rows[e.index].url = ' + e.section.rows[e.index].url);
	if (e.section.rows[e.index].url.indexOf('response-content-disposition=attachment') > -1) {
		global.xhr.GET({
			extraParams: {shouldAuthenticate: false, contentType: '', ttl: 60, responseType: 'blob'},
		    url: e.section.rows[e.index].url,
		    onSuccess: function (results) {
		    	//Ti.API.info('getDocument = ' + JSON.stringify(results));
		    	showRef(e.source.text, e.section.rows[e.index].url);
		    },
		    onError: global.onXHRError
		});
	} else {
		showRef(e.source.text, e.section.rows[e.index].url);
	}
};

var listPhotos = function(results) {
	var photoLabel;
	var x = 1;
	var dataRow;
	var tableData = [];
	var photos = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('photos = ' + JSON.stringify(photos));
	if (photos.length) {
		photoLabel = $.UI.create('Label', {text: 'Photos', classes: ['listLabels']});
		dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel', 'zebra']});
		dataRow.add(photoLabel);
		tableData.push(dataRow);
	}
	photos.forEach(function(photo) {
		photoTitle = global.UTIL.cleanString(photo.title) ? '• ' + global.UTIL.cleanString(photo.title) : "• Photo " + x;
		photoLabel = $.UI.create('Label', {text: photoTitle, classes: ["listLabels"]});
		dataRow = Ti.UI.createTableViewRow({url: photo.url});
		dataRow.add(photoLabel);
		x++;
		if (x % 2) {
			//$.addClass(dataRow, 'zebra');
		}
		tableData.push(dataRow);
	});
	$.ListView_refs.appendRow(tableData);
};

var listDocuments = function(results) {
	var attachmentLabel;
	var x = 1;
	var dataRow;
	var tableData = [];
	var attachments = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('attachments = ' + JSON.stringify(attachments));
	if (attachments.length) {
		attachmentLabel = $.UI.create('Label', {text: 'Documents', classes: ['listLabels']});
		dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel', 'zebra']});
		dataRow.add(attachmentLabel);
		tableData.push(dataRow);
	}
	attachments.forEach(function(attachment) {
		attachmentTitle = global.UTIL.cleanString(attachment.name) ? '• ' + global.UTIL.cleanString(attachment.name) : "• Document " + x;
		attachmentLabel = $.UI.create('Label', {text: attachmentTitle, classes: ["listLabels"]});
		dataRow = Ti.UI.createTableViewRow({url: attachment.url, name: attachment.name});
		dataRow.add(attachmentLabel);
		x++;
		if (x % 2) {
			//$.addClass(dataRow, 'zebra');
		}
		tableData.push(dataRow);
	});
	$.ListView_refs.appendRow(tableData);
};

var listSnapshots = function(results) {
	var snapshotLabel;
	var x = 1;
	var dataRow;
	var tableData = [];
	var snapshots = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('snapshots = ' + JSON.stringify(snapshots));
	if (snapshots.length) {
		snapshotLabel = $.UI.create('Label', {text: 'Snapshots', classes: ['listLabels']});
		dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel', 'zebra']});
		dataRow.add(snapshotLabel);
		tableData.push(dataRow);
	}
	snapshots.forEach(function(snapshot) {
		snapshotTitle = global.UTIL.cleanString(snapshot.title) ? '• ' + global.UTIL.cleanString(snapshot.title) : "• Snapshot " + x;
		snapshotLabel = $.UI.create('Label', {text: snapshotTitle, classes: ["listLabels"]});
		dataRow = Ti.UI.createTableViewRow({url: snapshot.url});
		dataRow.add(snapshotLabel);
		x++;
		if (x % 2) {
			//$.addClass(dataRow, 'zebra');
		}
		tableData.push(dataRow);
	});
	$.ListView_refs.appendRow(tableData);
};

var listHistoryEvents = function(results) {
	var historyEventLabel;
	var userInfo;
	var username;
	var x = 0;
	var dataRow;
	//var tableData = [];
	var historyEvents = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	Ti.API.info('historyEvents = ' + JSON.stringify(historyEvents));
	historyEvents.forEach(function(historyEvent) {
		var myPromise = new Promise(function(resolve, reject) { 
			global.konstruction.getUserInfo(historyEvent.updated_by, resolve);
		});
		myPromise.then(function(userInfo) {
			//Ti.API.info('userInfo = ' + JSON.stringify(userInfo));
			userInfo = userInfo.status == 200 ? JSON.parse(userInfo.data) : JSON.parse(userInfo.data.text);
			username = global.UTIL.cleanString(userInfo.first_name) + ' ' + global.UTIL.cleanString(userInfo.last_name);
			if (historyEvent.field == 'locked') {
				historyEventLine = (historyEvent.new_value == true) ? historyEvent.field : 'un' + historyEvent.field;
			} else {
				historyEventLine = historyEvent.field.split('_').join(' ') + ' updated';
			}
			historyEventLine = historyEventLine.charAt(0).toUpperCase() + historyEventLine.slice(1);
			historyEventLine += '. | ' + username + ', ' + global.formatDate(historyEvent.updated_at) + '.';
			//Ti.API.info('historyEventLine = ' + historyEventLine);
			historyEventLabel = $.UI.create('Label', {text: historyEventLine, classes: ["listLabels"]});
			dataRow = $.UI.create('TableViewRow', {classes: ['sectionLabel']});
			dataRow.add(historyEventLabel);
			x++;
			if (x % 2) {
				$.addClass(dataRow, 'zebra');
			}
			//tableData.push(dataRow);
			$.ListView_historyEvents.appendRow(dataRow);
		});
	});
};

var handleEdit = function(clicked) {
	Ti.API.info('handleEdit clicked = ' + JSON.stringify(clicked));
	var clickedField = clicked.split('Wrapper').join('');
	if (clickedField != 'TextField_due_at') {
		$[clickedField].focus();
	} else {
		var minDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
		var maxDate = new Date(new Date().getFullYear() + 3, 11, 31);
		var defaultValue = global.formatDate(new Date());
		var maxSelectedDate = maxDate;
		var datePicker = Alloy.createWidget('danielhanold.pickerWidget', {
			id: 'datePicker',
			outerView: $.rfi_view,
			hideNavBar: false,
			type: 'date-picker',
			pickerParams: {
				minDate: minDate,
				maxDate: maxDate,
				value: defaultValue,
				//maxSelectedDate: maxSelectedDate,
				//maxSelectedDateErrorMessage: 'You must be at least 18 years old.'
			},
			onDone: function(e) {
				//Ti.API.info('e = ' + JSON.stringify(e));
				if (e.data) {
					$[clickedField].value = global.formatDate(e.data.date);
					//$[clickedField].width = Ti.UI.FILL;
				}
			},
			title: 'Due Date',
			height: '50%',
			top: '25%',
			bottom: '10%',
			width: '33%',
			backgroundColor: '#333'
		});
	}
};

var saveSuccess = function() {
	var dialog = Ti.UI.createAlertDialog({
		okay: 0,
	    buttonNames: ['OK'],
		message: 'Changes saved to ' + global.konstruction.platform + ' successfully.',
		title: 'Saved'
	});
	dialog.addEventListener('click', function(e) {
		if (e.index === e.source.okay) {
			$.rfi_view.close();
			Alloy.createController('rfis').getView().close();
			Alloy.createController('rfis', {forceRefresh: true}).getView().open();
		}
	});
	dialog.show();
};

var editSaveRfi = function() {
	editMode = !editMode;
	if (editMode) {
		$.removeClass($.optionCorner.lbl_optionCorner, 'edit');
		$.addClass($.optionCorner.lbl_optionCorner, 'save');
		editableFields.forEach(function(field) {
			$[field].editable = true;
			$.addClass($[field + 'Wrapper'], 'editable');
			$.addClass($['Label_' + field], 'noUnderline');
			$[field + 'Wrapper'].addEventListener('click', function(e) {
				handleEdit(e.source.id);
			});
		});
	} else {
		var dirty = false;
		var data = {};
		Ti.UI.Android.hideSoftKeyboard();
		$.removeClass($.optionCorner.lbl_optionCorner, 'save');
		$.addClass($.optionCorner.lbl_optionCorner, 'edit');
		editableFields.forEach(function(field) {
			var originalFieldName = field.split('TextField_').join('').split('TextArea_').join('');
			var originalFieldValue = rfi[args.index][originalFieldName];
			$[field].editable = false;
			$.removeClass($[field + 'Wrapper'], 'editable');
			$.removeClass($['Label_' + field], 'noUnderline');
			$[field + 'Wrapper'].removeEventListener('click', function() {});
			if ($[field].value == '') {
				alert('Field values cannot be left empty.');
				return;
			}
			if ($[field].value !== global.UTIL.cleanString(originalFieldValue)) {
				data[originalFieldName] = $[field].value;
				dirty = true;
			}
		});
		// Perform RFI update if required
		if (dirty) {
			data.sent_at = new Date().toISOString();
			if (data.due_at) {
				data.due_at = new Date(data.due_at).toISOString();
			}
			global.konstruction.updateRfi(rfi[args.index].uid, JSON.stringify(data), saveSuccess);
		}
	}
};

// Dismiss keyboard if user "clicks away" from fields being edited.
$.rfi_view.addEventListener('click', function(e) {
	if (editMode) {
		if (!editableFields.includes(e.source.id)) {
			Ti.UI.Android.hideSoftKeyboard();
			// editableFields.forEach(function(field) {
				// $[field].top = 0;
			// });
			editableFields.forEach(function(field) {
				$[field].blur();
			});
		}
	}
});

$.addClass($.optionCorner.lbl_optionCorner, 'edit');
$.optionCorner.lbl_optionCorner.addEventListener('click', editSaveRfi);

$.Label_Title.text = L("rfi") + ' #' + rfi[args.index].number;
$.Label_subTitle.text = Ti.App.Properties.getString("project");

$.TextField_title.value = global.UTIL.cleanString(rfi[args.index].title);
$.TextArea_question.value = global.UTIL.cleanString(rfi[args.index].question);
$.TextArea_answer.value = global.UTIL.cleanString(rfi[args.index].answer);
$.TextField_sendDate.value = global.formatDate(rfi[args.index].sent_at);
$.TextField_due_at.value = global.formatDate(rfi[args.index].due_at);

getAndListAssignedUserInfo(rfi[args.index].assigned_to);
global.konstruction.getRfiPhotos(rfi[args.index].uid, listPhotos);
global.konstruction.getRfiDocuments(rfi[args.index].uid, listDocuments);
global.konstruction.getRfiSnapshots(rfi[args.index].uid, listSnapshots);
global.konstruction.getRfiHistoryEvents(rfi[args.index].uid, listHistoryEvents);

