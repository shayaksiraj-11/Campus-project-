import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Sparkles, Upload, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const ChatArea = ({
  session,
  messages,
  onSendMessage,
  onUploadPDF,
  onGenerateQA,
  loading,
  models,
  selectedModel,
  onModelChange,
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !loading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUploadPDF(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen" data-testid="chat-area">
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 glassmorphism">
        <div className="flex items-center gap-3">
          {session?.mode === 'pdf' ? (
            <FileText className="w-5 h-5 text-slate-600" />
          ) : (
            <Sparkles className="w-5 h-5 text-slate-600" />
          )}
          <div>
            <h2 className="text-lg font-semibold font-heading text-slate-900">
              {session?.title || 'Chat'}
            </h2>
            <p className="text-xs text-slate-500">
              {session?.mode === 'pdf' ? 'PDF Document Chat' : 'BalochAI General Chat'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-64" data-testid="chat-model-selector">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-slate-500">{model.provider}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {session?.mode === 'pdf' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid="actions-menu-btn">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onGenerateQA} data-testid="generate-qa-btn">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Q&A
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()} data-testid="upload-new-pdf-btn">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </header>

      <ScrollArea className="flex-1 p-6" ref={scrollRef} data-testid="messages-container">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              data-testid={`message-${message.role}-${index}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-xl p-4 ${
                  message.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <div className="markdown-content whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs mt-2 opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-700">U</span>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 justify-start" data-testid="loading-indicator">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="max-w-2xl rounded-xl p-4 bg-slate-100">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-slate-200 p-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${session?.mode === 'pdf' ? 'about your document' : 'BalochAI'}...`}
              className="min-h-[60px] resize-none bg-white border-slate-200 focus:ring-2 focus:ring-slate-900/10 rounded-xl shadow-sm"
              disabled={loading}
              data-testid="message-input"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-sm"
              data-testid="send-message-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;