'use client';

import React, { useState, useEffect } from "react";
import { appwriteService } from "@/services/AppwriteService";
import { BUCKETS } from "@/constants/appwrite";

interface FileLinkProps {
  fileId: string;
}

/**
 * FileLink Component
 * Advanced: Fetches binary blob to force correct filename and extension across origins.
 */
export const FileLink: React.FC<FileLinkProps> = ({ fileId }) => {
  const [fileName, setFileName] = useState<string>("Loading...");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadata = await appwriteService.getFileMetadata(BUCKETS.INQUIRY_FILES, fileId);
        setFileName(metadata.name);
      } catch (error) {
        console.error("Failed to fetch file metadata:", error);
        setFileName("Missing Asset");
      }
    };
    if (fileId) fetchMetadata();
  }, [fileId]);

  /**
   * Safe Proxy Download
   * Fetches the file as a Blob and triggers a local download to preserve naming/extension.
   */
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDownloading || fileName === "Loading..." || fileName === "Missing Asset") return;

    try {
      setIsDownloading(true);
      
      // 1. Get the direct signed URL from Appwrite
      const url = appwriteService.getFileDownload(BUCKETS.INQUIRY_FILES, fileId);
      
      // 2. Proxy fetch the binary blob (This bypasses download attribute limitations)
      const response = await fetch(url);
      const blob = await response.blob();
      
      // 3. Create a local in-memory URL for the browser
      const blobUrl = window.URL.createObjectURL(blob);
      
      // 4. Create an invisible anchor to trigger named download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName; // FORCE REAL NAME (e.g. bracket.stp)
      document.body.appendChild(link);
      link.click();
      
      // 5. Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Secure download failed:", error);
      alert("Asset Retrieval Failed: Check network connectivity.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isDownloading}
      className={`flex flex-col text-left p-4 border border-zinc-100 dark:border-zinc-900 rounded-lg transition-all group w-full ${
        isDownloading ? "opacity-50 cursor-wait bg-zinc-100" : "hover:border-black dark:hover:border-white bg-zinc-50/30 dark:bg-zinc-900/10"
      }`}
    >
       <div className="flex items-center gap-2 mb-1">
          <div className={`h-1.5 w-1.5 rounded-full ${isDownloading ? "bg-amber-500 animate-ping" : "bg-black dark:bg-white"}`} />
          <span className="text-[10px] font-black uppercase tracking-tight text-black dark:text-white">
            {isDownloading ? "Retrieving Buffer..." : "Drawing Asset"}
          </span>
       </div>
       <span className="text-[11px] font-bold text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
         {fileName}
       </span>
       <div className="flex justify-between items-center mt-2">
         <span className="text-[8px] text-zinc-300 font-mono uppercase tracking-tighter">ID: {fileId.substring(0, 12)}...</span>
         {!isDownloading && (
           <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-all"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
         )}
       </div>
    </button>
  );
};
