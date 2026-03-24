'use client';

import React, { useState, useRef, useEffect } from "react";
import { appwriteService } from "@/services/AppwriteService";
import { BUCKETS } from "@/constants/appwrite";
import { Button } from "@/components/ui/Button";

interface FileUploaderProps {
  onUploadComplete: (fileIds: string[]) => void;
  initialFileIds?: string[];
}

/**
 * FileUploader Component: "The Intelligent Repository"
 * Handles multipart uploads and manages human-readable metadata for technical assets.
 */
export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, initialFileIds = [] }) => {
  const [fileIds, setFileIds] = useState<string[]>(initialFileIds);
  const [fileMetadata, setFileMetadata] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * INITIAL LOOKUP: Resolve existing IDs to real Filenames
   */
  useEffect(() => {
    const fetchExistingMetadata = async () => {
      const metadataMap: Record<string, string> = { ...fileMetadata };
      let hasChanges = false;

      for (const id of initialFileIds) {
        if (!metadataMap[id]) {
          try {
            const meta = await appwriteService.getFileMetadata(BUCKETS.INQUIRY_FILES, id);
            metadataMap[id] = meta.name;
            hasChanges = true;
          } catch (e) {
            metadataMap[id] = "Unknown Asset";
          }
        }
      }

      if (hasChanges) setFileMetadata(metadataMap);
    };

    if (initialFileIds.length > 0) fetchExistingMetadata();
  }, [initialFileIds]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const newFileIds: string[] = [...fileIds];
      const newMetadata = { ...fileMetadata };
      
      for (let i = 0; i < files.length; i++) {
        const uploadedFile = await appwriteService.uploadFile(BUCKETS.INQUIRY_FILES, files[i]);
        newFileIds.push(uploadedFile.$id);
        newMetadata[uploadedFile.$id] = uploadedFile.name; // CAPTURE NAME IMMEDIATELY
      }
      
      setFileIds(newFileIds);
      setFileMetadata(newMetadata);
      onUploadComplete(newFileIds);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = async (id: string) => {
    try {
      await appwriteService.deleteFile(BUCKETS.INQUIRY_FILES, id);
      const updatedIds = fileIds.filter(fid => fid !== id);
      
      // Clean up metadata map
      const updatedMeta = { ...fileMetadata };
      delete updatedMeta[id];

      setFileIds(updatedIds);
      setFileMetadata(updatedMeta);
      onUploadComplete(updatedIds);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="group relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center hover:border-black dark:hover:border-white transition-all cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/10"
      >
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          accept=".stp,.step,.pdf,.cad,.dwg,.dxf"
        />
        <div className="flex flex-col items-center gap-3">
           <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isUploading ? "bg-black text-white animate-pulse" : "bg-white dark:bg-zinc-950 text-zinc-400 group-hover:text-black dark:group-hover:text-white"}`}>
              {isUploading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              )}
           </div>
           <div>
             <p className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Technical Repository</p>
             <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-tighter">Attach .STP, .PDF, or CAD drawings (Max 30MB)</p>
           </div>
        </div>
      </div>

      {fileIds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fileIds.map((id) => (
            <div key={id} className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 rounded-lg bg-white dark:bg-zinc-950 group animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 bg-zinc-50 dark:bg-zinc-900 rounded flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="flex flex-col truncate">
                   <span className="text-[10px] font-black uppercase tracking-tight truncate leading-tight">
                     {fileMetadata[id] || "Retrieving Label..."}
                   </span>
                   <span className="text-[8px] text-zinc-400 font-mono mt-0.5 uppercase tracking-tighter">REF: {id.substring(0, 16)}...</span>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(id); }}
                className="p-2 hover:bg-rose-50 text-zinc-300 hover:text-rose-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
