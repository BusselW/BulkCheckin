/**
 * MODULE: SHAREPOINT SERVICE
 * Path: /js/sp-service.js
 * Description: Handles REST calls to SP2019.
 * dependencies: None (Native fetch)
 */

(function(global) {

    global.SPService = {
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose"
        },

        /**
         * Fetches a fresh Request Digest (FormDigestValue) from SharePoint.
         */
        async getRequestDigest(webUrl) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            try {
                const response = await fetch(`${cleanUrl}/_api/contextinfo`, {
                    method: "POST",
                    headers: { "Accept": "application/json;odata=verbose" }
                });
                
                if (!response.ok) throw new Error(`ContextInfo Failed: ${response.statusText}`);
                
                const data = await response.json();
                return data.d.GetContextWebInformation.FormDigestValue;
            } catch (e) {
                console.error("Error fetching Request Digest:", e);
                const el = document.getElementById("__REQUESTDIGEST");
                return el ? el.value : "";
            }
        },

        // Generic fetch wrapper
        async fetchJSON(url, method = "GET", body = null, digest = null, extraHeaders = {}) {
            const headers = { ...this.headers, ...extraHeaders };
            
            if (method === "POST") {
                const token = digest || (document.getElementById("__REQUESTDIGEST") ? document.getElementById("__REQUESTDIGEST").value : "");
                headers["X-RequestDigest"] = token;
            }

            try {
                const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });
                if (!response.ok) throw new Error(response.statusText);
                if (response.status === 204) return null; // No Content
                return await response.json();
            } catch (error) {
                console.error("SP API Error:", error);
                throw error;
            }
        },

        // --- API METHODS ---

        async getSubsites(webUrl) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            return this.fetchJSON(`${cleanUrl}/_api/web/webs?$select=Title,ServerRelativeUrl`);
        },

        async getLibraries(webUrl) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            // BaseTemplate 101 = Document Library
            return this.fetchJSON(`${cleanUrl}/_api/web/lists?$filter=BaseTemplate eq 101&$select=Title,RootFolder/ServerRelativeUrl&$expand=RootFolder`);
        },

        async getFilesAndFolders(serverRelativeUrl, webUrl) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            // GetFolderByServerRelativeUrl endpoint
            const endpoint = `${cleanUrl}/_api/web/GetFolderByServerRelativeUrl('${serverRelativeUrl}')/Files?$expand=ListItemAllFields,Author,CheckedOutByUser`;
            const folderEndpoint = `${cleanUrl}/_api/web/GetFolderByServerRelativeUrl('${serverRelativeUrl}')/Folders`;
            
            const [files, folders] = await Promise.all([
                this.fetchJSON(endpoint),
                this.fetchJSON(folderEndpoint)
            ]);
            
            return { files: files.d.results, folders: folders.d.results };
        },

        /**
         * Recursively fetches all files starting from a folder.
         * Crawls through subfolders sequentially to find all items.
         */
        async getFilesRecursive(startPath, webUrl, onProgress) {
             const resultFiles = [];
             
             // Queue for folders to process (Breadth-First Search)
             const queue = [startPath];
             
             while(queue.length > 0) {
                 const currentPath = queue.shift();
                 
                 try {
                     // Reuse existing method to get contents of this level
                     const data = await this.getFilesAndFolders(currentPath, webUrl);
                     
                     // Add files found
                     resultFiles.push(...data.files);
                     
                     // Add subfolders to the queue to be processed
                     data.folders.forEach(f => queue.push(f.ServerRelativeUrl));
                     
                     // Report progress back to UI (optional)
                     if (onProgress) onProgress(resultFiles.length, queue.length);
                     
                 } catch (e) {
                     console.error(`Failed to crawl ${currentPath}:`, e);
                     // We continue even if one folder fails
                 }
             }
             
             return resultFiles;
        },

        async updateFileTitle(webUrl, file, newTitle) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            const digest = await this.getRequestDigest(webUrl);

            if (!file.ListItemAllFields || !file.ListItemAllFields.__metadata) {
                throw new Error(`Metadata missing for file: ${file.Name}`);
            }

            const itemUri = file.ListItemAllFields.__metadata.uri;
            const itemType = file.ListItemAllFields.__metadata.type;

            const body = {
                "__metadata": { "type": itemType },
                "Title": newTitle
            };

            return this.fetchJSON(itemUri, "POST", body, digest, {
                "X-HTTP-Method": "MERGE",
                "If-Match": "*"
            });
        },

        async checkInFile(webUrl, fileServerRelativeUrl) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            const digest = await this.getRequestDigest(webUrl);
            const endpoint = `${cleanUrl}/_api/web/GetFileByServerRelativeUrl('${fileServerRelativeUrl}')/CheckIn(comment='Bulk Incheck Tool',checkintype=1)`;
            return this.fetchJSON(endpoint, "POST", null, digest);
        }
    };

})(window);