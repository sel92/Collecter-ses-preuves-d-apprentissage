

/* Retrieval of badges using Openbadges' API Displayer */

var rp = require('request-promise');
var fs = require('fs');


async function getUserId(conv_options) {
/* 
 * POST request to OB's email-to-id conversion service :
 * from user's email address (specified in conv_options), function returns user's id
 */
  const res = await rp(conv_options);
  return JSON.parse(res).userId
}


async function getGroupsBadges (earnerId, earnerFolder) {
/* 
 * Step 1: getting groups list
 * The GET request returns a JSON string. Attribute 'groups' from the corresponding object contains the list of the user's badges groups, each being defined by an object with 3 attributes (groupId, name, badges), attribute "badges" giving the number of badges in the group. See doc.
 *
 * Step 2 : Writing the content of each badges group in a file : earnerId+'/'+group.name
 */
  var getList_options = {uri: 'https://backpack.openbadges.org/displayer/'+earnerId+'/groups', method: 'GET'};
  const res1 = await rp(getList_options)
  const groupsList = JSON.parse(res1).groups;

  await Promise.all(groupsList.map(async (group) => {
    // this structure is supposed to allow multiple asynchronous calls in parallel
    console.log('awaiting some fun stuff');
    const res2 = await rp({uri: 'https://backpack.openbadges.org/displayer/'+earnerId+'/group/'+group.groupId, method: 'GET'})
    fs.writeFileSync(earnerFolder+'/'+group.name, res2, () => {
    console.log('file written !');    
    });
  }))
  console.log('all data has been retrieved');

/*
  for (const group of groupsList) {
  // this structure allows multiple asynchronous calls in sequence
    const res2 = await rp({uri: 'https://backpack.openbadges.org/displayer/'+earnerId+'/group/'+group.groupId, method: 'GET'})
    fs.writeFileSync(earnerFolder+'/'+group.name, res2, () => {
    console.log('file written !');
    });
  }
 */

}


module.exports.getUserId = getUserId;
module.exports.getGroupsBadges = getGroupsBadges;

