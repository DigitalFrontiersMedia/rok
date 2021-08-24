// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var setProject = function(index) {
	Ti.App.Properties.setString("project", Ti.App.Properties.getObject("projects")[index].name);
	Ti.App.Properties.setString("project_uid", Ti.App.Properties.getObject("projects")[index].uid);
};

var wizardContinue = function(authResults) {
	Alloy.createController('setupWizard_step4').getView().open();
};

var chooseProject = function(e) {
	for (var i = 0; i < $.ListView_projects.data[0].rows.length; ++i) {
	    $.ListView_projects.data[0].rows[i].hasCheck = false;
	}
	$.ListView_projects.data[0].rows[e.index].hasCheck = true;
	setProject(e.index);
	wizardContinue();
	setTimeout(function() {
		$.nxtBtn.visible = true;
	}, 500);
};

var denoteInitial = function(val) {
	for (var i = 0; i < $.ListView_projects.data[0].rows.length; ++i) {
	    $.ListView_projects.data[0].rows[i].hasCheck = (Ti.App.Properties.getObject("projects")[i].uid == val && val != null && val != '');
	}
};

if (!Ti.App.Properties.getString('project')) {
	$.nxtBtn.visible = false;
} else {
	$.nxtBtn.visible = true;
}

var showProjects = function(results) {
	Ti.API.info('konstruction.getProjects results = ' + JSON.stringify(results));
	var dataRow;
	var tableData = [];
	var projects = results.status == 200 ? JSON.parse(results.data).data : JSON.parse(results.data.text).data;
	if (projects) {
		global.setProjects(projects);
		projects.forEach(function(project) {
			if (project.name) {
				projectName = $.UI.create('Label', {
					text: project.name,
					classes: ["choice"]
				});
				dataRow = $.UI.create('TableViewRow');
				dataRow.add(projectName);
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
		$.ListView_projects.data = tableData;
		denoteInitial(Ti.App.Properties.getString("project_uid"));
	} else {
		deviceName = $.UI.create('Label', {
			text: L('no_items'),
			classes: ["choice", 'centered'],
			bottom: 0,
			top: 0
		});
		dataRow = $.UI.create('TableViewRow');
		dataRow.add(deviceName);
		tableData.push(dataRow);
		$.ListView_projects.data = tableData;
	}
};

global.konstruction.getProjects(showProjects);
