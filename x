Dit gedrag ontstaat op het moment dat ik naar een locatie navigeer en vervolgens terugkeer met de breadcrumbs

sp-service.js:48   GET https://som.org.om.local/sites/MulderT/SBeheer/_api/web/GetFolderByServerRelativeUrl('/sites')/Folders 400 (Bad Request)
fetchJSON @ sp-service.js:48
getFilesAndFolders @ sp-service.js:100
loadContents @ app.js:188
onNavigate @ app.js:469
onClick @ app.js:87
kj @ react-dom.production.min.js:223
jj @ react-dom.production.min.js:34
mj @ react-dom.production.min.js:34
gh @ react-dom.production.min.js:62
Xg @ react-dom.production.min.js:63
(anonymous) @ react-dom.production.min.js:72
Tf @ react-dom.production.min.js:189
wg @ react-dom.production.min.js:32
Ce @ react-dom.production.min.js:65
Be @ react-dom.production.min.js:47
zj @ react-dom.production.min.js:46
sp-service.js:61  SP API Error: Error: Bad Request
    at Object.fetchJSON (sp-service.js:55:41)
    at async Promise.all (index 1)
    at async Object.getFilesAndFolders (sp-service.js:98:42)
    at async loadContents (app.js:188:28)
fetchJSON @ sp-service.js:61
await in fetchJSON
getFilesAndFolders @ sp-service.js:100
loadContents @ app.js:188
onNavigate @ app.js:469
onClick @ app.js:87
kj @ react-dom.production.min.js:223
jj @ react-dom.production.min.js:34
mj @ react-dom.production.min.js:34
gh @ react-dom.production.min.js:62
Xg @ react-dom.production.min.js:63
(anonymous) @ react-dom.production.min.js:72
Tf @ react-dom.production.min.js:189
wg @ react-dom.production.min.js:32
Ce @ react-dom.production.min.js:65
Be @ react-dom.production.min.js:47
zj @ react-dom.production.min.js:46
sp-service.js:48   GET https://som.org.om.local/sites/MulderT/SBeheer/_api/web/GetFolderByServerRelativeUrl('/sites')/Files?$expand=ListItemAllFields,Author,CheckedOutByUser 400 (Bad Request)
fetchJSON @ sp-service.js:48
getFilesAndFolders @ sp-service.js:99
loadContents @ app.js:188
onNavigate @ app.js:469
onClick @ app.js:87
kj @ react-dom.production.min.js:223
jj @ react-dom.production.min.js:34
mj @ react-dom.production.min.js:34
gh @ react-dom.production.min.js:62
Xg @ react-dom.production.min.js:63
(anonymous) @ react-dom.production.min.js:72
Tf @ react-dom.production.min.js:189
wg @ react-dom.production.min.js:32
Ce @ react-dom.production.min.js:65
Be @ react-dom.production.min.js:47
zj @ react-dom.production.min.js:46
sp-service.js:61  SP API Error: Error: Bad Request
    at Object.fetchJSON (sp-service.js:55:41)
    at async Promise.all (index 0)
fetchJSON @ sp-service.js:61
await in fetchJSON
getFilesAndFolders @ sp-service.js:99
loadContents @ app.js:188
onNavigate @ app.js:469
onClick @ app.js:87
kj @ react-dom.production.min.js:223
jj @ react-dom.production.min.js:34
mj @ react-dom.production.min.js:34
gh @ react-dom.production.min.js:62
Xg @ react-dom.production.min.js:63
(anonymous) @ react-dom.production.min.js:72
Tf @ react-dom.production.min.js:189
wg @ react-dom.production.min.js:32
Ce @ react-dom.production.min.js:65
Be @ react-dom.production.min.js:47
zj @ react-dom.production.min.js:46
