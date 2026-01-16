<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SP2019 Bulk Incheck Tool</title>
    
    <style>
        /* Base Variables (Modern Palette) */
        :root {
            --primary: #3b82f6; /* Modern Blue */
            --primary-dark: #2563eb;
            --secondary: #64748b; /* Slate */
            --bg-body: #f1f5f9; /* Slate 100 */
            --bg-card: #ffffff;
            --text-main: #0f172a; /* Slate 900 */
            --text-muted: #64748b;
            --border: #e2e8f0;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --radius: 0.75rem; /* 12px for softer look */
            --font-stack: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
        }

        /* Base Reset */
        body { 
            font-family: var(--font-stack); 
            background-color: var(--bg-body); 
            margin: 0; 
            color: var(--text-main); 
            -webkit-font-smoothing: antialiased;
            line-height: 1.5;
        }
        
        #s4-workspace { overflow-y: auto !important; }
        * { box-sizing: border-box; }

        /* Layout */
        .app-container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 32px 24px; 
        }
        
        .section-container { 
            display: flex; 
            flex-direction: column; 
            gap: 24px; 
        }
        
        /* Typography */
        .app-title { 
            font-size: 28px; 
            font-weight: 800; 
            margin: 0 0 4px 0; 
            color: var(--text-main); 
            letter-spacing: -0.025em;
        }
        .context-bar { 
            font-size: 14px; 
            color: var(--text-muted); 
            margin-bottom: 32px; 
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .context-url { 
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace; 
            background-color: #e2e8f0; 
            color: #334155;
            padding: 2px 6px; 
            border-radius: 4px; 
            font-size: 0.85em;
        }

        /* Modern Cards */
        .card { 
            background: var(--bg-card); 
            padding: 24px; 
            border-radius: var(--radius); 
            box-shadow: var(--shadow-sm); 
            border: 1px solid var(--border); 
            transition: box-shadow 0.2sease, transform 0.2s ease;
        }
        .card:hover { 
            box-shadow: var(--shadow-md); 
            transform: translateY(-2px);
            border-color: #cbd5e1;
        }
        
        .card-featured { 
            background: linear-gradient(to right, #ffffff, #f8fafc);
            border-left: 5px solid var(--primary); 
            display: flex; justify-content: space-between; align-items: center; 
        }
        
        .site-card { cursor: pointer; border-left: 5px solid #0ea5e9; /* Sky Blue */ }
        .lib-card { cursor: pointer; border-left: 5px solid #8b5cf6; /* Violet */ }
        
        .card-title { font-size: 18px; font-weight: 600; margin: 0 0 6px 0; color: #1e293b; }
        .card-subtitle { font-size: 13px; color: var(--text-muted); margin: 0; word-break: break-all; }
        
        /* Grids */
        .grid-sites { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
            gap: 20px; 
            margin-top: 16px; 
        }
        .grid-libs { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
            gap: 20px; 
        }
        
        /* Folder Grid (Pills) */
        .folder-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
            gap: 12px; 
            margin-bottom: 32px; 
        }
        .folder-item { 
            background-color: #fffbeb; /* Amber 50 */
            border: 1px solid #fcd34d; 
            color: #92400e;
            padding: 10px 14px; 
            border-radius: 8px; 
            text-align: center; 
            cursor: pointer; 
            font-weight: 500;
            transition: all 0.2s;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .folder-item:hover { 
            background-color: #fef3c7; 
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        /* Modern Buttons */
        .btn { 
            padding: 10px 20px; 
            border-radius: 8px; 
            border: none; 
            font-weight: 600; 
            cursor: pointer; 
            font-size: 14px; 
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .btn:active { transform: scale(0.98); }
        
        .btn-primary { 
            background-color: var(--primary); 
            color: white; 
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        .btn-primary:hover { background-color: var(--primary-dark); box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4); }
        
        .btn-secondary { 
            background-color: white; 
            color: #334155; 
            border: 1px solid #cbd5e1;
        }
        .btn-secondary:hover { 
            background-color: #f8fafc; 
            border-color: #94a3b8; 
            color: #0f172a;
        }
        
        .btn-indigo { 
            background-color: #6366f1; 
            color: white; 
            box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        }
        .btn-indigo:hover { background-color: #4f46e5; }
        
        .btn-success { 
            background-color: #10b981; 
            color: white; 
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }
        .btn-success:hover { background-color: #059669; }
        
        .btn-disabled { 
            background-color: #e2e8f0; 
            cursor: not-allowed; 
            color: #94a3b8; 
            box-shadow: none;
            transform: none !important;
        }
        
        .btn-link { background: none; border: none; color: var(--primary); font-weight: 600; padding: 0; cursor: pointer; font-size: 14px; margin-top: 12px; }
        .btn-link:hover { text-decoration: underline; color: var(--primary-dark); }
        
        .btn-back { 
            background: none; 
            border: none; 
            color: var(--text-muted); 
            font-weight: 600; 
            padding: 8px 0; 
            cursor: pointer; 
            margin-bottom: 16px; 
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: color 0.2s;
        }
        .btn-back:hover { color: var(--text-main); }
        .btn-action { font-size: 12px; padding: 6px 12px; height: 32px; }

        /* Modern Table */
        .table-container { 
            background: white; 
            border-radius: var(--radius); 
            box-shadow: var(--shadow-sm); 
            border: 1px solid var(--border);
            overflow: hidden; 
        }
        .file-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
        .file-table th { 
            background-color: #f8fafc; 
            color: #475569; 
            font-size: 12px; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            font-weight: 700;
            padding: 16px; 
            border-bottom: 1px solid var(--border); 
        }
        .file-table td { 
            padding: 16px; 
            border-bottom: 1px solid var(--border); 
            color: #334155;
            vertical-align: middle;
        }
        .file-table tr:last-child td { border-bottom: none; }
        .file-row:hover td { background-color: #f1f5f9; }
        .row-warning { background-color: #fffbeb; } /* Warning row override */
        
        .file-name { font-weight: 600; color: #0f172a; display: block; margin-bottom: 2px; }
        .file-version { font-size: 12px; color: #94a3b8; }
        
        .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; }
        .badge-red { background-color: #fee2e2; color: #991b1b; }
        .badge-green { background-color: #dcfce7; color: #166534; }
        
        /* Toolbar & Controls */
        .toolbar { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 24px; 
            background: white;
            padding: 16px;
            border-radius: var(--radius);
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border);
        }

        /* Progress Bar Modern */
        .progress-box { 
            background: white; 
            padding: 24px; 
            border-radius: var(--radius); 
            box-shadow: var(--shadow-lg); 
            border: 1px solid var(--border); 
            margin-bottom: 32px; 
        }
        .progress-info { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 600; color: var(--text-main); }
        .progress-track { height: 12px; background-color: #f1f5f9; border-radius: 999px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary) 0%, #60a5fa 100%); transition: width 0.4s ease-out; }
        
        /* Modal Modern */
        .modal-overlay { 
            background: rgba(15, 23, 42, 0.4); 
            backdrop-filter: blur(4px);
        }
        .modal-box { 
            border: none;
            box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); 
            padding: 32px;
            border-radius: 16px;
        }
        .modal-title { font-size: 22px; margin-bottom: 16px; color: var(--text-main); }


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