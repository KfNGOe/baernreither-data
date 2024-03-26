const fs = require('fs');
const LF = "\n" ;
const TAB = "\t" ;
const COMMA = ", " ;
const DOT = " ." ;
const SEMICOLON = " ;" ;
const QUOT = '"' ;
const SPACE = " " ;
const SQBRACKET_OPEN = "[" ;
const SQBRACKET_CLOSE = "]" ;
const ANGLEBRACKET_OPEN = "<" ;
const ANGLEBRACKET_CLOSE = ">" ;
const BN = "_:" ;
const prefix =   "@prefix kfngoeo: <https://github.com/KfNGOe/kfngoeo#> ." + LF 
               + "@prefix kfngoei: <https://github.com/KfNGOe/kfngoei/> ." + LF
               + "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> ." + LF
               + "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ." + LF
               + "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ." + LF
               + "@prefix owl: <http://www.w3.org/2002/07/owl#> ." + LF
               + "@prefix dc: <http://purl.org/dc/elements/1.1/> ." + LF
               + "@prefix dcterms: <http://purl.org/dc/terms/> ." + LF
               + "@prefix foaf: <http://xmlns.com/foaf/0.1/> ." + LF
               + "@prefix skos: <http://www.w3.org/2004/02/skos/core#> ." + LF
               + "@prefix schema: <http://schema.org/> ." + LF
               + "@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> ." + LF
               + "@prefix geonames: <http://www.geonames.org/ontology#> ." + LF             
               + "@prefix gndo: <http://d-nb.info/standards/elementset/gnd#> ." + LF
               + "@prefix gnd: <http://d-nb.info/standards/elementset/gnd#> ." + LF
               + "@prefix tei: <http://www.tei-c.org/ns/1.0/> ." + LF
              ;

const path_in_json=process.env.path_in_json ;
const path_out_ttl=process.env.path_out_ttl ;
const filename = process.env.file ;
const ext_json=process.env.ext_json ;
const ext_ttl=process.env.ext_ttl ;

var s_ttl, p_ttl, o_ttl = "" ;
var ttl_template = s_ttl + p_ttl + o_ttl  ;
var ttl = "" ;

ttl = ttl + prefix + LF ;

//convert special characters to html encoding
function convertChar2Html(str) {
   return str.replace(/'/g,"&apos;")       
       .replace(/"/g, "&quot;")
   ;
}

function getTTL(item_obj) {
   if(item_obj.object === "kfngoeo:StartTag" || item_obj.object === "kfngoeo:EndTag" || item_obj.object === "kfngoeo:Text" || item_obj.object === "kfngoeo:Comment") {
         if (item_obj.predicate === "a") {
         ttl = ttl + item_obj.subject + LF ;
         ttl = ttl + TAB + item_obj.predicate + SPACE + item_obj.object + SEMICOLON + LF ;         
      }  
   }
   if(item_obj.predicate === "kfngoeo:elementName") {      
      ttl = ttl + TAB + item_obj.predicate + SPACE + item_obj.object + SEMICOLON + LF ;      
   }
   if (item_obj.predicate === "kfngoeo:hasContent") {
      item_obj.object = convertChar2Html(item_obj.object) ;
      ttl = ttl + TAB + item_obj.predicate + SPACE + QUOT + item_obj.object + QUOT + '^^xsd:string' + SEMICOLON + LF ;
   }
   if(item_obj.predicate === "kfngoeo:hasAttr" && item_obj.object.includes(BN)) {
      ttl = ttl + TAB + item_obj.predicate + SPACE + SQBRACKET_OPEN + LF ;
   }
   if(item_obj.subject.includes(BN) && item_obj.predicate === "kfngoeo:attrName") {
      ttl = ttl + TAB + TAB + item_obj.predicate + SPACE + QUOT + item_obj.object + QUOT + '^^xsd:string' + SEMICOLON + LF ;
   }
   if(item_obj.subject.includes(BN) && item_obj.predicate === "kfngoeo:attrValue") {
      if(item_obj.object.includes("http")) {
         ttl = ttl + TAB + TAB + item_obj.predicate + SPACE + ANGLEBRACKET_OPEN + item_obj.object + ANGLEBRACKET_CLOSE + SEMICOLON + LF ;
      }
      else {
         ttl = ttl + TAB + TAB + item_obj.predicate + SPACE + QUOT + item_obj.object + QUOT + '^^xsd:string' + SEMICOLON + LF ;
      }
      ttl = ttl + TAB + SQBRACKET_CLOSE + SEMICOLON + LF ;
   }
   if(item_obj.predicate === "kfngoeo:elementPos") {
      ttl = ttl + TAB + item_obj.predicate + SPACE + QUOT + item_obj.object + QUOT + '^^xsd:string' + SEMICOLON + LF ;
      ttl = ttl + DOT + LF + LF ;
      //ttl = convertChar2Html(ttl) ;
   }
   //console.log('ttl = ', ttl) ;        
}

//read json file
var filepath = path_in_json + filename + ext_json ;
console.log(filepath);
var json = fs.readFileSync(filepath, 'utf8');
console.log('json data read: ', json.length, ' bytes')

var jsonJs = JSON.parse(json) ;

jsonJs.statements.forEach((item, index, array) => {
   //console.log('item = ', item, ', index = ', index) ;
   item.forEach((item_obj, index_obj, array) => {
      //console.log('item obj = ', item_obj, ', index obj = ', index_obj) ;
      getTTL(item_obj) ;
   } ) ;
} ) ;

//write ttl file
filepath = path_out_ttl + filename + ext_ttl ;
//console.log('data: ', ttl);
fs.writeFileSync(filepath, ttl ) ;
console.log('ttl data written: ', ttl.length  , ' bytes')
