import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Sparkles, Upload, Loader2, Bot, User, Zap } from 'lucide-react';
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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex-1 flex flex-col h-screen" data-testid="chat-area">
      {/* Enhanced Header */}
      <header className="h-20 border-b border-slate-200/50 flex items-center justify-between px-6 glassmorphism-header">
        <div className="flex items-center gap-4">
          <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${
            session?.mode === 'pdf' 
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
              : 'bg-gradient-to-br from-orange-500 to-red-500'
          } shadow-lg`}>
            {session?.mode === 'pdf' ? (
              <FileText className="w-6 h-6 text-white" />
            ) : (
              <Sparkles className="w-6 h-6 text-white" />
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">
              {session?.title || 'Chat'}
            </h2>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {session?.mode === 'pdf' ? 'PDF Document Chat' : 'BalochAI General Chat'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-64 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm" data-testid="chat-model-selector">
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
                <Button variant="outline" className="bg-white/80 backdrop-blur-sm shadow-sm" data-testid="actions-menu-btn">
                  <Zap className="w-4 h-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onGenerateQA} data-testid="generate-qa-btn">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  Generate Q&A
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()} data-testid="upload-new-pdf-btn">
                  <Upload className="w-4 h-4 mr-2 text-blue-500" />
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

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-slate-50 to-white" ref={scrollRef} data-testid="messages-container">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message flex gap-4 items-start ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              data-testid={`message-${message.role}-${index}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg animate-scale-in">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`group relative max-w-3xl rounded-2xl p-5 shadow-lg transition-all hover:shadow-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white message-slide-left'
                    : 'bg-white text-slate-900 border border-slate-200 message-slide-right'
                }`}
              >
                <div className={`markdown-content whitespace-pre-wrap leading-relaxed ${
                  message.role === 'user' ? 'text-white' : 'text-slate-800'
                }`}>
                  {message.content}
                </div>
                <div className={`text-xs mt-3 flex items-center gap-2 ${
                  message.role === 'user' ? 'text-orange-100' : 'text-slate-500'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {message.role === 'assistant' && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">AI</span>
                  )}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-lg animate-scale-in">
                  <User className="w-5 h-5 text-slate-700" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 justify-start items-start" data-testid="loading-indicator">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="max-w-3xl rounded-2xl p-5 bg-white border border-slate-200 shadow-lg">
                <div className="flex gap-2 items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <span className="ml-2 text-sm text-slate-600 font-medium">BalochAI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Enhanced Input Area */}
      <div className="border-t border-slate-200/50 p-6 bg-white/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${session?.mode === 'pdf' ? 'about your document' : 'BalochAI'}...`}
                className="min-h-[70px] resize-none bg-white border-2 border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-2xl shadow-lg pr-12 text-base transition-all"
                disabled={loading}
                data-testid="message-input"
              />
              <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                {input.length > 0 && `${input.length} chars`}
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="lg"
              className="px-8 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-2xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 h-[70px]"
              data-testid="send-message-btn"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Send</span>
                </div>
              )}
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3 h-3" />
            <span>Press Enter to send, Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;