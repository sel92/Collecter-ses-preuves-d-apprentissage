/*
TODO list pour la partie API Displayer.
Retravailler le code proposé, modulariser...

TODO list pour la conversion xAPI
voir le fichier cooncerné conversion_xapi

TODO list pour les konnecteurs / le stockage Cozy
- (re)regarder comment ça marche, comment on peut l'intégrer à Cozy.
Alors que les tests pour l'instant sont fait sur le navigateur en local.
*/


/* Retrieval of badges using Openbadges' API Displayer */

//var express = require("express");
//var logfmt = require("logfmt");
//var https = require("https");
//var bodyParser = require('body-parser');
var rp = require('request-promise');
var fs = require('fs');



//app.use(logfmt.requestLogger());
//app.use(bodyParser.json());

/*userEmail examples : 
'selina.boulic@gmail.com' : ID = 420437
'billy.meinke@gmail.com' : ID = 867
*/

var earnerData = JSON.stringify({
  email: 'billy.meinke@gmail.com'
});

var requestOptions1 = {
  uri : 'https://backpack.openbadges.org/displayer/convert/email', 
  method : 'POST',
  body : earnerData,
  headers: {'Content-Type': 'application/json',
	  'Content-Length': Buffer.byteLength(earnerData)
	}
};

var requestOptions2 = {
  uri : '',
  method : 'GET'
}

function getGroupsIdsList (options1, options2, baseUri) {
  //baseUri has to be 'https://backpack.openbadges.org/displayer/'
  console.log('Inside the function!');
  var earnerId;
  return rp(requestOptions1)
    .then(function (res) {
      var recData = JSON.parse(res);
      earnerId = recData.userId;
      console.debug('returnedRes', earnerId);
      requestOptions2.uri = baseUri+earnerId+'/groups',
      console.debug('2nd uri is now ', requestOptions2.uri);
      return rp(requestOptions2)
    })
    .then(function (res) {
      var recData = JSON.parse(res);
      console.debug('2nd res ', recData);
      // same idea, done in separate function to handle each group
      var options_list = [];
      var groupsList = recData.groups;
      for (var i=0; i<groupsList.length; i++) {
        options_list.push({uri: baseUri+earnerId+'/group/'+groupsList[i].groupId, method: 'GET'});
      }
      console.debug('here option_list ', options_list);
      return getBadges(options_list)
    })

function getBadges (options_list) {
  if (options_list[0]) { // si options_list est (encore) non vide
    return rp(options_list[0])
      .then (function (res) {
        console.debug('in the 3rd step, 1st badges list ', res);
        options_list.shift(); //remove first element
        getBadges (options_list);
      })
  } else {
    console.log('c est fini !!!!!!!!!');
  }
}
        
//      return options_list et le then etBadgesGroupsList
//      return getBadgesGroupsList(recData.groups, baseUri+earnerId+'/group/')
  
}

/*
async function getBadgesGroupsList(groupsList, baseUri) {
  var options_list = [];
  for (var i=0; i<groupsList.length; i++) {
    options_list.push({uri: baseUri+groupsList[i].groupId, method: 'GET'});
    return rp(options3)
  }
}

*/

getGroupsIdsList(requestOptions1, requestOptions2, 'https://backpack.openbadges.org/displayer/');


// OU
/*
async function executeAsyncTask() {
  const valueA = await functionA()
  const valueB = await functionB(valueA)
  return function3(valueA, valueB)
}
*/

