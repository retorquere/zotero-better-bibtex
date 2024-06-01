Using for remote code execution:

* Install VScode
* Install VSCode Code Runner (https://github.com/formulahendry/vscode-code-runner/) in VSCode
* Get debug-bridge from https://github.com/retorquere/zotero-better-bibtex/releases/tag/debug-bridge and install in Zotero
* In the VSCode Code Runner options, create a customCommand `cd $dir && curl -s -H "Authorization: Bearer <token>" -H "Content-Type: application/javascript" -X POST --data-binary @$fileName http://127.0.0.1:23119/debug-bridge/execute`

Go into the Advanced section of the Zotero
settings and open the Config Editor; create a new string value
with the name `extensions.zotero.debug-bridge.token`,
enter a token there matching the one in the code-runner URL.

Now you can edit your javascript and run with and run with ctrl-alt-K.
