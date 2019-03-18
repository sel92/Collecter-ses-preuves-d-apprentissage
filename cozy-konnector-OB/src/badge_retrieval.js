

/* Retrieval of badges using Openbadges' API Displayer */

// This file only contains the 2 first steps for badge retrieval. The last one is done directly in main file './index.js'

var rp = require('request-promise');
var conv = require('./xapi_conversion');


async function getUserId(conv_options) {
/* 
 * Step 1 : getting user id on openbadges
 * POST request to OB's email-to-id conversion service :
 * from user's email address (specified in conv_options), function returns user's id
 */
  const res = await rp(conv_options);
  return JSON.parse(res).userId
}


async function getGroupsList (earnerId) {
/* 
 * Step 2 : getting groups list
 * The GET request returns a JSON string. Attribute 'groups' from the corresponding object contains the list of the user's badges groups, each being defined by an object with 3 attributes (groupId, name, badges), attribute "badges" giving the number of badges in the group. See doc.
 */
  var getList_options = {uri: 'https://backpack.openbadges.org/displayer/'+earnerId+'/groups', method: 'GET'};
  const res1 = await rp(getList_options)
  return JSON.parse(res1).groups; // = groups list
}


module.exports.getUserId = getUserId;
module.exports.getGroupsList = getGroupsList;


