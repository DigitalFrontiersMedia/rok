var Alloy = require('/alloy');
var jDrupal = {};

jDrupal.init = function () {
  jDrupal.csrf_token = false;
  jDrupal.sessid = null;
  jDrupal.modules = {};
  jDrupal.connected = false;
  jDrupal.settings = {
    sitePath: null,
    basePath: '/' };

};

jDrupal.init();

jDrupal.config = function (name) {
  var value = typeof arguments[1] !== 'undefined' ? arguments[1] : null;
  if (value) {
    jDrupal.settings[name] = value;
    return;
  }
  return jDrupal.settings[name];
};

jDrupal.sitePath = function () {
  return jDrupal.settings.sitePath;
};
jDrupal.basePath = function () {
  return jDrupal.settings.basePath;
};
jDrupal.restPath = function () {
  return this.sitePath() + this.basePath();
};
jDrupal.path = function () {
  return this.restPath().substr(this.restPath().indexOf('://') + 3).replace('localhost', '');
};

jDrupal.isReady = function () {
  try {
    var ready = !jDrupal.isEmpty(jDrupal.sitePath());
    if (!ready) {
      console.log('sitePath not set in jdrupal.settings.js');
    }
    return ready;
  } catch (error) {
    console.log('jDrupal.isReady - ' + error);
  }
};

jDrupal.isEmpty = function (value) {
  if (value !== null && typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return typeof value === 'undefined' || value === null || value == '';
};

jDrupal.functionExists = function (name) {
  return eval('typeof ' + name) == 'function';
};

jDrupal.inArray = function (needle, haystack) {
  try {
    if (typeof haystack === 'undefined') {
      return false;
    }
    if (typeof needle === 'string') {
      return haystack.indexOf(needle) > -1;
    } else {
      var found = false;
      for (var i = 0; i < haystack.length; i++) {
        if (haystack[i] == needle) {
          found = true;
          break;
        }
      }
      return found;
    }
  } catch (error) {
    console.log('jDrupal.inArray - ' + error);
  }
};

jDrupal.isArray = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

jDrupal.isInt = function (n) {
  if (typeof n === 'string') {
    n = parseInt(n);
  }
  return typeof n === 'number' && n % 1 == 0;
};

jDrupal.isPromise = function (obj) {
  return Promise.resolve(obj) == obj;
};

jDrupal.shuffle = function (array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

jDrupal.time = function () {
  var d = new Date();
  return Math.floor(d / 1000);
};

jDrupal.lcfirst = function (str) {
  str += '';
  var f = str.charAt(0).toLowerCase();
  return f + str.substr(1);
};

jDrupal.ucfirst = function (str) {
  str += '';
  var f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
};

jDrupal.Module = function () {
  this.name = null;
};

jDrupal.moduleExists = function (name) {
  try {
    return typeof jDrupal.modules[name] !== 'undefined';
  } catch (error) {
    console.log('jDrupal.moduleExists - ' + error);
  }
};

jDrupal.moduleImplements = function (hook) {
  try {
    var modules_that_implement = [];
    if (hook) {

      for (var module in jDrupal.modules) {
        if (jDrupal.modules.hasOwnProperty(module)) {
          if (jDrupal.functionExists(module + '_' + hook)) {
            modules_that_implement.push(module);
          }
        }
      }
    }
    if (modules_that_implement.length == 0) {
      return false;
    }
    return modules_that_implement;
  } catch (error) {
    console.log('jDrupal.moduleImplements - ' + error);
  }
};

jDrupal.moduleInvoke = function (module, hook) {
  if (!jDrupal.moduleLoad(module)) {
    return;
  }
  var name = module + '_' + hook;
  if (!jDrupal.functionExists(name)) {
    return;
  }

  var fn = window[name];
  var module_arguments = Array.prototype.slice.call(arguments);
  module_arguments.splice(0, 2);
  if (Object.getOwnPropertyNames(module_arguments).length == 0) {
    return fn();
  } else {
    return fn.apply(null, module_arguments);
  }
};

jDrupal.moduleInvokeAll = function (hook) {
  var promises = [];

  var module_arguments = Array.prototype.slice.call(arguments);
  module_arguments.splice(0, 1);

  var modules = [];
  for (var module in jDrupal.modules) {
    if (!jDrupal.modules.hasOwnProperty(module)) {
      continue;
    }
    if (!jDrupal.functionExists(module + '_' + hook)) {
      continue;
    }
    modules.push(module);
  }
  if (jDrupal.isEmpty(modules)) {
    return Promise.resolve();
  }

  for (var i = 0; i < modules.length; i++) {
    var invocation_results = null;
    if (module_arguments.length == 0) {
      promises.push(jDrupal.moduleInvoke(modules[i], hook));
    } else {
      module_arguments.unshift(modules[i], hook);
      promises.push(jDrupal.moduleInvoke.apply(null, module_arguments));
      module_arguments.splice(0, 2);
    }
  }

  return Promise.all(promises);
};

jDrupal.moduleLoad = function (name) {
  try {
    return jDrupal.modules[name] ? jDrupal.modules[name] : false;
  } catch (error) {
    console.log('jDrupal.moduleLoad - ' + error);
  }
};

jDrupal.modulesLoad = function () {
  return jDrupal.modules;
};

jDrupal.token = function () {
  return new Promise(function (resolve, reject) {
    var req = Titanium.Network.createHTTPClient();
    req.withCredentials = global.usingBasicAuth;
    if (global.usingBasicAuth) {
      req.username = global.basicAuthUser;
      req.password = global.basicAuthPass;
    }

    req.dg = {
      service: 'system',
      resource: 'token' };

    req.open('GET', jDrupal.restPath() + 'session/token');
    req.onload = function () {
      if (req.status == 200) {
        var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
        if (!invoke) {
          resolve(req.responseText);
        } else {
          invoke.then(resolve(req.responseText));
        }
      } else {
        reject(req);
      }
    };
    req.onerror = function (e) {
      reject(Error("Network Error" + JSON.stringify(e)));
    };
    req.send();
  });
};

jDrupal.connect = function () {
  return new Promise(function (resolve, reject) {
    var req = Titanium.Network.createHTTPClient();
    req.withCredentials = global.usingBasicAuth;
    if (global.usingBasicAuth) {
      req.username = global.basicAuthUser;
      req.password = global.basicAuthPass;
    }

    req.dg = {
      service: 'system',
      resource: 'connect' };

    if (global.usingBasicAuth) {
		req.setRequestHeader('Authorization', 'Basic ' + global.basicAuthHeader);
    }

    req.open('GET', jDrupal.restPath() + 'jdrupal/connect?_format=json');
    var connected = function () {
      jDrupal.connected = true;
      var result = JSON.parse(typeof req.responseText !== 'undefined' ? req.responseText : req.response);
      if (result.uid == 0) {
        jDrupal.setCurrentUser(jDrupal.userDefaults());
        resolve(result);
      } else {
        jDrupal.userLoad(result.uid).then(function (account) {
          jDrupal.setCurrentUser(account);
          resolve(result);
        });
      }
    };
    req.onload = function () {
      if (req.status != 200) {
        reject(req);return;
      }
      var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
      if (!invoke) {
        connected();
      } else {
        invoke.then(connected);
      }
    };
    req.onerror = function (e) {
      reject(Error("Network Error" + JSON.stringify(e)));
    };
    req.send();
  });
};

jDrupal.userLogin = function (name, pass, indicator) {
  var indicator = indicator;
  return new Promise(function (resolve, reject) {
    var req = Titanium.Network.createHTTPClient();
    req.withCredentials = global.usingBasicAuth;
    if (global.usingBasicAuth) {
      req.username = global.basicAuthUser;
      req.password = global.basicAuthPass;
    }

    req.dg = {
      service: 'user',
      resource: 'login' };


    req.open('POST', jDrupal.restPath() + 'user/login?_format=json');

    req.setRequestHeader('Content-type', 'application/json');
    if (global.usingBasicAuth) {
		req.setRequestHeader('Authorization', 'Basic ' + global.basicAuthHeader);
    }
    var connected = function () {
      jDrupal.connect().then(resolve);
    };
    req.onload = function () {
      if (req.status == 200) {
        var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
        if (!invoke) {
          connected();
        } else {
          invoke.then(connected);
        }
      } else {
        reject(req);
      }
    };
    req.onerror = function (e) {
      var appNotReadyLoginFailureDialog = Ti.UI.createAlertDialog({
        cancel: 0,
        buttonNames: ['Okay'],
        message: String.format(L('creds_changed_recently'), global.domain),
        title: L('login_failure')
	  });

      if (indicator) {
        indicator.hide();
      }

      if (e.code == 400) {
        //Alloy.Globals.Index.open();
        //Alloy.Globals.Index.setActiveTab(3);
        //getPlaylists();
        Ti.API.info('*** onerror ***\r\n' + JSON.stringify(e));
        appNotReadyLoginFailureDialog.show();
        return;
      }

      var dialog = Ti.UI.createAlertDialog({
        cancel: 0,
        buttonNames: ['Try again'],
        message: L('retry_creds'),
        title: L('login_failure')
	  });

      dialog.addEventListener('click', function (e) {
        if (e.index === e.source.cancel) {
          Ti.API.info('The cancel button was clicked');
        }
        if (e.index === e.source.register) {
          if (indicator) {
            indicator.show();
          } else {
            indicator = null;
          }
          jDrupal.userRegister(name, pass, name, indicator).then(function (e) {
            jDrupal.userLogin(name, pass, null).then(function (e) {
              var account = jDrupal.currentUser();
              userId = account.id();
              Ti.API.info('Registered & logged in User id: ' + userId);
              dontUpdateUser = true;
              newAccount = true;
              Ti.App.fireEvent("app:userRegistered");
              if (indicator) {
                indicator.hide();
              }
            });
          });
        }
      });
      dialog.show();
    };
    req.send(JSON.stringify({
      name: name,
      pass: pass }));
  });
};

jDrupal.userLogout = function () {
  return new Promise(function (resolve, reject) {
    var req = Titanium.Network.createHTTPClient();
    req.withCredentials = global.usingBasicAuth;
    if (global.usingBasicAuth) {
      req.username = global.basicAuthUser;
      req.password = global.basicAuthPass;
    }

    req.dg = {
      service: 'user',
      resource: 'logout' };


    req.open('GET', jDrupal.restPath() + 'user/logout');

    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    if (global.usingBasicAuth) {
		req.setRequestHeader('Authorization', 'Basic ' + global.basicAuthHeader);
    }
    var connected = function () {
      jDrupal.setCurrentUser(jDrupal.userDefaults());
      jDrupal.connect().then(resolve);
    };
    req.onload = function () {
      if (req.status == 200 || req.status == 303) {
        var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
        if (!invoke) {
          connected();
        } else {
          invoke.then(connected);
        }
      } else {
        reject(req);
      }
    };
    req.onerror = function (e) {
      reject(Error("Network Error" + JSON.stringify(e)));
    };
    req.send();
  });
};

jDrupal.entityLoad = function (entityType, entityID) {
  var entity = new this[this.ucfirst(entityType)](entityID);
  return entity.load();
};

jDrupal.commentLoad = function (cid) {
  return this.entityLoad('comment', cid);
};

jDrupal.nodeLoad = function (nid) {
  return this.entityLoad('node', nid);
};

jDrupal.userLoad = function (uid) {
  return this.entityLoad('user', uid);
};

jDrupal.userRegister = function (name, pass, mail, indicator) {
  return new Promise(function (resolve, reject) {
    jDrupal.token().then(function (token) {
      var req = Titanium.Network.createHTTPClient();
      req.withCredentials = global.usingBasicAuth;
      if (global.usingBasicAuth) {
        req.username = global.basicAuthUser;
        req.password = global.basicAuthPass;
      }

      req.dg = {
        service: 'user',
        resource: 'register' };

      req.open('POST', jDrupal.restPath() + 'user/register?_format=json');
      req.setRequestHeader('Content-type', 'application/json');
      req.setRequestHeader('X-CSRF-Token', token);
	  if (global.usingBasicAuth) {
	  	req.setRequestHeader('Authorization', 'Basic ' + global.basicAuthHeader);
	  }

      var connected = function () {
        jDrupal.connect().then(resolve);
      };
      req.onload = function () {
        if (req.status == 200) {
          var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
          if (!invoke) {
            connected();
          } else {
            invoke.then(connected);
          }
        } else {
          reject(req);
        }
      };
      req.onerror = function (e) {
        if (indicator) {
          indicator.hide();
        }
        if (e.code == 422) {
          var dialog = Ti.UI.createAlertDialog({
            cancel: 0,
            buttonNames: ['Okay'],
            message: L('email_failure'),
            title: L('new_account_failure') });

          dialog.addEventListener('click', function (e) {
            if (e.index === e.source.cancel) {}
          });
          dialog.show();
        } else {
          var dialog = Ti.UI.createAlertDialog({
            cancel: 0,
            buttonNames: ['Okay'],
            message: L('problem_occurred') + e.code,
            title: L('failure') });

          dialog.addEventListener('click', function (e) {
            if (e.index === e.source.cancel) {}
          });
          dialog.show();
        }
        reject(Error("Network Error " + JSON.stringify(e)));
      };
      req.send(JSON.stringify({
        name: { value: name },
        pass: { value: pass },
        mail: { value: mail } }));

    });
  });
};

jDrupal.Views = function (path) {
  this.path = path;
  this.results = null;
};

jDrupal.Views.prototype.getPath = function () {
  return this.path;
};

jDrupal.Views.prototype.getResults = function () {
  return this.results;
};

jDrupal.Views.prototype.getView = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    var req = Titanium.Network.createHTTPClient();
    req.withCredentials = global.usingBasicAuth;
    if (global.usingBasicAuth) {
      req.username = global.basicAuthUser;
      req.password = global.basicAuthPass;
    }

    req.dg = {
      service: 'views',
      resource: null };

    req.open('GET', jDrupal.restPath() + self.getPath());
    var loaded = function () {
      self.results = JSON.parse(req.responseText);
      resolve();
    };
    req.onload = function () {
      if (req.status == 200) {
        var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
        if (!invoke) {
          loaded();
        } else {
          invoke.then(loaded);
        }
      } else {
        reject(req);
      }
    };
    req.onerror = function (e) {
      reject(Error("Network Error" + JSON.stringify(e)));
    };
    req.send();
  });
};

jDrupal.viewsLoad = function (path) {
  return new Promise(function (resolve, reject) {
    var view = new jDrupal.Views(path);
    view.getView().then(function () {
      resolve(view);
    });
  });
};

jDrupal.Entity = function (entityType, bundle, id) {

  this.entity = null;

  this.bundle = bundle;
  this.entityID = id;

  this.entityKeys = {};
};

jDrupal.Entity.prototype.get = function (prop, delta) {
  if (!this.entity || typeof this.entity[prop] === 'undefined') {
    return null;
  }
  return typeof delta !== 'undefined' ? this.entity[prop][delta] : this.entity[prop];
};

jDrupal.Entity.prototype.set = function (prop, delta, val) {
  if (this.entity) {
    if (typeof delta !== 'undefined' && typeof this.entity[prop] !== 'undefined') {
      this.entity[prop][delta] = val;
    } else {
      this.entity[prop] = val;
    }
  }
};

jDrupal.Entity.prototype.getEntityKey = function (key) {
  return typeof this.entityKeys[key] !== 'undefined' ? this.entityKeys[key] : null;
};

jDrupal.Entity.prototype.getEntityType = function () {
  return this.entityKeys['type'];
};

jDrupal.Entity.prototype.getBundle = function () {
  var bundle = this.getEntityKey('bundle');
  return typeof this.entity[bundle] !== 'undefined' ? this.entity[bundle][0].target_id : null;
};

jDrupal.Entity.prototype.id = function () {
  var id = this.getEntityKey('id');
  if (typeof this.entity[id] == 'undefined') {
    id = this.getEntityKey('nid');
  }
  return typeof this.entity[id] !== 'undefined' ? this.entity[id][0].value : null;
};

jDrupal.Entity.prototype.language = function () {
  return this.entity.langcode[0].value;
};

jDrupal.Entity.prototype.isNew = function () {
  return !this.id();
};

jDrupal.Entity.prototype.image = function () {
  var image = this.getEntityKey('image');
  return typeof this.entity[image] !== 'undefined' && this.entity[image].length > 0 ? this.entity[image][0].url : null;
};

jDrupal.Entity.prototype.body = function () {
  var body = this.getEntityKey('body');
  var value;
  if (typeof this.entity[body] !== 'undefined') {
    if (typeof this.entity[body][0] !== 'undefined') {
      if (typeof this.entity[body][0].value !== 'undefined') {
        value = this.entity[body][0].value;
      } else {
        value = null;
      }
    }
  }
  return value;
};

jDrupal.Entity.prototype.label = function () {
  var label = this.getEntityKey('label');
  return typeof this.entity[label] !== 'undefined' ? this.entity[label][0].value : null;
};

jDrupal.Entity.prototype.stringify = function () {
  return JSON.stringify(this.entity);
};

jDrupal.Entity.prototype.preLoad = function (options) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
};

jDrupal.Entity.prototype.load = function () {
  try {
    var _entity = this;
    var entityType = _entity.getEntityType();
    return new Promise(function (resolve, reject) {

      _entity.preLoad().then(function () {

        var path = jDrupal.restPath() + entityType + '/' + _entity.id() + '?_format=json';
        var req = Titanium.Network.createHTTPClient();
        req.withCredentials = global.usingBasicAuth;
        if (global.usingBasicAuth) {
          req.username = global.basicAuthUser;
          req.password = global.basicAuthPass;
        }

        req.dg = {
          service: entityType,
          resource: 'retrieve' };

        req.open('GET', path);
        var loaded = function () {
          _entity.entity = JSON.parse(req.responseText);
          _entity.postLoad(req).then(function () {
            resolve(_entity);
          });
        };
        req.onload = function () {
          if (req.status == 200) {
            var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
            if (!invoke) {
              loaded();
            } else {
              invoke.then(loaded);
            }
          } else {
            reject(req);
          }
        };
        req.onerror = function (e) {
          reject(Error("Network Error" + JSON.stringify(e)));
        };
        req.send();
      });
    });
  } catch (error) {
    console.log('jDrupal.Entity.load - ' + error);
  }
};

jDrupal.Entity.prototype.postLoad = function (options) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
};

jDrupal.Entity.prototype.preSave = function (options) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
};

jDrupal.Entity.prototype.save = function () {

  var _entity = this;

  return new Promise(function (resolve, reject) {

    _entity.preSave().then(function () {

      jDrupal.token().then(function (token) {

        var entityType = _entity.getEntityType();
        var method = null;
        var resource = null;
        var path = null;
        var isNew = _entity.isNew();

        if (isNew) {
          method = 'POST';
          resource = 'create';
          path = 'entity/' + entityType;
        } else {
          method = 'PATCH';
          resource = 'update';
          path = entityType + '/' + _entity.id();
        }

        // TODO:  Add file-specific stuff here.

        path += '?_format=json';

        var req = Titanium.Network.createHTTPClient();
        req.withCredentials = global.usingBasicAuth;
        if (global.usingBasicAuth) {
          req.username = global.basicAuthUser;
          req.password = global.basicAuthPass;
        }

        req.dg = {
          service: entityType,
          resource: resource };

        req.open(method, jDrupal.restPath() + path);

        req.setRequestHeader('Content-type', 'application/json');
        req.setRequestHeader('X-CSRF-Token', token);
	    if (global.usingBasicAuth) {
			req.setRequestHeader('Authorization', 'Basic ' + global.basicAuthHeader);
	    }
       req.onload = function () {
          _entity.postSave(req).then(function () {
            if (method == 'POST' && req.status == 201 || method == 'PATCH' && req.status == 204 || req.status == 200) {
              var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
              if (!invoke) {
                resolve(req);
              } else {
                invoke.then(resolve(req));
              }
            } else {
              alert(L('error_occurred') + '.');
              reject(req);
            }
          });
        };
        req.onerror = function (e) {
          var dialog = Ti.UI.createAlertDialog({
            cancel: 0,
            buttonNames: ['Okay'],
            message: L('problem_occurred') + e.code,
            title: L('failure') });

          dialog.addEventListener('click', function (e) {
            if (e.index === e.source.cancel) {}
          });
          dialog.show();
          Ti.API.warn("Network Error" + JSON.stringify(e));
          reject(Error("Network Error" + JSON.stringify(e)));
        };
        req.send(_entity.stringify());
      });
    });
  });
};

jDrupal.Entity.prototype.postSave = function (xhr) {
  var self = this;
  var result = JSON.parse(typeof xhr.responseText !== 'undefined' ? xhr.responseText : xhr.response);
  //Ti.API.info('result = ' + JSON.stringify(result));
  return new Promise(function (resolve, reject) {
    if (result.hasOwnProperty('fid')) {
      //self = new global.jDrupal.File(result);
      self.entity = result;
      //Ti.API.info('self = ' + JSON.stringify(self));
    } else if (self.isNew() && xhr.getResponseHeader('Location')) {
      var parts = xhr.getResponseHeader('Location').split('/');
      var entityID = self.entity[self.getEntityKey('id')] = [{
        value: parts[parts.length - 1] }];
    }
    resolve();
  });
};

jDrupal.Entity.prototype.preDelete = function (options) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
};

jDrupal.Entity.prototype.delete = function (options) {
  var _entity = this;

  return new Promise(function (resolve, reject) {

    _entity.preDelete().then(function () {

      jDrupal.token().then(function (token) {

        var entityType = _entity.getEntityType();
        var path = jDrupal.restPath() + entityType + '/' + _entity.id();
        var data = {};
        data[_entity.getEntityKey('bundle')] = [{
          target_id: _entity.getBundle() }];

        var req = Titanium.Network.createHTTPClient();
        req.withCredentials = global.usingBasicAuth;
        if (global.usingBasicAuth) {
          req.username = global.basicAuthUser;
          req.password = global.basicAuthPass;
        }

        req.dg = {
          service: entityType,
          resource: 'delete' };

        req.open('DELETE', path);
        req.setRequestHeader('Content-type', 'application/json');
        req.setRequestHeader('X-CSRF-Token', token);
	    if (global.usingBasicAuth) {
			req.setRequestHeader('Authorization', 'Basic ' + global.basicAuthHeader);
	    }
        req.onload = function () {
          _entity.postDelete(req).then(function () {
            if (req.status == 204) {
              var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
              if (!invoke) {
                resolve(req);
              } else {
                invoke.then(resolve(req));
              }
            } else {
              reject(req);
            }
          });
        };
        req.onerror = function (e) {
          reject(Error("Network Error" + JSON.stringify(e)));
        };
        req.send(JSON.stringify(data));
      });
    });
  });
};

jDrupal.Entity.prototype.postDelete = function (options) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.entity = null;
    resolve();
  });
};

jDrupal.entityConstructorPrep = function (obj, entityID_or_entity) {
  if (!entityID_or_entity) {} else if (typeof entityID_or_entity === 'object') {
    obj.entity = entityID_or_entity;
  } else {
    var id = obj.getEntityKey('id');
    var entity = {};
    entity[id] = [{ value: entityID_or_entity }];
    obj.entity = entity;
  }
};

jDrupal.Comment = function (cid_or_comment) {
  this.entityKeys['type'] = 'comment';
  this.entityKeys['bundle'] = 'comment_type';
  this.entityKeys['id'] = 'cid';
  this.entityKeys['label'] = 'subject';

  jDrupal.entityConstructorPrep(this, cid_or_comment);
};

jDrupal.Comment.prototype = new jDrupal.Entity();

jDrupal.Comment.prototype.constructor = jDrupal.Comment;

jDrupal.Comment.prototype.getSubject = function () {
  return this.entity.subject[0].value;
};

jDrupal.Comment.prototype.setSubject = function (subject) {
  try {
    this.entity.subject[0].value = subject;
  } catch (e) {
    console.log('jDrupal.Comment.setSubject - ' + e);
  }
};

jDrupal.Comment.prototype.preSave = function (options) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
};

jDrupal.Comment.prototype.stringify = function () {

  try {

    if (!this.isNew()) {
      var entityClone = JSON.parse(JSON.stringify(this.entity));

      var protected_fields = ['hostname', 'changed', 'cid', 'thread', 'uuid', 'entity_id', 'entity_type', 'pid', 'field_name', 'created', 'name', 'mail', 'homepage'];
      for (var i = 0; i < protected_fields.length; i++) {
        if (typeof entityClone[protected_fields[i]] !== 'undefined') {
          delete entityClone[protected_fields[i]];
        }
      }
      return JSON.stringify(entityClone);
    }
    return JSON.stringify(this.entity);
  } catch (error) {
    console.log('jDrupal.Comment.stringify - ' + error);
  }
};

jDrupal.Vote = function (nid_or_node) {
  this.entityKeys['type'] = 'vote';
  this.entityKeys['id'] = 'nid';

  jDrupal.entityConstructorPrep(this, nid_or_node);
};

jDrupal.Vote.prototype = new jDrupal.Entity();

jDrupal.Vote.prototype.constructor = jDrupal.Vote;

jDrupal.Vote.prototype.preSave = function (options) {
  var self = this;
  return new Promise(function (resolve, reject) {
    resolve();
  });
};

jDrupal.Paragraph = function (eid_or_entity) {
  this.entityKeys['type'] = 'paragraph';
  this.entityKeys['id'] = 'eid';

  jDrupal.entityConstructorPrep(this, eid_or_entity);
};

jDrupal.Paragraph.prototype = new jDrupal.Entity();

jDrupal.Paragraph.prototype.constructor = jDrupal.Paragraph;

jDrupal.paragraphLoad = function (eid) {
  return this.entityLoad('paragraph', eid);
};

jDrupal.Paragraph.prototype.preSave = function (options) {
  var self = this;
  return new Promise(function (resolve, reject) {
    resolve();
  });
};

jDrupal.Node = function (nid_or_node) {
  this.entityKeys['type'] = 'node';
  this.entityKeys['bundle'] = 'type';
  this.entityKeys['id'] = 'nid';
  this.entityKeys['label'] = 'title';
  this.entityKeys['body'] = 'body';
  this.entityKeys['image'] = 'field_image';

  jDrupal.entityConstructorPrep(this, nid_or_node);

  if (this.entity) {
    if (!this.entity.title) {
      this.entity.title = [{ value: '' }];
    }
  }
};

jDrupal.Node.prototype = new jDrupal.Entity();

jDrupal.Node.prototype.constructor = jDrupal.Node;

jDrupal.Node.prototype.getImage = function () {
  return this.image();
};

jDrupal.Node.prototype.getBody = function () {
  return this.body();
};

jDrupal.Node.prototype.getTitle = function () {
  return this.label();
};

jDrupal.Node.prototype.setTitle = function (title) {
  try {
    this.entity.title[0].value = title;
  } catch (e) {
    console.log('jDrupal.Node.setTitle - ' + e);
  }
};

jDrupal.Node.prototype.getType = function () {
  return this.getBundle();
};

jDrupal.Node.prototype.getCreatedTime = function () {
  return this.entity.created[0].value;
};

jDrupal.Node.prototype.isPromoted = function () {
  return this.entity.promote[0].value;
};

jDrupal.Node.prototype.isPublished = function () {
  return this.entity.status[0].value;
};

jDrupal.Node.prototype.isSticky = function () {
  return this.entity.sticky[0].value;
};

jDrupal.Node.prototype.preSave = function (options) {
  var self = this;
  return new Promise(function (resolve, reject) {
    var protected_fields = ['changed', 'revision_timestamp', 'revision_uid'];
    for (var i = 0; i < protected_fields.length; i++) {
      delete self.entity[protected_fields[i]];
    }
    resolve();
  });
};

jDrupal.User = function (uid_or_account) {
  this.entityKeys['type'] = 'user';
  this.entityKeys['bundle'] = 'user';
  this.entityKeys['id'] = 'uid';
  this.entityKeys['label'] = 'name';

  jDrupal.entityConstructorPrep(this, uid_or_account);
};

jDrupal.User.prototype = new jDrupal.Entity();

jDrupal.User.prototype.constructor = jDrupal.User;

jDrupal.User.prototype.getAccountName = function () {
  return this.label();
};

jDrupal.User.prototype.getRoles = function () {
  var _roles = this.entity.roles;
  var roles = [];
  for (var i = 0; i < this.entity.roles.length; i++) {
    roles.push(this.entity.roles[i].target_id);
  }
  return roles;
};

jDrupal.User.prototype.hasRole = function (role) {
  return jDrupal.inArray(role, this.getRoles());
};

jDrupal.User.prototype.isAnonymous = function () {
  return this.id() == 0;
};

jDrupal.User.prototype.isAuthenticated = function () {
  return !this.isAnonymous();
};

jDrupal.currentUser = function () {
  return jDrupal._currentUser;
};

jDrupal.User.prototype.postLoad = function (options) {
  var self = this;
  return new Promise(function (ok, err) {
    if (!self.entity.roles) {
      self.entity.roles = [{ target_id: 'authenticated' }];
    }
    ok();
  });
};

jDrupal.userDefaults = function () {
  return new jDrupal.User({
    uid: [{ value: 0 }],
    roles: [{ target_id: 'anonymous' }] });

};

jDrupal.setCurrentUser = function (account) {
  if (account.isAuthenticated() && !jDrupal.inArray('authenticated', account.getRoles())) {
    account.entity.roles.push({ target_id: 'authenticated' });
  }

  jDrupal._currentUser = account;
};

jDrupal.userPassword = function () {
  var length = 10;
  if (arguments[0]) {
    length = arguments[0];
  }
  var password = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz23456789';
  for (var i = 0; i < length; i++) {
    password += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return password;
};

jDrupal.File = function (fid_or_fileEntity) {
  this.entityKeys['type'] = 'file';
  this.entityKeys['bundle'] = 'file';
  this.entityKeys['id'] = 'fid';
  this.entityKeys['label'] = 'filename';

  jDrupal.entityConstructorPrep(this, fid_or_fileEntity);
};

jDrupal.File.prototype = new jDrupal.Entity();

jDrupal.File.prototype.constructor = jDrupal.File;

jDrupal.File.prototype.preSave = function (options) {
  var self = this;
  return new Promise(function (resolve, reject) {
    resolve();
  });
};


jDrupal.File.prototype.upload = function (fileData, target_type, target_bundle, target_field, filename) {

  var _entity = this;

  return new Promise(function (resolve, reject) {

    _entity.preSave().then(function () {

      jDrupal.token().then(function (token) {

        var entityType = 'file';
        var method = null;
        var resource = null;
        var path = null;

        method = 'POST';
        resource = 'create';
        path = entityType + '/upload/' + target_type + '/' + target_bundle + '/' + target_field;

        path += '?_format=json';

        var req = Titanium.Network.createHTTPClient();
        req.withCredentials = global.usingBasicAuth;
        if (global.usingBasicAuth) {
          req.username = global.basicAuthUser;
          req.password = global.basicAuthPass;
        }

        Ti.API.info('fileData.size = ' + fileData.size);

        //req.media = fileData;

        req.open(method, jDrupal.restPath() + path);

        req.setRequestHeader('Content-type', 'application/octet-stream');
        req.setRequestHeader('Content-Disposition', 'file; filename="' + filename + '"');
        req.setRequestHeader('X-CSRF-Token', token);
	    if (global.usingBasicAuth) {
			req.setRequestHeader('Authorization', 'Basic ' + global.basicAuthHeader);
	    }
        req.onload = function () {
          _entity.postSave(req).then(function () {
            if (method == 'POST' && req.status == 201 || method == 'PATCH' && req.status == 204 || req.status == 200) {
              var invoke = jDrupal.moduleInvokeAll('rest_post_process', req);
              if (!invoke) {
                resolve(_entity);
              } else {
                invoke.then(resolve(_entity));
              }
            } else {
              alert(L('error_occurred') + '.');
              reject(req);
            }
          });
        };
        req.onerror = function (e) {
          var dialog = Ti.UI.createAlertDialog({
            cancel: 0,
            buttonNames: ['Okay'],
            message: L('problem_occurred') + e.code,
            title: L('failure') });

          global.shoutoutEl.show();
          dialog.addEventListener('click', function (e) {
            if (e.index === e.source.cancel) {}
          });
          dialog.show();
          Ti.API.warn("Network Error" + JSON.stringify(e));
          reject(Error("Network Error" + JSON.stringify(e)));
        };
        req.send(fileData);
      });
    });
  });
};



module.exports = jDrupal;