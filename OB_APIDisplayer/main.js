/*
TODO list pour la partie API Displayer.
Retravailler le code proposé, modulariser...

TODO list pour les konnecteurs / le stockage Cozy
- (re)regarder comment ça marche, comment on peut l'intégrer à Cozy.

*/


var retr = require('./badge_retrieval');
var conv = require('./xapi_conversion');
var fs = require('fs');


/*userEmail examples : 
'selina.boulic@gmail.com' : ID = 420437
'billy.meinke@gmail.com' : ID = 867
'matt.rogers@digitalme.co.uk' : ID = 139029
*/

/* ========= VARIABLES DECLARATION ========= */
const earnerEmail = 'billy.meinke@gmail.com';
const dataFolder = './OB_badges'
//var earnerId = retr.earnerId . May?

var earnerData = JSON.stringify({
  email: earnerEmail
});

var rq_options1 = {
  uri : 'https://backpack.openbadges.org/displayer/convert/email', 
  method : 'POST',
  body : earnerData,
  headers: {'Content-Type': 'application/json',
	  'Content-Length': Buffer.byteLength(earnerData)
	}
};

var rq_options2 = {
  uri : '',
  method : 'GET'
};

/* ========= BADGE RETRIEVAL INTO FILES ========= */

//writes owner badges in files in ./OB_badges/ 
//retr.getGroupsBadges(rq_options1, rq_options2);


/* ========= FILES FORMAT CONVERSION ========= */

function filesConversion (folder) {
  //Conversion of files from openbadges specification to xAPI
  fs.readdirSync(folder).forEach((file) => {
    conv.xapi_conversion(folder+'/'+file, earnerEmail);
    console.log('done file '+folder+'/'+file);
  })
}
/*
function doAll () {
  var earnerFolder;
  return retr.getUserId(rq_options1)
    .then ((earnerId) => {
      earnerFolder = dataFolder+'/'+earnerId;
      if (!fs.existsSync(earnerFolder)) {
        fs.mkdirSync(earnerFolder);
      }
      return retr.getGroupsBadges(earnerId, rq_options2, earnerFolder)
    })
    .then (filesConversion(earnerFolder))
}
*/
doAll();



function doAll () {
  var earnerFolder;
  return retr.getUserId(rq_options1)
    .then ((earnerId) => {
      earnerFolder = dataFolder+'/'+earnerId;
      if (!fs.existsSync(earnerFolder)) {
        fs.mkdirSync(earnerFolder);
      }
      return retr.getGroupsBadges(earnerId, rq_options2, earnerFolder)
    })
    .then (() => {
      setTimeout(() => {
        filesConversion(earnerFolder);
      }, 10000) // Comment faire ici?! 
    })
}

