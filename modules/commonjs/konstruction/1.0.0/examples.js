var  konstruction = new (require("konstruction"))();

// Normal plain old request without caching
konstruction.GET({
	url: "http://freegeoip.net/json/", 
	onSuccess: onSuccessCallback, 
	onError: onErrorCallback
});

// Normal plain old request with a 5mins caching
konstruction.GET({
	url: "http://freegeoip.net/json/", 
	onSuccess: onSuccessCallback, 
	onError: onErrorCallback, 
	extraParams: { ttl: 5 }
});

// Request a remote image with 60 mins caching
// note that I am passing the contentType as an image, this tells the library to
// respond with binary content instead of plain text
konstruction.GET({
	url: "http://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/500px-Apple_logo_black.svg.png", 
	onSuccess: onImageSuccess, 
	onError: onErrorCallback, 
	extraParams: { ttl: 60, contentType: "image/png" }
});

function onSuccessCallback(e) {
	// Handle your request in here
	// the module will return an object with two properties
	// data (the actual data retuned
	// status ('ok' for normal requests and 'cache' for requests cached
	Titanium.API.info(e);
};

function onImageSuccess(e) {
	// Assign the image blob located in e.data directly to an image view
};

function onErrorCallback(e) {
	// Handle your errors in here
};

// Delete cached image file
konstruction.clear("http://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/500px-Apple_logo_black.svg.png");

// Delete all expired documents (this method should be called at least once in your app)
konstruction.clean();

// Delete all cached documents (expired or not, be very careful using this method)
konstruction.purge();