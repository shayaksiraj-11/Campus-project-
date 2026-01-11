import React from 'react';
import { MessageSquare, FileText, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

const Sidebar = ({ sessions, currentSession, onSelectSession, onNewSession, isOpen, onToggle }) => {
  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
        data-testid="sidebar-toggle"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>
      
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative w-64 lg:w-72 h-screen bg-slate-50/50 border-r border-slate-200 flex flex-col transition-transform duration-200 z-40`}
        data-testid="sidebar"
      >
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold font-heading text-slate-900" data-testid="app-title">
            ChatPDF
          </h1>
          <p className="text-sm text-slate-500 mt-1">AI-Powered Document Chat</p>
        </div>

        <div className="p-4 space-y-2">
          <Button
            onClick={() => onNewSession('general')}
            className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
            data-testid="new-general-chat-btn"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            New BalochAI Chat
          </Button>
          <Button
            onClick={() => onNewSession('pdf')}
            className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            data-testid="new-pdf-chat-btn"
          >
            <FileText className="w-4 h-4 mr-2" />
            New PDF Chat
          </Button>
        </div>

        <div className="flex-1 overflow-hidden px-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Recent Chats
          </h2>
          <ScrollArea className="h-full">
            <div className="space-y-1 pb-4">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className={`w-full text-left p-3 rounded-lg transition-all group ${
                    currentSession?.id === session.id
                      ? 'bg-white shadow-sm border border-slate-200'
                      : 'hover:bg-white/50 border border-transparent'
                  }`}
                  data-testid={`session-item-${session.id}`}
                >
                  <div className="flex items-start gap-2">
                    {session.mode === 'pdf' ? (
                      <FileText className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-slate-600" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-slate-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            Powered by OpenRouter
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;