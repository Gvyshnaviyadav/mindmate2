import React, { useState } from 'react';
import { ViewState } from './types';
import { Dashboard } from './components/Dashboard';
import { ChatTherapist } from './components/ChatTherapist';
import { VoiceWellness } from './components/VoiceWellness';
import { VisualJournal } from './components/VisualJournal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard />;
      case ViewState.CHAT: return <ChatTherapist />;
      case ViewState.VOICE: return <VoiceWellness />;
      case ViewState.VISION: return <VisualJournal />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-lg`}
      >
        <div className="p-6 flex items-center justify-between">
            {isSidebarOpen ? (
                <div className="flex items-center gap-2 text-teal-600">
                    <i className="fas fa-brain text-2xl"></i>
                    <span className="text-xl font-bold tracking-tight">MindMate</span>
                </div>
            ) : (
                <i className="fas fa-brain text-2xl text-teal-600 mx-auto"></i>
            )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavItem 
                icon="fa-chart-pie" 
                label="Dashboard" 
                active={currentView === ViewState.DASHBOARD} 
                onClick={() => setCurrentView(ViewState.DASHBOARD)} 
                expanded={isSidebarOpen}
            />
            <NavItem 
                icon="fa-comments" 
                label="Chat Therapist" 
                active={currentView === ViewState.CHAT} 
                onClick={() => setCurrentView(ViewState.CHAT)} 
                expanded={isSidebarOpen}
            />
            <NavItem 
                icon="fa-microphone-lines" 
                label="Voice Session" 
                active={currentView === ViewState.VOICE} 
                onClick={() => setCurrentView(ViewState.VOICE)} 
                expanded={isSidebarOpen}
            />
             <NavItem 
                icon="fa-eye" 
                label="Visual Journal" 
                active={currentView === ViewState.VISION} 
                onClick={() => setCurrentView(ViewState.VISION)} 
                expanded={isSidebarOpen}
            />
        </nav>

        <div className="p-4 border-t border-slate-100">
            <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="w-full text-slate-400 hover:text-teal-600 transition p-2"
            >
                <i className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
            <h1 className="text-lg font-semibold text-slate-700">
                {currentView === ViewState.DASHBOARD && 'Overview'}
                {currentView === ViewState.CHAT && 'Text Therapy Session'}
                {currentView === ViewState.VOICE && 'Live Voice Analysis'}
                {currentView === ViewState.VISION && 'Visual Wellness & Creation'}
            </h1>
            <div className="flex items-center gap-4">
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                    <i className="fas fa-battery-full mr-2"></i>Energy: High
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <i className="fas fa-user"></i>
                </div>
            </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
    icon: string;
    label: string;
    active: boolean;
    onClick: () => void;
    expanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, expanded }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
            active 
            ? 'bg-teal-50 text-teal-700 shadow-sm' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        }`}
    >
        <i className={`fas ${icon} text-lg ${expanded ? 'mr-3' : 'mx-auto'}`}></i>
        {expanded && <span className="font-medium">{label}</span>}
    </button>
);

export default App;
