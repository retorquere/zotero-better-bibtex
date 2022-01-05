#!/bin/bash

npm run rebuild
./start.py
/Applications/Zotero.app/Contents/MacOS/zotero -P BBTZ5TEST -datadir profile -purgecaches -jsconsole -ZoteroDebugText > ~/.BBTZ5TEST.log &
