// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var setProject = function(project) {
	Ti.App.Properties.setString("project", project);
/*
	switch(project) {
		case 'PlanGrid':
			global.oauth.customAuthUrl = "https://io.plangrid.com/oauth/authorize";  
			global.oauth.customTokenUrl = "https://io.plangrid.com/oauth/token";  
			global.oauth.clientId = "7fc99cd6-c209-40f4-b112-588bc624492f";  
			global.oauth.state = "ROK-standard";  
			global.oauth.clientSecret = "68fdd6ff-9bd0-4d3d-b1d9-78851eee384b";  
			global.oauth.scope = "write:projects";  
			global.oauth.redirectUrl = "https://dev-dfm-rok.pantheonsite.io/";  
			global.oauth.customTitleText = "PlanGrid Authorization";  

			//prompt/show UI   |   success CB  |   error CB    |   allowCancel  |   cancel CB
			global.oauth.authorize(true, wizardContinue, global.onOauthError, true, global.onOauthCancel);			
		default:
			break;
	}
*/
};

var wizardContinue = function(authResults) {
	Alloy.createController('setupWizard_step4').getView().open();
};

var chooseProject = function(e) {
	setProject(e.source.text);
	wizardContinue();
	setTimeout(function() {
		$.nxtBtn.visible = true;
	}, 500);
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
	// TODO: Get list of projects via ti.xhr and populate table for selection.
	var projects = JSON.parse(results.data.text).data;
	if (projects) {
		projects.forEach(function(project) {
			if (project.name) {
				projectName = $.UI.create('Label', {
					text: project.name,
					classes: ["choice"]
				});
				dataRow = Ti.UI.createTableViewRow();
				dataRow.add(projectName);
				tableData.push(dataRow);
			}
		});
		if (tableData.length) {
			$.ListView_projects.data = tableData;
		}
	}
};

global.konstruction.getProjects(showProjects);
