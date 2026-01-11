import React, { useState } from 'react';
import { MessageSquare, FileText, Sparkles, Upload, Zap, BookOpen, Brain, ArrowRight, CheckCircle } from 'lucide-react';
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

  const features = [
    {
      icon: FileText,
      title: 'PDF Document Chat',
      description: 'Upload any PDF and have intelligent conversations about its content',
      gradient: 'from-orange-500 to-red-500',
      image: 'https://images.pexels.com/photos/6075001/pexels-photo-6075001.jpeg'
    },
    {
      icon: MessageSquare,
      title: 'General AI Chat',
      description: 'Engage in open conversations on any topic with advanced AI',
      gradient: 'from-blue-500 to-cyan-500',
      image: 'https://images.pexels.com/photos/16053029/pexels-photo-16053029.jpeg'
    },
    {
      icon: Brain,
      title: 'Q&A Generation',
      description: 'Automatically generate questions and answers from your documents',
      gradient: 'from-purple-500 to-pink-500',
      image: 'https://images.pexels.com/photos/2422556/pexels-photo-2422556.jpeg'
    }
  ];

  const useCases = [
    { text: 'Study and understand complex documents', icon: BookOpen },
    { text: 'Generate study materials and quizzes', icon: Sparkles },
    { text: 'Quick document summarization', icon: Zap },
    { text: 'Multi-language support', icon: MessageSquare }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-auto" data-testid="empty-state">
      {/* Header */}
      <header className="sticky top-0 z-10 h-16 border-b border-slate-200/50 flex items-center justify-between px-6 glassmorphism-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold font-heading text-slate-900">BalochAI</h2>
        </div>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-64 bg-white/80 backdrop-blur-sm" data-testid="model-selector">
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

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium">Powered by Advanced AI</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                Chat with Your
                <span className="block mt-2 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                  Documents
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed">
                Transform how you interact with PDFs. Upload documents, ask questions, and get intelligent responses powered by BalochAI.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => onNewChat('general')}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30 px-8 py-6 text-lg group"
                  data-testid="start-baloch-chat-btn"
                >
                  Start Chatting
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-6 text-lg"
                  data-testid="upload-pdf-hero-btn"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload PDF
                </Button>
              </div>
            </div>
            
            <div className="relative hidden lg:block animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" 
                alt="AI Technology"
                className="relative rounded-2xl shadow-2xl border border-white/10 w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-white to-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-600">Everything you need to unlock your documents' potential</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-200 hover:border-slate-300 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-90 group-hover:opacity-80 transition-opacity`}></div>
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-slate-800" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 bg-white ${
              dragActive
                ? 'border-orange-500 bg-orange-50 scale-105'
                : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            data-testid="upload-drop-zone"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 mb-4">
                <Upload className="w-10 h-10 text-white animate-bounce" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Drop Your PDF Here</h3>
                <p className="text-slate-600 mb-6">
                  Or click the button below to browse your files
                </p>
              </div>
              
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
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30 px-8 py-6 text-lg"
                  data-testid="upload-btn"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Choose PDF File
                </Button>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Perfect For</h2>
            <p className="text-xl text-slate-600">Discover how BalochAI can transform your workflow</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-slate-800 font-medium text-lg">{useCase.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Join thousands of users already transforming their document workflow with BalochAI
          </p>
          <Button
            onClick={() => onNewChat('general')}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-2xl shadow-orange-500/40 px-12 py-7 text-xl"
          >
            Start Free Now
            <Sparkles className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;