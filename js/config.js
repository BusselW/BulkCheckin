/**
 * MODULE: CONFIGURATION
 * Path: /js/config.js
 * Description: Handles BaseUrl logic and library path construction.
 * Updated: Set 'REACT' as default foldername per instruction.
 */

(function(global) {
    
    // Define the Configuration Object globally
    global.AppConfig = {
        // Scripts BaseUrl ($ScrBaseUrl)
        ScrBaseUrl: "https://som.org.om.local/sites/MulderT/",
        
        // Library Location ($ScrLibrary)
        ScrLibrary: "CPW/Scripts",

        /**
         * Returns the full URL to the Scripts Library
         * Result ($ScrFullUrl) = $ScrBaseUrl + $Library
         */
        getScrFullUrl: function() {
            // Remove trailing slash from base if present to avoid double slashes
            const base = this.ScrBaseUrl.endsWith('/') 
                ? this.ScrBaseUrl.slice(0, -1) 
                : this.ScrBaseUrl;
            return base + "/" + this.ScrLibrary;
        },

        /**
         * Helper to get a specific library file path
         * @param {string} filename 
         * @param {string} moduleName (Optional: Defaults to "REACT")
         */
        getLibraryPath: function(filename, moduleName = "REACT") {
            const basePath = this.getScrFullUrl();
            return basePath + "/" + moduleName + "/" + filename;
        },

        /**
         * Helper to load a script dynamically
         * @param {string} url 
         * @returns {Promise}
         */
        loadScript: function(url) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.onload = () => {
                    console.log(`Loaded: ${url}`);
                    resolve();
                };
                script.onerror = () => {
                    console.error(`Failed to load: ${url}`);
                    reject(new Error(`Failed to load script: ${url}`));
                };
                document.head.appendChild(script);
            });
        }
    };

    console.log("AppConfig initialized. Library Root:", global.AppConfig.getScrFullUrl());

})(window);