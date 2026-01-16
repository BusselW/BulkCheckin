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
                
                // Handle Authorization Errors Gracefully
                if (response.status === 401 || response.status === 403) {
                    throw new Error("HTTP_UNAUTHORIZED");
                }

                if (!response.ok) throw new Error(response.statusText);
                if (response.status === 204) return null; // No Content
                return await response.json();
            } catch (error) {
                // Return generic error or rethrow specific one
                if (error.message === "HTTP_UNAUTHORIZED") throw error;
                console.error("SP API Error:", error);
                throw error;
            }
        },

        // --- API METHODS ---

        async getSubsites(webUrl) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            try {
                return await this.fetchJSON(`${cleanUrl}/_api/web/webs?$select=Title,ServerRelativeUrl`);
            } catch (e) {
                if (e.message === "HTTP_UNAUTHORIZED") return { d: { results: [] } };
                throw e;
            }
        },

        async getLibraries(webUrl) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            try {
                // BaseTemplate 101 = Document Library
                return await this.fetchJSON(`${cleanUrl}/_api/web/lists?$filter=BaseTemplate eq 101&$select=Title,RootFolder/ServerRelativeUrl&$expand=RootFolder`);
            } catch (e) {
                if (e.message === "HTTP_UNAUTHORIZED") return { d: { results: [] } };
                throw e;
            }
        },

        async getFilesAndFolders(serverRelativeUrl, webUrl) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            // Escape single quotes for OData string literal
            const safeUrl = serverRelativeUrl.replace(/'/g, "''");
            // GetFolderByServerRelativeUrl endpoint
            const endpoint = `${cleanUrl}/_api/web/GetFolderByServerRelativeUrl('${safeUrl}')/Files?$expand=ListItemAllFields,Author,CheckedOutByUser`;
            const folderEndpoint = `${cleanUrl}/_api/web/GetFolderByServerRelativeUrl('${safeUrl}')/Folders`;
            
            try {
                const [files, folders] = await Promise.all([
                    this.fetchJSON(endpoint),
                    this.fetchJSON(folderEndpoint)
                ]);
                
                return { files: files.d.results, folders: folders.d.results };
            } catch (e) {
                if (e.message === "HTTP_UNAUTHORIZED") {
                    console.warn(`Access denied for ${serverRelativeUrl}, skipping.`);
                    return { files: [], folders: [] };
                }
                throw e;
            }
        },

        /**
         * Recursively fetches all files starting from a folder.
         * Optimized with concurrency to fetch multiple folders in parallel.
         */
        async getFilesRecursive(startPath, webUrl, onProgress) {
             const resultFiles = [];
             const queue = [startPath];
             const MAX_CONCURRENCY = 3;
             let activeCount = 0;

             return new Promise((resolve) => {
                 const next = () => {
                     // If nothing in queue and nothing active, we are done
                     if (queue.length === 0 && activeCount === 0) {
                         resolve(resultFiles);
                         return;
                     }

                     // Launch new requests while we have capacity and items
                     while (queue.length > 0 && activeCount < MAX_CONCURRENCY) {
                         const currentPath = queue.shift();
                         activeCount++;
                         
                         this.getFilesAndFolders(currentPath, webUrl)
                             .then(data => {
                                 resultFiles.push(...data.files);
                                 data.folders.forEach(f => queue.push(f.ServerRelativeUrl));
                                 if (onProgress) onProgress(resultFiles.length, queue.length);
                             })
                             .catch(e => {
                                 console.error(`Failed to crawl ${currentPath}:`, e);
                             })
                             .finally(() => {
                                 activeCount--;
                                 next();
                             });
                     }
                 };

                 // Start the process
                 next();
             });
        },

        async updateFileTitle(webUrl, file, newTitle) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            const digest = await this.getRequestDigest(webUrl);

            if (!file.ListItemAllFields || !file.ListItemAllFields.__metadata) {
                throw new Error(`Metadata missing for file: ${file.Name}`);
            }

            // Fix: Construct URI manually to handle special characters correctly
            const safeUrl = file.ServerRelativeUrl.replace(/'/g, "''");
            const endpoint = `${cleanUrl}/_api/web/GetFileByServerRelativeUrl('${safeUrl}')/ListItemAllFields`;
            
            const itemType = file.ListItemAllFields.__metadata.type;

            const body = {
                "__metadata": { "type": itemType },
                "Title": newTitle
            };

            return this.fetchJSON(endpoint, "POST", body, digest, {
                "X-HTTP-Method": "MERGE",
                "If-Match": "*"
            });
        },

        async checkInFile(webUrl, fileServerRelativeUrl) {
            const cleanUrl = webUrl.endsWith('/') ? webUrl.slice(0, -1) : webUrl;
            const digest = await this.getRequestDigest(webUrl);
            const safeUrl = fileServerRelativeUrl.replace(/'/g, "''");
            const endpoint = `${cleanUrl}/_api/web/GetFileByServerRelativeUrl('${safeUrl}')/CheckIn(comment='Bulk Incheck Tool',checkintype=1)`;
            return this.fetchJSON(endpoint, "POST", null, digest);
        }
    };

})(window);