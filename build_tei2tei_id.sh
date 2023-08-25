echo "build tei to ttl"

PATH_TEI='./data/tei/'
PATH_TEI_XMLID='./data/tei_xmlId/'
PATH_TTL='./data/ttl/text/'
PATH_JSON_XMLID='./data/json_xmlId/'
PATH_JSON_RDF='./data/json_rdf/'
PATH_JSON_XMLJS='./data/json_xmlJs/'

FILENAME=$name
#FILENAME='Bae_TB_8'
#FILENAME='Bae_TB_7'
#FILENAME='Bae_MF_6-2'
#FILENAME='Bae_MF_6-1'

EXTENSION_XML='.xml'
EXTENSION_TTL='.ttl'
EXTENSION_JSON='.json'

echo "${FILENAME}"

echo "normalize whitespace"
path=$PATH_TEI file=$FILENAME ext=$EXTENSION_XML node src/js/normalize_ws.js

echo "build xml ID"
path_in_tei=$PATH_TEI path_out_tei=$PATH_TEI_XMLID file=$FILENAME ext_xml=$EXTENSION_XML node src/js/build_xmlId.js

