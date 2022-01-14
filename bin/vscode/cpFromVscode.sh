# build with gulp
cd /home/shaiby/projects/jb-react/bin/vscode
cp ../../../vscode/out-vscode-web/vs/loader.js .
cp ../../../vscode/h1.html ./vscode.html
cp ../../../vscode/out-vscode-web/vs/workbench/workbench.web.api.css .
cp ../../../vscode/out-vscode-web/vs/webPackagePaths.js .
cp ../../../vscode/out-vscode-web/vs/workbench/workbench.web.api.nls.js .
cp ../../../vscode/extensions-jsons.js .
cp ../../../vscode/jbart-extension.js .
cp ../../../vscode/out-vscode-web/vs/workbench/workbench.web.api.js .
cp ../../../vscode/out-vscode-web/vs/workbench/workbench.js .
cp ../../../vscode/out-vscode-web/vs/code/browser/workbench/workbench.js .
cp ../../../vscode/resources/server/manifest.json .
cp ../../../vscode/resources/server/favicon.ico .
cp ../../../vscode/out-vscode-web/vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.linux.js .


mkdir worker
cd worker
cp ../../../../vscode/out-vscode-web/vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html .
cp ../../../../vscode/out-vscode-web/vs/base/worker/workerMain.js .
cp ../../../../vscode/out-vscode-web/vs/workbench/services/extensions/worker/extensionHostWorker.js .
cp ../../../../vscode/out-vscode-web/vs/workbench/services/extensions/worker/extensionHostWorker.nls.js .

cd ..
mkdir media
cd media
cp -r ../../../../vscode/out-vscode-web/vs/base/browser/ui/codicons .
cp ../../../../vscode/src/vs/workbench/browser/parts/editor/media/* .

cd ..
mkdir extensions
cd extensions
cp -r ../../../../vscode/extensions/theme-seti .
cp -r ../../../../vscode/extensions/theme-defaults .
cp -r ../../../../vscode/extensions/themes .
cp -r ../../../../vscode/extensions/jbart-lsp .
cp -r ../../../../vscode/extensions/merge-conflict .
cp -r ../../../../vscode/extensions/npm .


# run in vscode
# yarn web
# http://localhost:8080/static/h1.html