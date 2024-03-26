// Importing the jsdom module
const jsdom = require("jsdom") ;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

var convert = require('xml-js');
var stmtsListJs = { "statements": [] } ;
var stmtsList = [] ;
var stmts = [] ;
var stmt = {} ;
var prefInstance = "kfngoei:" ;
var prefOntology = "kfngoeo:" ;
var resourceIri = "" ;
var prefTei = "tei:" ;
var bnAttr = "_:attr" ;
var i_stmt = 1 ;
var N = 0 ;
var titleShort = "" ;

const path_in_json=process.env.path_in_json 
const path_out_json=process.env.path_out_json
const filename = process.env.file;
const ext_json=process.env.ext_json

/////////////////////////// Functions ///////////////////////////

function buildStmt( subj, pred, obj ) {
   stmt["subject"] = subj ;
   stmt["predicate"] = pred ;
   stmt["object"] = obj ;   
}

function buildStmts() {   
   stmts.push(stmt) ;
   stmt = {} ;
}

function addStmt( subj, pred, obj ){
   buildStmt( subj, pred, obj ) ;
   ////console.log( 'stmt = ', stmt ) ;
   buildStmts() ;
   //console.log( 'stmts = ', stmts ) ;
   i_stmt++ ;   
}

function addAttrStmt( iri, bn, attrName, attrValue ) {
   let i_attr = i_stmt ;                                    
   addStmt( iri, prefOntology + 'hasAttr', bn + i_attr ) ;   
   addStmt( bn + i_attr, prefOntology + 'attrName', attrName  ) ;   
   addStmt( bn + i_attr, prefOntology + 'attrValue', attrValue ) ;   
}

function buildAttrStmt( obj ) {
   let objAttr = obj.attributes ;
   let length = Object.keys(objAttr).length ;
   Object.keys(objAttr).forEach((key) => {
      //console.log('key = ', key, ', value = ', objAttr[key]) ;
      switch(key) {
         case 'xml:id':
            //console.log('xml:id = ', objAttr[key]) ;            
            addAttrStmt( resourceIri, bnAttr, key, objAttr[key] ) ;
            break ;
            case 'startTagNr':
            //console.log('startTagNr = ', objAttr[key]) ;
            break ;
         case 'endTagNr':
            //console.log('endTagNr = ', objAttr[key]) ;
            break ;         
         case 'level':
            //console.log('type = ', objAttr[key]) ;
            break ;                           
         default:
            //console.log('attrName = ', key) ;            
            //console.log('attrValue = ', objAttr[key]) ;            
            addAttrStmt( resourceIri, bnAttr, key, objAttr[key] ) ;
            break ;
      }
   }) ;
}

function buildStartTagStmts( iri, obj ) {
   //build tag type statement   
   addStmt( iri, 'a', prefOntology + 'StartTag' ) ;   
   //build element name statement   
   addStmt( iri, prefOntology + 'elementName', prefTei + obj['name'] ) ;
   //build element attributes statement   
   buildAttrStmt( obj ) ;
   //build element position statement   
   addStmt( iri, prefOntology + 'elementPos', titleShort + obj['attributes']['startTagNr'] ) ;
   //reset stmt counter   
   i_stmt = 1 ;
}

function buildEndTagStmts( iri, obj ) {
   //build tag type statement   
   addStmt( iri, 'a', prefOntology + 'EndTag' ) ;   
   //build element name statement   
   addStmt( iri, prefOntology + 'elementName', prefTei + obj['name'] ) ;
   //build element attributes statement   
   addAttrStmt( iri, bnAttr, 'xml:id', obj['attributes']['xml:id'] ) ; ;
   //build element position statement
   addStmt( iri, prefOntology + 'elementPos', titleShort + obj['attributes']['endTagNr'] ) ;
   //reset stmt counter   
   i_stmt = 1 ;
}

function buildStmtsList( index ) {
   stmtsList[index] = stmts ;
   stmts = [] ;
}

function buildElementStmt( obj ) {
   resourceIri = prefInstance + uuidv4() ;      
   //build start tag statements
   buildStartTagStmts( resourceIri, obj ) ;
   //build list of statements
   buildStmtsList( obj['attributes']['startTagNr'] - 1 ) ;
   
   //check single tag
   if ('endTagNr' in obj['attributes']) {      
      resourceIri = prefInstance + uuidv4() ;
      //build end tag statements
      buildEndTagStmts( resourceIri, obj ) ;
      //build list of statements
      buildStmtsList( obj['attributes']['endTagNr'] - 1 ) ;
      //console.log( 'stmtsList = ', stmtsList ) ;
   }   
}

function buildTextStmt( obj ) {
   resourceIri = prefInstance + uuidv4() ;
   //console.log( 'resourceIri = ', resourceIri ) ;

   //build Text type statement   
   addStmt( resourceIri, 'a', prefOntology + 'Text' ) ;   
   //build text content statement   
   addStmt( resourceIri, prefOntology + 'hasContent', obj['text'] ) ;   
   //build element position statement
   addStmt( resourceIri, prefOntology + 'elementPos', titleShort + obj['attributes']['startTagNr'] ) ;
   //reset stmt counter   
   i_stmt = 1 ;

   //build list of statements
   buildStmtsList( obj['attributes']['startTagNr'] - 1 ) ;
   //console.log( 'stmtsList = ', stmtsList ) ;
}

function buildCommentStmt( obj ) {
   resourceIri = prefInstance + uuidv4() ;
   //console.log( 'resourceIri = ', resourceIri ) ;

   //build Text type statement   
   addStmt( resourceIri, 'a', prefOntology + 'Comment' ) ;   
   //build text content statement   
   addStmt( resourceIri, prefOntology + 'hasContent', obj['comment'] ) ;   
   //build element position statement
   addStmt( resourceIri, prefOntology + 'elementPos', titleShort + obj['attributes']['startTagNr'] ) ;
   //reset stmt counter   
   i_stmt = 1 ;

   //build list of statements
   buildStmtsList( obj['attributes']['startTagNr'] - 1 ) ;
   //console.log( 'stmtsList = ', stmtsList ) ;
}

function buildRdfStmts( obj ) {
   switch( obj['type'] ) {
      case 'element':
         if (obj['name'] === 'TEI') {            
            //get titleShort            
            titleShort = obj['attributes']['xml:id'].slice(0, -1) ;
            console.log( 'titleShort = ', titleShort ) ;
         }         
         buildElementStmt(obj) ;
         break ;
      case 'text':
         //console.log( 'text = ', obj['text'] ) ;
         buildTextStmt(obj) ;
         break ;
      case 'comment':
         //console.log( 'comment = ', obj['comment'] ) ;
         buildCommentStmt(obj) ;
         break ;
      default:
         //console.log( 'no case' ) ;
         break ;
   }
}

function buildRdf(obj) {
   let length = Object.keys(obj).length ;
   //console.log('object length =', length) ;
   //console.log('first object key  =', Object.keys(obj)[0]) ;   
   if(Object.keys(obj)[0] !== 'declaration' && obj['type'] !== 'instruction') {   
      buildRdfStmts(obj) ;
   }
   Object.keys(obj).forEach((key) => {
      //console.log('key = ', key, ', value = ', obj[key]) ;       
      switch(key) {         
         case 'elements':
            if(Array.isArray(obj[key])) {               
               //level + 1
               obj[key].forEach((item, index, array) => {
                  if (typeof item === 'object') {                     
                     buildRdf(item) ;
                  }
               }) ;
               //level - 1
            }            
            break ;         
         default:
            ////console.log('no case') ;
            break ;
      } 
   }) ;
      
} ;

//////////////////////////////////////////////////////

//read json file
var filepath = path_in_json + filename + ext_json ;
console.log(filepath);
var json = fs.readFileSync(filepath, 'utf8');
console.log('json data read: ', json.length, ' bytes')

var jsonJs = JSON.parse(json) ;
//console.log('jsonJs = ', jsonJs) ;

//get N
buildRdf(jsonJs) ;
//build statements list as js object
stmtsListJs['statements'] = stmtsList ;

//write json file
filepath = path_out_json + filename + ext_json ;
console.log(filepath);
var stmtsListJsString = JSON.stringify(stmtsListJs);
fs.writeFileSync(filepath, stmtsListJsString ) ;
console.log('json data written: ', stmtsListJsString.length  , ' bytes')