

/* ========= LIBRARIES ========= */

const {
  BaseKonnector,
  log,
  mkdirp,
  normalizeFilename, // tool to renormalize filename, notably removing characters that could be an issue : <>:"/\|?*, multiple spaces etc (see doc)
  addData
} = require('cozy-konnector-libs')

var rp = require('request-promise');

var retr = require('./badge_retrieval');
var conv = require('./xapi_conversion');
//var fs = require('fs'); // no need in Cozy

/* ========= PARAMETERS DECLARATION ========= */

const earnerEmail = 'billy.meinke@gmail.com';
//const dataFolder = './OB_badges';

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


module.exports = new BaseKonnector(start)

   /*============MAIN FUNCTION : START()=================*/

async function start() {

  // Getting user id
  log('info', 'getting earner ID from openbadges...')
	const earnerId = await retr.getUserId(rq_options1)
//	console.log('Earner ID is '+ earnerId);
	
	log('info', 'creating earner folder')
  var earnerFolder = '/'+earnerId;
  await mkdirp(earnerFolder) // creates folder in Cozy if it does not yet exists
//  console.log('Folder created : '+ earnerFolder);
  
  
  // getting badges groups
  log('info', 'Retrieving my badges and writting in folder...', earnerFolder)
  const groupsList = await retr.getGroupsList(earnerId);
//  console.debug('liste des groupes json ', groupsList);

  // badges handling
  await Promise.all(groupsList.map(async (group) => {
    // this structure allows multiple asynchronous calls in parallel
    await mkdirp(earnerFolder+'/'+group.name)
    
    const res2 = await rp({uri: 'https://backpack.openbadges.org/displayer/'+earnerId+'/group/'+group.groupId, method: 'GET'})
  // res2.badges contains the list of JSON stringified badges
//    console.debug('liste des badges res 2 ', res2);
    const badgesList = JSON.parse(res2).badges;
//    console.debug('liste des badges badgesList ', badgesList);
    var groupBadges = [];
    await Promise.all(badgesList.map(async (badge) => {
      const my_xapi_badge = new conv.xapi_badge(badge, earnerEmail)
      groupBadges.push(my_xapi_badge);
    }))
    console.debug('list of group badges to save in \'/\'+earnerId+\'/\'+group.name ', groupBadges);
    
    addData(groupBadges, 'io.cozy.xrecords'+earnerFolder+'/'+group.name)
    
  }))
  
//  log('info', 'saving data into Cozy', 'io.cozy.xrecords'+earnerFolder+'/'+group.name)
  /*addData (docs, doctype)
    - docs : array of objects corresponding to the data you want to save in the Cozy
    - doctype (string) : the doctype where you want to save data ()ex 'io.cozy.bills'
  */
//  return addData(documents, 'io.cozy.xrecords')

}

/*
TODO : 
- dans data/importedData tout marche bien.
  Mais c'est quoi les catégories: io.cozy.account
                                  io.cozy.xrecords/867/Mozilla Badges
                                  io.cozy.xrecords/867/TCC Conference 2012
                                  io.cozy.xrecords/867/Test Badges
  D'après la doc pour addData : "place where to save data in the Cozy" --> est-ce que j'ai bien fait le addData ? Voir ce que ça donne en dev
  
  Pourquoi rien dans le 'vrai' dossier créé data/867/Mozilla ...? Comment savoir si ça a marché ?
  
  + c'est quoi le _id qui s'ajoute (s ajoute?)


+ comment modifier le fichier permissions


- à tester en mode développement (voir avec Mouhamadou)

*/

