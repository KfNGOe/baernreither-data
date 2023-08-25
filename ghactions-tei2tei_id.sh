#!/bin/bash

#this script checks the changes of the last commit
#Only works in github actions env!

echo starting tei to tei with xmlid transformation
 
inputDir="data/tei/"
outputDir="data/tei_xmlId/"
#changes="data/tei/Bae_TB_8.xml"

filesChanged=false;

if ! test -f "$inputDir"
then
    echo "creating input dir"
    mkdir -p "$inputDir"
fi

if [ -z "$changes" ] 
then
    echo "\$changes is empty"
else
    echo "\$changes is NOT empty"      
    
    for changed_file in $changes; do
        echo "Found changed file: ${changed_file}." #changed file is the path to the file including the filename
        if [[ "$changed_file" == *"$inputDir"* ]]
        then
            #check if file is xml
            if [[ "$changed_file" == *".xml" ]]
            then
                echo "Found changed tei: ${changed_file}"
                filesChanged=true;
                name=$(basename "$changed_file" .xml)
                echo "changed tei filename: ${name}"  #name of the file without extension
            fi

            if test -f "$outputDir$name.xml"
            then
                echo "removing tei file in output dir"
                rm "$outputDir$name.xml"
            fi

            if ! test -f "$outputDir"
            then
                echo "creating output dir"
                mkdir -p "$outputDir"
            fi            

            if test -f "$changed_file"
            then
                echo "tei was changed/added. Starting transform"
                echo "Starting tei to tei with xmlid transformation"
                export name
                ./build_tei2tei_id.sh
            fi

            if test -f "$inputDir$name.xml"
            then
                echo "removing tei file in input dir"
                rm "$inputDir$name.xml"
            fi
        fi
    done          
fi
