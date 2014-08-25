#!/bin/sh

ANALYTICS_CODE="UA-6147007-1"
ANALYTICS_SCRIPT="<script>var _gaq = _gaq || [];_gaq.push(['_setAccount', '${ANALYTICS_CODE}']);_gaq.push(['_trackPageview']);(function() {var ga = document.createElement('script'); ga.type = 'text\/javascript'; ga.async = true;ga.src = ('https:' == document.location.protocol ? 'https:\/\/ssl' : 'http:\/\/www') + '.google-analytics.com\/ga.js';var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);})();<\/script>"

GAMEJOLT_RELEASE="release-gamejolt"
COCOONJS_RELEASE="release-cocoonjs"
WEBSITE_RELEASE="release-website"

echo "Compiling 'game.js'..."
rm -rf release
mkdir release
ant -q -buildfile compile.xml >&-

if [ "$1" == "" ] || [ "$1" == "gamejolt" ]; then

echo "Building '${GAMEJOLT_RELEASE}.zip'..."
rm -rf $GAMEJOLT_RELEASE
mkdir $GAMEJOLT_RELEASE
cd $GAMEJOLT_RELEASE
cp ../game.js ./
cp ../cocos2d-singlefile.js ./cocos2d.js
cp ../index.html ./
cp -R ../res ./
zip -r -X -q $GAMEJOLT_RELEASE *
mv $GAMEJOLT_RELEASE.zip ../release/
cd ..
rm -rf $GAMEJOLT_RELEASE

fi

if [ "$1" == "" ] || [ "$1" == "cocoonjs" ]; then

echo "Building '${COCOONJS_RELEASE}.zip'..."
rm -rf $COCOONJS_RELEASE
mkdir $COCOONJS_RELEASE
cd $COCOONJS_RELEASE
cp ../game.js ./
cp ../cocos2d-singlefile.js ./cocos2d.js
cp ../index-cocoonjs.html ./index.html
cp ../src/libs/cocoon.min.js ./
cp -R ../res ./
rm -rf res/icon
zip -r -X -q $COCOONJS_RELEASE *
mv $COCOONJS_RELEASE.zip ../release/
cd ..
rm -rf $COCOONJS_RELEASE

fi

if [ "$1" == "" ] || [ "$1" == "website" ]; then

echo "Building '${WEBSITE_RELEASE}.zip'..."
rm -rf $WEBSITE_RELEASE
mkdir $WEBSITE_RELEASE
cd $WEBSITE_RELEASE
cp ../game.js ./
cp ../cocos2d-singlefile.js ./cocos2d.js
cp ../index.html ./index-toedit.html
cp ../index-1x.html ./index-1x-toedit.html
cp ../index-2x.html ./index-2x-toedit.html
cp ../index-3x.html ./index-3x-toedit.html
cp -R ../res ./
sed "s/<\/body>/${ANALYTICS_SCRIPT}<\/body>/" index-toedit.html > index.html
sed "s/<\/body>/${ANALYTICS_SCRIPT}<\/body>/" index-1x-toedit.html > index-1x.html
sed "s/<\/body>/${ANALYTICS_SCRIPT}<\/body>/" index-2x-toedit.html > index-2x.html
sed "s/<\/body>/${ANALYTICS_SCRIPT}<\/body>/" index-3x-toedit.html > index-3x.html
rm -rf *-toedit.html
zip -r -X -q $WEBSITE_RELEASE *
mv $WEBSITE_RELEASE.zip ../release/
cd ..
rm -rf $WEBSITE_RELEASE

fi

rm -rf game.js

echo "Done!"