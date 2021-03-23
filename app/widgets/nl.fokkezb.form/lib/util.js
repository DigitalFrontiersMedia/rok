/**
 * Utilities.
 *
 * @class Widgets.nlFokkezbForm.lib.util
 * @private
 */

exports.extractProperties = extractProperties;

/**
 * Extracts properties out of argmnts. Best understood by example:
 *
 *     @example
 *     extractProperties({ label:'foo' }, 'label', 'text');
 *     // { text:'foo' }
 *     
 *     extractProperties({ labelid:'foo' }, 'label', 'text');
 *     // { text: L('foo') }
 *     
 *     extractProperties({ label:{ text:'foo', color:'red' } }, 'label', 'text');
 *     // { text:'foo', color:'red' }
 *
 * @param  {Object} argmnts  argmnts in which the key can be found.
 * @param  {String} key        Property or property+id to find in argmnts
 * @param  {String} string     Property or property+id to set in properties
 * @return {Object}            Extracted properties
 */
function extractProperties(argmnts, key, string) {
  var properties;

  var keyId = key + 'id';

  if (typeof argmnts[key] === 'object') {
    properties = argmnts[key];
  } else {
    properties = {};

    if (argmnts[key]) {
      properties[string] = argmnts[key];

    } else if (argmnts[keyId]) {
      properties[string] = L(argmnts[keyId]);
    }
  }

  delete argmnts[key];
  delete argmnts[keyId];

  return properties;
};