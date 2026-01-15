<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SP2019 Bulk Incheck Tool</title>
    
    <style>
        /* Base */
        body { font-family: "Segoe UI", "Segoe", Tahoma, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; color: #1f2937; }
        #s4-workspace { overflow-y: auto !important; }
        
        /* Layout */
        .app-container { max-width: 1024px; margin: 0 auto; padding: 24px; }
        .section-container { display: flex; flex-direction: column; gap: 20px; }
        
        /* Typography */
        .app-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #111827; }
        .font-bold { font-weight: 700; }
        .text-right { text-align: right; }
        
        /* Cards */
        .card { background: white; padding: 16px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
        .card:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .card-featured { border-left: 4px solid #4f46e5; display: flex; justify-content: space-between; align-items: center; }
        .site-card { border-left: 4px solid #3b82f6; cursor: pointer; transition: all 0.2s; }
        .lib-card { border-left: 4px solid #8b5cf6; cursor: pointer; }
        .card-title { font-size: 18px; font-weight: 600; margin: 0 0 4px 0; }
        .card-subtitle { font-size: 12px; color: #6b7280; margin: 0; word-break: break-all; }
        
        /* Grids */
        .grid-sites { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 10px; }
        .grid-libs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .folder-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 24px; }
        .folder-item { background-color: #fef3c7; border: 1px solid #fde68a; padding: 8px; border-radius: 4px; text-align: center; cursor: pointer; }
        .folder-item:hover { background-color: #fde68a; }

        /* Buttons & Links */
        .btn { padding: 8px 16px; border-radius: 4px; border: none; font-weight: 500; cursor: pointer; font-size: 14px; transition: background 0.2s; }
        .btn-primary { background-color: #2563eb; color: white; }
        .btn-primary:hover { background-color: #1d4ed8; }
        .btn-secondary { background-color: #e5e7eb; color: #374151; }
        .btn-secondary:hover { background-color: #d1d5db; }
        .btn-indigo { background-color: #4f46e5; color: white; }
        .btn-indigo:hover { background-color: #4338ca; }
        .btn-success { background-color: #16a34a; color: white; }
        .btn-success:hover { background-color: #15803d; }
        .btn-disabled { background-color: #d1d5db; cursor: wait; color: #4b5563; }
        .btn-link { background: none; border: none; color: #2563eb; text-decoration: underline; padding: 0; cursor: pointer; font-size: 14px; margin-top: 8px; }
        .btn-back { background: none; border: none; color: #2563eb; text-decoration: underline; padding: 0; cursor: pointer; margin-bottom: 8px; display: block; }
        .btn-action { font-size: 12px; padding: 4px 12px; }

        /* Components */
        .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4b5563; background: white; padding: 8px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); margin-bottom: 16px; }
        .breadcrumb-label { font-weight: bold; color: #2563eb; }
        .breadcrumb-part { display: flex; align-items: center; }
        
        .breadcrumb-link { color: #2563eb; cursor: pointer; text-decoration: none; font-weight: 500; }
        .breadcrumb-link:hover { text-decoration: underline; color: #1d4ed8; }
        
        .separator { margin: 0 4px; color: #9ca3af; }
        
        .context-bar { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
        .context-url { font-family: monospace; background-color: #e5e7eb; padding: 2px 4px; border-radius: 4px; }
        
        .msg-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af; padding: 12px; margin-bottom: 16px; }
        .loading-spinner { padding: 32px; text-align: center; color: #6b7280; animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* PROGRESS BAR CSS */
        .progress-box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; margin-bottom: 24px; }
        .progress-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #374151; }
        .progress-track { height: 10px; background-color: #e5e7eb; border-radius: 999px; overflow: hidden; }
        .progress-fill { height: 100%; background-color: #2563eb; transition: width 0.3s ease; }
        .progress-details { margin-top: 8px; font-size: 12px; color: #6b7280; text-align: right; font-family: monospace; }

        /* Table */
        .table-container { background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
        .file-table { width: 100%; border-collapse: collapse; text-align: left; }
        .file-table th { background-color: #f3f4f6; color: #4b5563; font-size: 12px; text-transform: uppercase; padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .file-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .file-row:hover { background-color: #f9fafb; }
        .row-warning { background-color: #fffbeb; }
        
        .file-name { font-weight: 500; color: #111827; }
        .file-version { font-size: 12px; color: #6b7280; }
        
        .badge { padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
        .badge-red { background-color: #fee2e2; color: #991b1b; }
        .badge-green { background-color: #dcfce7; color: #166534; }
        .empty-cell { text-align: center; padding: 24px; color: #6b7280; }
        
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }

        /* MODAL CSS */
        .modal-overlay { 
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(0,0,0,0.5); 
            display: flex; align-items: center; justify-content: center; 
            z-index: 999; 
            backdrop-filter: blur(2px);
        }
        .modal-box { 
            background: white; 
            padding: 24px; 
            border-radius: 8px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
            max-width: 480px; 
            width: 90%; 
            border: 1px solid #e5e7eb;
            animation: fadeIn 0.2s ease-out;
        }
        .modal-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #111827; margin-top: 0; }
        .modal-text { font-size: 15px; color: #4b5563; margin-bottom: 24px; line-height: 1.5; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
        
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    </style>
</head>
<body class="bg-gray-100 font-sans">

    <div id="root"></div>

    <script>
        // 1. Load Local Configuration
        const scriptConfig = document.createElement('script');
        scriptConfig.src = "./js/config.js";
        
        scriptConfig.onload = function() {
            console.log("Config loaded.");
            // 2. Resolve Library Paths using the Config Module
            const reactUrl = AppConfig.getLibraryPath('react.production.min.js', 'REACT');
            const domUrl = AppConfig.getLibraryPath('react-dom.production.min.js', 'REACT');

            console.log("Loading Libraries from:", reactUrl, domUrl);
            // 3. Chain Load Dependencies
            AppConfig.loadScript(reactUrl)
                .then(() => AppConfig.loadScript(domUrl))
                .then(() => AppConfig.loadScript("./js/sp-service.js")) // Project File: Service
                .then(() => AppConfig.loadScript("./js/app.js"))       // Project File: App
                
                .catch(err => {
                    console.error("Error starting application:", err);
                    document.getElementById('root').innerHTML = `
                        <div style="color:red; padding:20px; border:1px solid red; background:#fee2e2;">
                            <b>Afhankelijkheden konden niet geladen worden.</b><br>
                            Controleer de console voor paden. <br>
                            BaseUrl: ${AppConfig.ScrBaseUrl}
                        </div>`;
                });
        };
        scriptConfig.onerror = function() {
            document.getElementById('root').innerText = "Fout: Kon ./js/config.js niet laden";
        };

        document.head.appendChild(scriptConfig);
    </script>
</body>
</html>