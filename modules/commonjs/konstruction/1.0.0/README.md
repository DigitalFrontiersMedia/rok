# konstruction:
konstruction is a wrapper for unified REST API calls to various construction management cloud applications. It works perfectly with REST API endpoints and has a built in cache system that you can use for your requests.


## Usage:
In your alloy.js (or elsewhere), call:

```javascript
//include konstruction
var xhr = new(require("konstruction"))();
```

## Options

In the 5 API call methods you can set options, but doing this every time might be a bit frustrating. Especially if you want authentication for every API call. (or other options). You can set it globally like this

```javascript
xhr.setStaticOptions(options);
```

If you do specify options in an API call, it will not ignore global options. This might be useful if all but 1 API call should be authenticated for example.

### Available Options

* `async` (default `true`) - If an API call should be async or not
* `ttl` (default `false`) - Seconds the API response should be cached (only works with `GET()`
* `shouldAuthenticate` (default `false`) - Should the call be made with authentication? BASIC Auth & oAuth supported
* `oAuthToken` - oAuth token. Only works if `shouldAuthenticate` is `true`
* `username` - Username for BASIC authentication. Only works if `shouldAuthenticate` is `true` and `oAuthToken` is not set
* `password` - Password for BASIC authentication. See `username`
* `contentType` (default `application/json`)- contentType for API call.
* `parseJSON` (default `false`) - Should provided data for `POST()` and `PUT()` be stringified and response (for all methods) be parsed.
* `returnXML` (default `false`) - Do you expect XML returned, put this to `true`
* `debug` (default `false`) - Do you want `Ti.API.info` to show API calls made
* `requestHeaders` (default `[]`) - Add custom request headers to the request

For some examples please check out the [examples.js](https://github.com/topener/XHR/blob/master/examples.js) file. Or browse around the [xhr.js](https://github.com/topener/XHR/blob/master/xhr.js) file. You can find in there support for GET, POST, PUT, PATCH and DELETE

### requestHeaders property
To add extra, custom, requestHeaders to the http request, you can set an array like this:

```javascript
    xhr.setStaticOptions({
        requestHeaders: [
            {
                key: 'myCustomId',
                value: 'myCustomValue'
            }
        ],
        debug: true
    });
```

This will set the requestHeader like you would do previously:
```js
    xhr.setRequestHeader('myCustomId', 'myCustomValue');
```

## Helpers
Apart from the RESTful way of interacting with your API endpoints, this module also includes the following helper methods:

### clear(url)

* **url**: (required) The URL you want removed from the cache manager

Finds the cached document of the given url (if any) and removes it from the cache manager. This method is useful if you are not satisfied with the results you got at the time.

### clean()
Goes through all the cached documents and delete everything that has been expired (if their TTL timestamp is less than the current time)

This method returns the count of deleted documents

### purge()
Goes through all the documents and deletes everything

This method returns the count of deleted documents


## About:
Created by Stephen Barker, [@digitalfrontier](https://twitter.com/digitalfrontier)

