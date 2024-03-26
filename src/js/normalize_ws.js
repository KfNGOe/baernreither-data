// Normalize whitespace in a string
const normalize = require('normalize-space') ;
const fs = require('fs');

const path = process.env.path ;
const file = process.env.file; 
const ext = process.env.ext ;
const filepath = path + file + ext ;

var xml = fs.readFileSync(filepath , 'utf8');
console.log('tei data read: ', xml.length, ' bytes') ;

var xml_ws = normalize(xml) ;

fs.writeFileSync(filepath, xml_ws ) ;
console.log('tei data written: ', xml_ws.length, ' bytes') ;