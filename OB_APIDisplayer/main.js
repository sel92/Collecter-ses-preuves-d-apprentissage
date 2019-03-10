

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
const dataFolder = './OB_badges';

const earnerData = JSON.stringify({
  email: earnerEmail
});

const rq_options1 = {
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


/* ========= FILES FORMAT CONVERSION ========= */

function filesConversion (folder) {
  //Conversion of files from openbadges specification to xAPI
  fs.readdirSync(folder).forEach((file) => {
    conv.xapi_conversion(folder+'/'+file, earnerEmail);
    console.log('done file '+folder+'/'+file);
  })
}

/* ========= WHOLE RETRIEVAL / CONVERSION PROCEDURE ========= */

// with start it works well, but not with doAll...

//doAll();
start ();

async function start () {
  const earnerId = await retr.getUserId(rq_options1);
  var earnerFolder = dataFolder+'/'+earnerId;
  if (!fs.existsSync(earnerFolder)) {
    fs.mkdirSync(earnerFolder);
  }
  await retr.getGroupsBadges(earnerId, earnerFolder)
  console.log('starting xapi conversion');
  filesConversion(earnerFolder)
}

/*With start function, we get everything in the right order
awaiting some fun stuff
awaiting some fun stuff
awaiting some fun stuff
all data has been retrieved
starting xapi conversion
we re in // from conv

What's the problem in doAll() ?
*/

function doAll () {
  var earnerFolder;
  return retr.getUserId(rq_options1)
    .then ((earnerId) => {
      earnerFolder = dataFolder+'/'+earnerId;
      if (!fs.existsSync(earnerFolder)) {
        fs.mkdirSync(earnerFolder);
      }
      return retr.getGroupsBadges(earnerId, earnerFolder)
    })
	  .then (console.log('starting xapi conversion'))
	  
/*this is what we obtain with doAll()...
starting xapi conversion // last .then !
awaiting some fun stuff // retrieval of group badges in retr
awaiting some fun stuff
awaiting some fun stuff
all data has been retrieved // after all group badges have been retrieved and wirtten in file */
	  
    //.then (filesConversion(earnerFolder))
/*
    .then (() => {
      setTimeout(() => {
        filesConversion(earnerFolder);
      }, 10000) // Comment faire ici?! 
    })
*/
}

