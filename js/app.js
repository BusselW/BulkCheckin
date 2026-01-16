/**
 * MODULE: APPLICATION LOGIC
 * Path: /js/app.js
 * Description: Main React Application.
 * dependencies: React, ReactDOM, SPService
 * Updated: Translated all visible text to Dutch.
 */

(function(global) {

    if (!global.React || !global.ReactDOM || !global.SPService) {
        console.error("Critical dependencies are missing.");
        return;
    }

    const h = React.createElement;
    const { useState, useEffect } = React;

    // --- COMPONENTS ---

    // 0. Help Icon Component
    const HelpIcon = ({ text }) => {
        return h('span', { className: 'tooltip-container' },
            h('img', { 
                src: 'images/help.svg', 
                className: 'help-icon', 
                alt: 'Help' 
            }),
            h('span', { className: 'tooltip-text' }, text)
        );
    };

    // 0.1 Intro/Welcome Card
    const IntroCard = () => {
        return h('div', { className: 'card', style: { borderLeft: '5px solid #10b981', marginBottom: '24px' } },
            h('h3', { className: 'card-title', style: { display: 'flex', alignItems: 'center', gap: '8px' } }, 
                "👋 Welkom bij de Bulk Check-In Tool"
            ),
            h('p', { style: { marginBottom: '16px', color: '#475569' } }, 
                "Deze tool helpt u om grote hoeveelheden documenten in één keer in te checken. Volg deze stappen:"
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' } },
                h('div', { className: 'step-item' }, 
                    h('strong', { style: { color: '#0f172a' } }, "1. Kies een Site"), 
                    h('p', { style: { fontSize: '13px', margin: '4px 0 0 0', color: '#64748b' } }, "Navigeer naar de site waar de documenten staan.")
                ),
                h('div', { className: 'step-item' }, 
                    h('strong', { style: { color: '#0f172a' } }, "2. Selecteer Bibliotheek"), 
                    h('p', { style: { fontSize: '13px', margin: '4px 0 0 0', color: '#64748b' } }, "Kies de documentbibliotheek die u wilt beheren.")
                ),
                h('div', { className: 'step-item' }, 
                    h('strong', { style: { color: '#0f172a' } }, "3. Bulk Acties"), 
                    h('p', { style: { fontSize: '13px', margin: '4px 0 0 0', color: '#64748b' } }, "Gebruik de knoppen om titels te corrigeren en bestanden in te checken.")
                )
            )
        );
    };

    // 1. Modal Component
    const ConfirmModal = ({ config, onClose }) => {
        if (!config) return null;
        return h('div', { className: 'modal-overlay' },
            h('div', { className: 'modal-box' },
                h('h3', { className: 'modal-title' }, config.title),
                h('div', { className: 'modal-text' }, 
                    config.message.split('\n').map((line, idx) => 
                        h('p', { key: idx, style: { minHeight: line ? 'auto' : '10px' } }, line || ' ')
                    )
                ),
                h('div', { className: 'modal-actions' },
                    h('button', { className: 'btn btn-secondary', onClick: onClose }, 'Annuleren'),
                    h('button', { className: 'btn btn-primary', onClick: () => { config.onConfirm(); onClose(); } }, 'Bevestigen')
                )
            )
        );
    };

    // 2. Progress Bar Component
    const ProgressBar = ({ current, total, action, item }) => {
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        
        return h('div', { className: 'progress-box' },
            h('div', { className: 'progress-info' },
                h('span', null, action),
                h('span', null, `${current} / ${total} (${percentage}%)`)
            ),
            h('div', { className: 'progress-track' },
                h('div', { 
                    className: 'progress-fill', 
                    style: { width: `${percentage}%` } 
                })
            ),
            h('div', { className: 'progress-details' }, 
                item ? `Verwerken: ${item}` : 'Initialiseren...'
            )
        );
    };

    // 3. Breadcrumb Component
    const Breadcrumb = ({ path, onNavigate }) => {
        if (!path) return null;
        const parts = path.split('/').filter(p => p);
        return h('div', { className: 'breadcrumb' },
            h('span', { className: 'breadcrumb-label' }, 'Pad:'),
            parts.map((part, idx) => {
                const isLast = idx === parts.length - 1;
                const partPath = "/" + parts.slice(0, idx + 1).join("/");
                return h('div', { key: idx, className: 'breadcrumb-part' },
                    isLast 
                        ? h('span', { className: 'font-bold' }, part)
                        : h('span', { 
                            className: 'breadcrumb-link', 
                            onClick: () => onNavigate(partPath),
                            title: `Ga naar ${part}`
                          }, part),
                    !isLast && h('span', { className: 'separator' }, '/')
                );
            })
        );
    };

    // File Row Component
    const FileRow = ({ file, onCheckIn, processing, showPath }) => {
        const isCheckedOut = file.CheckOutType !== 2;
        const isDraft = file.MajorVersion === 0 && file.MinorVersion === 1;
        
        let rowClass = "file-row";
        if (isCheckedOut && isDraft) rowClass += " row-warning";

        return h('tr', { className: rowClass },
            h('td', { className: 'cell-name' }, 
                h('div', { className: 'file-name' }, file.Name),
                showPath && h('div', { style: { fontSize: '11px', color: '#9ca3af' } }, file.ServerRelativeUrl),
                h('div', { className: 'file-version' }, `v${file.MajorVersion}.${file.MinorVersion}`)
            ),
            h('td', { className: 'cell-status' }, 
                isCheckedOut 
                ? h('span', { className: 'badge badge-red' }, 'Uitgecheckt') 
                : h('span', { className: 'badge badge-green' }, 'Ingecheckt')
            ),
            h('td', { className: 'cell-user' }, 
                file.CheckedOutByUser ? file.CheckedOutByUser.Title : '-'
            ),
            h('td', { className: 'cell-action' },
                isCheckedOut && h('button', {
                    className: `btn btn-action ${processing ? 'btn-disabled' : 'btn-primary'}`,
                    onClick: () => onCheckIn(file),
                    disabled: processing
                }, processing ? 'Opslaan...' : 'Inchecken')
            )
        );
    };

    const Explorer = () => {
        const initialUrl = global.AppConfig ? global.AppConfig.ScrBaseUrl : "/";
        
        const [viewMode, setViewMode] = useState("sites");
        const [sites, setSites] = useState([]);
        const [libs, setLibs] = useState([]);
        const [contents, setContents] = useState({ files: [], folders: [] });
        
        const [currentWeb, setCurrentWeb] = useState(initialUrl);
        const [currentPath, setCurrentPath] = useState(null); 
        const [isRecursive, setIsRecursive] = useState(false);
        
        const [loading, setLoading] = useState(false);
        const [msg, setMsg] = useState(null);
        
        const [progress, setProgress] = useState(null);
        const [modalConfig, setModalConfig] = useState(null);

        useEffect(() => {
            loadSubsites(currentWeb);
        }, []);

        const loadSubsites = async (url) => {
            setLoading(true);
            setMsg("Subsites laden...");
            try {
                const data = await SPService.getSubsites(url);
                setSites(data.d.results);
                setCurrentWeb(url);
                setViewMode("sites");
            } catch (e) { setMsg("Fout bij laden sites: " + e.message); }
            setLoading(false);
        };

        const loadLibraries = async (webUrl) => {
            setLoading(true);
            setMsg("Bibliotheken laden...");
            try {
                const data = await SPService.getLibraries(webUrl);
                setLibs(data.d.results);
                setCurrentWeb(webUrl);
                setViewMode("libs");
            } catch (e) { setMsg("Fout bij laden bibliotheken: " + e.message); }
            setLoading(false);
        };

        const loadContents = async (path, webUrl, recursive = isRecursive) => {
            setLoading(true);
            setIsRecursive(recursive);
            setMsg(recursive ? "Mappen recursief scannen..." : "Bestanden laden...");
            
            try {
                let data;
                if (recursive) {
                    const files = await SPService.getFilesRecursive(path, webUrl, (count, queue) => {
                        setMsg(`Scannen... ${count} bestanden gevonden. (Wachtrij: ${queue})`);
                    });
                    data = { files: files, folders: [] }; 
                    setMsg(`Recursieve scan voltooid. ${files.length} bestanden gevonden.`);
                } else {
                    data = await SPService.getFilesAndFolders(path, webUrl);
                    setMsg(null);
                }

                setContents(data);
                setCurrentPath(path);
                setCurrentWeb(webUrl);
                setViewMode("files");
            } catch (e) { setMsg("Fout bij laden inhoud: " + e.message); }
            setLoading(false);
        };

        // --- ACTIONS ---

        const handleCheckIn = async (file) => {
            setMsg(`Inchecken van ${file.Name}...`);
            try {
                await SPService.checkInFile(currentWeb, file.ServerRelativeUrl);
                
                // Optimistically update UI to avoid full reload
                setContents(prev => ({
                    ...prev,
                    files: prev.files.map(f => {
                        if (f.ServerRelativeUrl === file.ServerRelativeUrl) {
                            return { ...f, CheckOutType: 2, CheckedOutByUser: { Title: "" } };
                        }
                        return f;
                    })
                }));
                
                setMsg(`Succes: ${file.Name} ingecheckt.`);
            } catch (e) { setMsg(`Fout bij inchecken ${file.Name}: ${e.message}`); }
        };

        // Helper for concurrent batch processing
        const runBatchParams = async (items, label, fn) => {
             setLoading(true);
             setProgress({ current: 0, total: items.length, action: label, item: "Starten..." });
             
             let successCount = 0;
             let index = 0;
             let active = 0;
             const MAX_CONCURRENCY = 3;

             await new Promise(resolve => {
                 const next = () => {
                     // Finished
                     if (index === items.length && active === 0) {
                         resolve();
                         return;
                     }
                     
                     while (index < items.length && active < MAX_CONCURRENCY) {
                         const file = items[index++];
                         active++;
                         
                         setProgress(prev => ({ ...prev, item: file.Name }));
                         
                         fn(file)
                             .then(() => successCount++)
                             .catch(e => console.error(e))
                             .finally(() => {
                                 active--;
                                 setProgress(prev => ({ ...prev, current: prev.current + 1 }));
                                 next();
                             });
                     }
                 };
                 next();
             });
             
             setProgress(null);
             setLoading(false);
             return successCount;
        };

        const executeSyncTitles = async (toUpdate) => {
            const count = await runBatchParams(toUpdate, "Titels Synchroniseren", (file) => 
                SPService.updateFileTitle(currentWeb, file, file.Name)
            );
            setMsg(`Stap 1 Voltooid. Titels bijgewerkt voor ${count} bestanden.`);
            loadContents(currentPath, currentWeb, isRecursive);
        };

        const executeBulkCheckIn = async (toCheckIn) => {
            const count = await runBatchParams(toCheckIn, "Bulk Inchecken", (file) => 
                SPService.checkInFile(currentWeb, file.ServerRelativeUrl)
            );
            setMsg(`Stap 2 Voltooid. ${count} bestanden ingecheckt.`);
            loadContents(currentPath, currentWeb, isRecursive);
        };

        // --- PROMPTS ---

        const promptSyncTitles = () => {
            const toUpdate = contents.files.filter(f => f.CheckOutType !== 2);
            if (toUpdate.length === 0) return;
            setModalConfig({
                title: "Stap 1: Titels Synchroniseren",
                message: `Dit kopieert de bestandsnaam naar het 'Titel' veld voor ${toUpdate.length} uitgecheckte bestanden.\n\nDoorgaan?`,
                onConfirm: () => executeSyncTitles(toUpdate)
            });
        };

        const promptBulkCheckIn = () => {
            const toCheckIn = contents.files.filter(f => f.CheckOutType !== 2);
            if (toCheckIn.length === 0) return;
            setModalConfig({
                title: "Stap 2: Bulk Inchecken",
                message: `Weet u zeker dat u ${toCheckIn.length} bestanden wilt inchecken?`,
                onConfirm: () => executeBulkCheckIn(toCheckIn)
            });
        };

        // --- RENDER ---

        const renderShortcuts = () => h('div', { className: 'card', style: { marginBottom: '20px' } },
            h('h3', { className: 'card-title' }, "Snelle Navigatie"),
            h('p', { className: 'card-subtitle', style: { marginBottom: '12px' } }, "Direct naar veelgebruikte mappen:"),
            h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
                h('button', {
                    className: 'btn btn-secondary',
                    onClick: () => loadContents('/sites/MulderT/Kennis/Algemeen/5. Bijzondere pleeglocaties', '/sites/MulderT/Kennis', false)
                }, '📂 Bijzondere pleeglocaties'),
                h('button', {
                    className: 'btn btn-secondary',
                    onClick: () => loadContents('/sites/MulderT/Kennis/Verkeersborden/5. Schouwrapporten', '/sites/MulderT/Kennis', false)
                }, '📂 Schouwrapporten')
            )
        );

        const renderSites = () => h('div', { className: 'section-container' },
            h(IntroCard),
            renderShortcuts(),
            h('div', { className: 'card card-featured' },
                h('div', null,
                    h('h2', { className: 'card-title' }, 'Huidige Site Inhoud'),
                    h('p', { className: 'card-subtitle' }, `Bekijk alle documentbibliotheken die direct onder deze site (${currentWeb}) vallen.`)
                ),
                h('button', { className: 'btn btn-indigo', onClick: () => loadLibraries(currentWeb) }, 'Bekijk Bibliotheken Hier')
            ),
            h('div', null,
                h('div', { style: { display: 'flex', alignItems: 'center', marginBottom: '16px' } },
                    h('h2', { className: 'section-title', style: { margin: 0, fontSize: '20px' } }, 'Beschikbare Subsites'),
                    h(HelpIcon, { text: 'Klik op een subsite om daarin verder te zoeken.' })
                ),
                sites.length === 0 
                    ? h('div', { className: 'empty-state' }, 'Geen subsites gevonden.')
                    : h('div', { className: 'grid-sites' },
                        sites.map(site => h('div', { 
                            key: site.ServerRelativeUrl, 
                            className: 'card site-card',
                            style: { padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '120px' }
                        }, 
                            // TOP 80% - Load Libraries
                            h('div', { 
                                style: { flex: '1', padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
                                onClick: () => loadLibraries(site.ServerRelativeUrl)
                            },
                                h('h3', { className: 'card-title', style: { marginBottom: '4px' } }, site.Title), 
                                h('p', { className: 'card-subtitle' }, site.ServerRelativeUrl)
                            ),
                            
                            // BOTTOM 20% - Load Subsites
                            h('div', { 
                                className: 'site-card-footer',
                                style: { 
                                    padding: '10px', 
                                    background: '#f8fafc', 
                                    borderTop: '1px solid #e2e8f0', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    transition: 'background 0.2s'
                                },
                                onClick: (e) => { e.stopPropagation(); loadSubsites(site.ServerRelativeUrl); } 
                            }, '📂 Bekijk Subsites')
                        ))
                    )
            )
        );

        const renderLibs = () => h('div', { className: 'grid-container' },
            h('button', { className: 'btn-back', onClick: () => loadSubsites(currentWeb) }, '← Terug naar Subsites'),
            h('div', { className: 'grid-libs' },
                libs.map(lib => h('div', { 
                    key: lib.RootFolder.ServerRelativeUrl, 
                    className: 'card lib-card', 
                    onClick: () => loadContents(lib.RootFolder.ServerRelativeUrl, currentWeb, false) 
                }, h('h3', { className: 'card-title' }, lib.Title), h('p', { className: 'card-subtitle' }, lib.RootFolder.ServerRelativeUrl)))
            )
        );

        const renderFiles = () => {
            const checkedOutCount = contents.files.filter(f => f.CheckOutType !== 2).length;
            
            return h('div', null,
                h('div', { className: 'toolbar' },
                    h('div', { style: { display: 'flex', gap: '16px', alignItems: 'center' } },
                        h('button', { 
                            className: 'btn-back',
                            onClick: () => loadLibraries(currentWeb)
                        }, '← Terug naar Bibliotheken'),
                        
                        h('label', { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', userSelect: 'none' } },
                            h('input', { 
                                type: 'checkbox', 
                                checked: isRecursive,
                                onChange: (e) => loadContents(currentPath, currentWeb, e.target.checked),
                                style: { marginRight: '6px' }
                            }),
                            h('span', { className: isRecursive ? 'font-bold text-blue-600' : '' }, 'Inclusief submappen'),
                            h(HelpIcon, { text: 'Indien aangevinkt, doorzoekt de tool ook alle onderliggende mappen. Dit duurt langer.' })
                        )
                    ),
                    
                    h('div', { style: { display: 'flex', gap: '10px' } },
                        checkedOutCount > 0 && h('div', { style: { display: 'flex', alignItems: 'center' } },
                             h('button', {
                                className: 'btn btn-indigo',
                                onClick: promptSyncTitles,
                                disabled: loading
                            }, `Stap 1: Titels Corrigeren (${checkedOutCount})`),
                            h(HelpIcon, { text: 'Kopieert de bestandsnaam naar het "Titel" veld. Dit is vaak een vereiste om te kunnen inchecken.' })
                        ),
                        
                        checkedOutCount > 0 && h('div', { style: { display: 'flex', alignItems: 'center' } },
                             h('button', {
                                className: 'btn btn-success',
                                onClick: promptBulkCheckIn,
                                disabled: loading
                            }, `Stap 2: Alles Inchecken (${checkedOutCount})`),
                            h(HelpIcon, { text: 'Checkt alle geselecteerde bestanden in één keer in (Major Version).' })
                        )
                    )
                ),
                
                !isRecursive && contents.folders.length > 0 && h('div', { className: 'folder-grid' },
                    contents.folders.map(folder => h('div', {
                        className: 'folder-item',
                        onClick: () => loadContents(folder.ServerRelativeUrl, currentWeb, false)
                    }, `📁 ${folder.Name}`))
                ),
                
                h('div', { className: 'table-container' },
                    h('table', { className: 'file-table' },
                        h('thead', null,
                            h('tr', null, h('th', null, 'Naam'), h('th', null, 'Status'), h('th', null, 'Uitgecheckt door'), h('th', { className: 'text-right' }, 'Actie'))
                        ),
                        h('tbody', null,
                            contents.files.length === 0 
                            ? h('tr', null, h('td', { colSpan: 4, className: 'empty-cell' }, 'Geen bestanden gevonden.'))
                            : contents.files.map(f => h(FileRow, { 
                                key: f.ServerRelativeUrl, 
                                file: f, 
                                onCheckIn: handleCheckIn, 
                                processing: loading,
                                showPath: isRecursive
                            }))
                        )
                    )
                )
            );
        };

        return h('div', { className: 'app-container' },
            h('div', { style: { display: 'flex', alignItems: 'center' } },
                h('h1', { className: 'app-title' }, 'Modulaire SP2019 Check-In Tool'),
                h(HelpIcon, { text: 'Deze tool helpt bij het beheren van documenten die "uitgecheckt" zijn blijven staan.' })
            ),
            h('div', { className: 'context-bar' }, 'Huidige Web Context: ', h('span', { className: 'context-url' }, currentWeb)),
            
            // Progress Bar of Berichten
            progress 
                ? h(ProgressBar, { ...progress }) 
                : (msg && h('div', { className: 'msg-box' }, msg)),
            
            // Loading Spinner (alleen als er geen progress bar is)
            loading && !progress && h('div', { className: 'loading-spinner' }, 'Verwerken...'),
            
            currentPath && h(Breadcrumb, { 
                path: currentPath,
                onNavigate: (newPath) => loadContents(newPath, currentWeb, false) 
            }),
            
            !loading && viewMode === 'sites' && renderSites(),
            !loading && viewMode === 'libs' && renderLibs(),
            !loading && viewMode === 'files' && renderFiles(),
            
            h(ConfirmModal, { config: modalConfig, onClose: () => setModalConfig(null) })
        );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(h(Explorer));

})(window);