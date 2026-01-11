import React from 'react';
import { MessageSquare, FileText, Menu, Sparkles, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

const Sidebar = ({ sessions, currentSession, onSelectSession, onNewSession, isOpen, onToggle }) => {
  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all"
        data-testid="sidebar-toggle"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>
      
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative w-64 lg:w-80 h-screen bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/50 flex flex-col transition-transform duration-300 z-40 shadow-xl`}
        data-testid="sidebar"
      >
        <div className="p-6 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-slate-900" data-testid="app-title">
                BalochAI
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-600 ml-[52px]">AI-Powered Chat</p>
        </div>

        <div className="p-4 space-y-3">
          <Button
            onClick={() => onNewSession('general')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30 h-12 rounded-xl transition-all hover:scale-105"
            data-testid="new-general-chat-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            New BalochAI Chat
          </Button>
          <Button
            onClick={() => onNewSession('pdf')}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm h-12 rounded-xl transition-all hover:scale-105"
            data-testid="new-pdf-chat-btn"
          >
            <FileText className="w-5 h-5 mr-2" />
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