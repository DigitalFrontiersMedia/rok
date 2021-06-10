// for Alloy this file goes in /assets
Ti.API.info('* syncService Run *');

if (Ti.App.Properties.getBool('configured')) {
	// TODO: Create callbacks to iterate through all RFIs, Documents, Drawings, Submittals 
	//       to load those, if needed, as well as any sub-items like attached Photos, Documents, etc.
	global.konstruction.getRfis();
	global.konstruction.getDocuments();
	global.konstruction.getDrawings();
	global.konstruction.getSubmittals();
}
