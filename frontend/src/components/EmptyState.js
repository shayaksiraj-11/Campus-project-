import React, { useState } from 'react';
import { MessageSquare, FileText, Sparkles, Upload } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const EmptyState = ({ onNewChat, onUploadPDF, currentSession, models, selectedModel, onModelChange }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onUploadPDF(file);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUploadPDF(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen" data-testid="empty-state">
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 glassmorphism">
        <h2 className="text-lg font-semibold font-heading text-slate-900">Welcome to ChatPDF</h2>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-64" data-testid="model-selector">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id} data-testid={`model-option-${model.id}`}>
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-slate-500">{model.provider}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="flex-1 flex items-center justify-center p-12">
        <div className="max-w-3xl w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
              <Sparkles className="w-10 h-10 text-slate-700" />
            </div>
            <h1 className="text-4xl font-bold font-heading text-slate-900 tracking-tight">
              Chat with Your Documents
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Upload PDFs and have intelligent conversations, or chat freely with BalochAI
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            data-testid="upload-drop-zone"
          >
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload PDF Document</h3>
            <p className="text-sm text-slate-500 mb-6">
              Drag and drop your PDF here, or click to browse
            </p>
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
              data-testid="pdf-upload-input"
            />
            <label htmlFor="pdf-upload">
              <Button
                as="span"
                className="bg-slate-900 text-white hover:bg-slate-800"
                data-testid="upload-btn"
              >
                <FileText className="w-4 h-4 mr-2" />
                Choose PDF File
              </Button>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">PDF Chat</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload documents and ask questions, generate Q&A, analyze content, or translate text
              </p>
            </div>
            <div className="p-6 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">BalochAI Chat</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Have open conversations on any topic without document context
              </p>
              <Button
                onClick={() => onNewChat('general')}
                className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800"
                data-testid="start-baloch-chat-btn"
              >
                Start Chatting
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;