// Importing the jsdom module 
const jsdom = require("jsdom") ;
const fs = require('fs');
var convert = require('xml-js');
const { exit } = require("process");
// Creating a window with a document
const dom = new jsdom.JSDOM('<!DOCTYPE html><body></body>') ;
// Importing the jquery and providing it
// with the window
const $ = require("jquery")(dom.window);

const path_in_tei=process.env.path_in_tei 
const path_out_json=process.env.path_out_json
const path_out_tei=process.env.path_out_tei
const filename = process.env.file; 
const ext_xml=process.env.ext_xml
const ext_json=process.env.ext_json

var i_xmlId = 0 ; //number of actual not empty xml:id's
var i_xmlId_new = 0 ; //number of new xml:id's
var i_xmlId_last = 0 ; //number of last xml:id
var i_elements = 0 ; //number of all tei elements
var arr_xmlId = [] ; //array of all xml:id's
var arr_xmlId_unique = [] ; //array of unique xml:id's

var replaceFlag = false ;

function escapeChars(obj) {
   Object.keys(obj).forEach((key) => {      
      switch(key) {         
         case 'elements':            
            if(Array.isArray(obj[key])) {               
               obj[key].forEach((item, index, array) => {
                  if (typeof item === 'object') {                     
                     escapeChars(item) ;
                  }
               }) ;                  
            }
            break ;
            case 'attributes':            
            if (typeof obj[key] === 'object') {               
               let objAttr = obj[key] ;
               Object.keys(objAttr).forEach((keyAttr) => {
                  if (typeof objAttr[keyAttr] === 'string' && !objAttr[keyAttr].match(/(&amp;)/)) {
                     if (objAttr[keyAttr].includes('&')) {
                        objAttr[keyAttr] = objAttr[keyAttr].replace(/&/g, "&amp;") ;
                        replaceFlag = true ;
                     }                     
                  }
               }) ;
            }
            break ;         
         case 'text':            
            if (typeof obj['text'] === 'string' && !obj['text'].match(/(&amp;)/)) {
               if (obj['text'].includes('&')) {                  
                  obj['text'] = obj['text'].replace(/&/g, "&amp;") ;
                  replaceFlag = true ;
               }               
            }
            break ;                              
         default:            
            break ;
      } 
   }) ;
}

function checkElements(obj) {
   Object.keys(obj).forEach((key) => {      
      switch(key) {         
         case 'elements':            
            if(Array.isArray(obj[key])) {               
               obj[key].forEach((item, index, array) => {
                  if (typeof item === 'object') {                     
                     checkElements(item) ;
                  }
               }) ;                  
            }
            break ;
            case 'attributes':            
            if (typeof obj[key] === 'object') {               
               if ('xml:id' in obj[key]) {                  
                  //check if xml:id is empty
                  if (obj[key]["xml:id"] === '') {                     
                     //delete empty xml:id ;
                     delete obj[key]["xml:id"] ;
                     //console.log('xml:id is empty and deleted') ;
                     arr_xmlId.push(NaN) ;
                  } else {                     
                     //check if xml:id is valid
                     let index = obj[key]["xml:id"].lastIndexOf('_') + 1 ;          
                     if (obj[key]["xml:id"].includes(titleShort) && obj[key]["xml:id"].slice(index).match(/^\d+$/)) {                     
                        //console.log('xml:id is valid') ;                        
                        arr_xmlId.push(obj[key]["xml:id"].slice(index)) ;                        
                     } else {
                        //console.log('xml:id is not valid and deleted') ;
                        //console.log('xml:id = ', obj[key]["xml:id"]) ;
                        //delete not valid xml:id ;
                        delete obj[key]["xml:id"] ;
                        arr_xmlId.push(NaN) ;
                     }
                  }
               } else {
                  //console.log('xml:id not found') ;
                  arr_xmlId.push(NaN) ;
               }
            }
            break ;         
         case 'type':            
            switch (obj[key]) {
               case 'element':                  
                  //element without attributes
                  if (!('attributes' in obj)) {
                     //console.log('xml:id not found') ;
                     arr_xmlId.push(NaN) ;                     
                  }                  
                  break ;               
               default:
                  break ;                  
            }                      
            break ;         
         default:            
            break ;
      } 
   }) ;   
}

function isUnique() {
   let unique = true ;   
   const a = (array, item) => {
      return array.filter((b) => b == item).length 
   } ;
   //remove NaN from array
   arr_xmlId_unique = arr_xmlId.filter(x => !isNaN(x)) ;
   //check if xml:id is unique
   arr_xmlId_unique.forEach(function(item) {      
      a(arr_xmlId_unique, item) ;
      if (a(arr_xmlId_unique, item) > 1) {
         console.log('xml:id ', item, ' is not unique') ;
         unique = false ;
         //exit(1) ;
      }
   }) ;
   //if unique = true, all xml:id's are unique
   //if unique = false, at least one xml:id is not unique
   if (unique) {
      console.log('all xml:id\'s are unique')
   } ;
}

function countElements() {   
   //console.log('arr_xmlId = ', arr_xmlId);
   i_elements = arr_xmlId.length ;
   //number of actual valid xml:id's
   i_xmlId = arr_xmlId.filter(x => !isNaN(x)).length ;
   //number of last value of xml:id
   if (i_xmlId === 0) {
      i_xmlId_last = 0 ;
   } else {
      i_xmlId_last = Math.max(...arr_xmlId.filter(x => !isNaN(x))) ;
   }
}

function addXmlId(obj) {
   //start with xml:id = 0
   Object.keys(obj).forEach((key) => {      
      switch(key) {         
         case 'elements':
            if(Array.isArray(obj[key])) {               
               obj[key].forEach((item, index, array) => {
                  if (typeof item === 'object') {                     
                     addXmlId(item) ;
                  }
               }) ;                  
            }            
            break ;            
         case 'attributes':            
            if (typeof obj[key] === 'object') {               
               if ('xml:id' in obj[key]) {} 
               else {
                  let i = 0 ;
                     //xmlId new + 1 ; 
                     i_xmlId_new++ ;
                     i = i_xmlId_last + i_xmlId_new ;
                     i_xmlId_str = '' + titleShort + '_' + i ;                  
                  //add new xml:id
                  obj[key]["xml:id"] = i_xmlId_str ;
               }
            }
            break ;         
         case 'type':            
            switch (obj[key]) {
               case 'element':                  
                  if('attributes' in obj) {} 
                  else {
                     let i = 0 ;
                     //xmlId new + 1 ; 
                     i_xmlId_new++ ;
                     i = i_xmlId_last + i_xmlId_new ;
                     i_xmlId_str = '' + titleShort + '_' + i ;
                     //create attributes object                  
                     obj.attributes = {} ;                     
                     //add new xml:id
                     obj.attributes["xml:id"] = i_xmlId_str ;                     
                  }
                  break ;               
               default:                  
                  break ;                  
            }                      
            break ;         
         default:            
            break ;
      } 
   }) ;   
} ;

//read xml file
var filepath = path_in_tei + filename + ext_xml ;
console.log(filepath);
var xml = fs.readFileSync(filepath, 'utf8');
console.log('tei data read: ', xml.length, ' bytes') ;

//get titleShort
xmlDoc = $.parseXML( xml ),
$xml = $( xmlDoc ),
titleShort = $xml.find( "[type='short']" ).text();

//convert xml to js object
var xmlJs = convert.xml2js(xml, {compact: false, spaces: 2}) ;

//replace special characters
escapeChars(xmlJs) ;
if (replaceFlag) {
   console.log('replace & in attribute') ;
   replaceFlag = false ;
} ;
console.log('xml data escaped') ;

//check elements
checkElements(xmlJs) ;
//count NaN in array
let countNaN = arr_xmlId.filter(x => isNaN(x)).length ;
console.log('number of xmlIds not found, not valid or empty = ', countNaN) ;
console.log('xml data checked') ;

//check if xml:id's are unique
isUnique() ;
console.log('unique xml:ids checked') ;

//count elements
countElements() ;
console.log('xml data counted') ;
console.log('number of tei elements = ', i_elements) ;
console.log('number of xml:id = ', i_xmlId) ;
console.log('number of last xml:id = ', i_xmlId_last) ;

//add new xml:id
addXmlId(xmlJs) ;
console.log('new xml:id added') ;
console.log('number of new xml:id = ', i_xmlId_new) ;

//reset counters
var i_xmlId = 0 ; //number of actual not empty xml:id's
var i_xmlId_last = 0 ; //number of last xml:id
var i_elements = 0 ; //number of all tei elements
var arr_xmlId = [] ; //array of all xml:id's

//check elements
checkElements(xmlJs) ;
console.log('xml data checked') ;

//count elements
countElements() ;
console.log('xml data counted') ;
console.log('number of tei elements = ', i_elements) ;
console.log('number of xml:id = ', i_xmlId) ;
console.log('number of last xml:id = ', i_xmlId_last) ;

//write xml file
filepath = path_out_tei + filename + ext_xml ;
console.log(filepath);
xml = convert.js2xml(xmlJs, {compact: false, spaces: 2}) ;
fs.writeFileSync(filepath, xml ) ;
console.log('xml data written: ', xml.length, ' bytes')
