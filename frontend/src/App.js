import React, { useState, useEffect } from 'react';
import './App.css';
import { Toaster } from './components/ui/sonner';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import EmptyState from './components/EmptyState';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('allenai/molmo-2-8b:free');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadModels();
    loadSessions();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
    }
  }, [currentSession]);

  const loadModels = async () => {
    try {
      const response = await axios.get(`${API}/models`);
      setModels(response.data.models);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadMessages = async (sessionId) => {
    try {
      const response = await axios.get(`${API}/sessions/${sessionId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewSession = async (mode = 'general') => {
    try {
      const response = await axios.post(`${API}/sessions`, {
        title: mode === 'general' ? 'BalochAI Chat' : 'PDF Chat',
        mode
      });
      const newSession = response.data;
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
      toast.success('New chat created');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create new chat');
    }
  };

  const selectSession = (session) => {
    setCurrentSession(session);
  };

  const uploadPDF = async (file) => {
    if (!currentSession) {
      await createNewSession('pdf');
    }

    const sessionId = currentSession?.id;
    if (!sessionId) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API}/sessions/${sessionId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('PDF uploaded successfully');
      loadSessions();
      if (currentSession) {
        const updatedSession = { ...currentSession, mode: 'pdf' };
        setCurrentSession(updatedSession);
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error('Failed to upload PDF');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message) => {
    if (!currentSession) {
      await createNewSession('general');
      return;
    }

    try {
      setLoading(true);
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, userMessage]);

      const response = await axios.post(
        `${API}/sessions/${currentSession.id}/chat`,
        {
          message,
          model: selectedModel,
          temperature: 0.7
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, userMessage, assistantMessage]);
      loadSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const generateQA = async () => {
    if (!currentSession || currentSession.mode !== 'pdf') {
      toast.error('Please upload a PDF first');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API}/sessions/${currentSession.id}/generate-qa`,
        {
          model: selectedModel,
          num_questions: 5
        }
      );

      const qaMessage = {
        role: 'assistant',
        content: response.data.qa_content,
        timestamp: new Date().toISOString(),
        metadata: { type: 'qa' }
      };
      setMessages([...messages, qaMessage]);
      toast.success('Q&A generated successfully');
    } catch (error) {
      console.error('Error generating Q&A:', error);
      toast.error('Failed to generate Q&A');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" data-testid="app-container">
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {!currentSession || messages.length === 0 ? (
          <EmptyState
            onNewChat={createNewSession}
            onUploadPDF={uploadPDF}
            currentSession={currentSession}
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        ) : (
          <ChatArea
            session={currentSession}
            messages={messages}
            onSendMessage={sendMessage}
            onUploadPDF={uploadPDF}
            onGenerateQA={generateQA}
            loading={loading}
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        )}
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;