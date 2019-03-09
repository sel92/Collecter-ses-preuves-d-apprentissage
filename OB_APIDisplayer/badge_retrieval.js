

/* Retrieval of badges using Openbadges' API Displayer */

var rp = require('request-promise');
var fs = require('fs');

var baseUri = 'https://backpack.openbadges.org/displayer/';

function getGroupsBadges (earnerId, options2, folderToWrite) {
  options2.uri = baseUri+earnerId+'/groups';
  return rp(options2)
    .then((res) => {
      var recData = JSON.parse(res);
      console.debug('2nd res ', recData);
      var options_list = [];
      var groupsList = recData.groups;
      for (var i=0; i<groupsList.length; i++) {
        options_list.push({uri: baseUri+earnerId+'/group/'+groupsList[i].groupId, method: 'GET'});
      }
      //console.debug('here option_list ', options_list);
      // getBadges allows to do a request for each badge group, thanks to recursivity
      return writeBadgesInFiles (options_list, groupsList, folderToWrite)
    })
}

function getUserId(options1) {
  return rp(options1)
    .then((res) => {
      var recData = JSON.parse(res);
      return recData.userId
    })
}
/*
async function writeBadgesInFiles (options_list, groupsList, folder) {
  // si options_list est (encore) non vide on refait la request avec les options du premier objet de la liste et on retire ce dernier de options_list à la fin de l'opération
  if (options_list[0]) {
    var res = await rp(options_list[0]);
    fs.writeFileSync(folder+'/'+groupsList[0].name, res, () => {console.log('file written !')});
    options_list.shift(); //remove first element
    groupsList.shift();
    writeBadgesInFiles (options_list, groupsList, folder);
  } else {
    return console.log('c est fini !!!!!!!!!');
  }
}
*/
module.exports.getUserId = getUserId;
module.exports.getGroupsBadges = getGroupsBadges;

// OU
/*
async function executeAsyncTask() {
  const valueA = await functionA()
  const valueB = await functionB(valueA)
  return function3(valueA, valueB)
}
*/


/*
function getGroupsBadges (options1, options2) {
  console.log('Inside the function!');
  var earnerId;
  return rp(options1)
    .then(function (res) {
      var recData = JSON.parse(res);
      earnerId = recData.userId;
      //console.debug('returnedRes', earnerId);
      options2.uri = baseUri+earnerId+'/groups';
      return rp(options2)
    })
    .then(function (res) {
      var recData = JSON.parse(res);
      console.debug('2nd res ', recData);
      var options_list = [];
      var groupsList = recData.groups;
      for (var i=0; i<groupsList.length; i++) {
        options_list.push({uri: baseUri+earnerId+'/group/'+groupsList[i].groupId, method: 'GET'});
      }
      //console.debug('here option_list ', options_list);
      // getBadges allows to do a request for each badge group, thanks to recursivity
      return writeBadgesInFiles (options_list, groupsList, earnerId)
    })
}
*/


function writeBadgesInFiles (options_list, groupsList, folder) {
  // si options_list est (encore) non vide on refait la request avec les options du premier objet de la liste et on retire ce dernier de options_list à la fin de l'opération
  if (options_list[0]) {
    return rp(options_list[0])
      .then ((res) => {
        fs.writeFileSync(folder+'/'+groupsList[0].name, res, () => {console.log('file written !')});
        options_list.shift(); //remove first element
        groupsList.shift();
        writeBadgesInFiles (options_list, groupsList, folder);
      })
  } else {
    console.log('c est fini !!!!!!!!!');
  }
}

