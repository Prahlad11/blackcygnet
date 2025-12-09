import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Lead, LeadStatus } from '../types';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onDataLoaded: (leads: Lead[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Helper function to find a value based on a list of possible key terms (case-insensitive)
      const getValue = (row: any, searchTerms: string[]): string => {
        const rowKeys = Object.keys(row);
        
        // Find a key that matches one of the search terms (checking if the key includes the term)
        const foundKey = rowKeys.find(key => {
          const lowerKey = key.toLowerCase().trim();
          return searchTerms.some(term => lowerKey.includes(term));
        });

        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return String(row[foundKey]).trim();
        }
        return '';
      };

      const leads: Lead[] = jsonData.map((row, index) => {
        const name = getValue(row, ['name', 'client', 'customer', 'lead']);
        const phone = getValue(row, ['phone', 'mobile', 'cell', 'contact', 'number', 'tel']);
        const email = getValue(row, ['email', 'mail', 'e-mail']);
        const idNumber = getValue(row, ['id', 'identity', 'identification', 'national', 'passport']);
        const company = getValue(row, ['company', 'business', 'organization', 'firm']);
        const role = getValue(row, ['role', 'title', 'position', 'job']);
        const notes = getValue(row, ['note', 'comment', 'description', 'info']);

        return {
          id: `lead-${Date.now()}-${index}`,
          name: name || 'Unknown Lead',
          idNumber: idNumber,
          phone: phone,
          email: email,
          company: company,
          role: role,
          notes: notes,
          status: LeadStatus.NEW
        };
      }).filter(l => l.name !== 'Unknown Lead' && (l.phone || l.email)); 

      if (leads.length === 0) {
        throw new Error("No valid leads found. Please check your column headers (Name, Phone, Email).");
      }

      onDataLoaded(leads);
    } catch (err) {
      console.error(err);
      setError("Failed to parse file. Please ensure it's a valid Excel or CSV file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`
          relative border border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragging 
            ? 'border-zinc-500 bg-zinc-100 dark:bg-zinc-900/50' 
            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={onFileChange}
          accept=".xlsx, .xls, .csv"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-zinc-900 dark:text-white animate-spin" />
          ) : (
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full border border-zinc-200 dark:border-zinc-700">
              <FileSpreadsheet className="w-8 h-8 text-zinc-900 dark:text-white" />
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-lg font-medium text-zinc-900 dark:text-white">
              {isProcessing ? 'Processing...' : 'Drop your Excel sheet here'}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              or click to browse files
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 text-sm rounded-lg flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Smart import supports: Name, ID Number, Phone, Email, Company, Role, Notes
        </p>
      </div>
    </div>
  );
};