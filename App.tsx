
import React, { useState, useEffect } from 'react';
import { ViewState, User, HistoryItem } from './types';
import { authService } from './services/authService';
import { setStorageUser } from './services/storageService';

import { Home } from './views/Home';
import { QuizGenerator } from './views/QuizGenerator';
import { Summarizer } from './views/Summarizer';
import { History } from './views/History';
import { FlashcardGenerator } from './views/FlashcardGenerator';
import { NotesGenerator } from './views/NotesGenerator';
import { Auth } from './views/Auth';
import { Profile } from './views/Profile';
import { SecurityAudit } from './views/SecurityAudit';
import { Lock } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [historyData, setHistoryData] = useState<any>(null);

  // Check for existing session on mount
  useEffect(() => {
    const initSession = async () => {
      const currentUser = await authService.getSession();
      if (currentUser) {
        setUser(currentUser);
        setStorageUser(currentUser.id);
      } else {
        setStorageUser(null); // Guest mode
      }
    };
    initSession();
  }, []);

  const handleLogin = (loggedInUser: User) => {
      setUser(loggedInUser);
      setStorageUser(loggedInUser.id);
      setView(ViewState.HOME);
  };

  const handleLogout = async () => {
      await authService.logout();
      setUser(null);
      setStorageUser(null);
      setView(ViewState.AUTH); // Redirect to login or home
  };
  
  const handleOpenHistoryItem = (item: HistoryItem) => {
      setHistoryData(item.data);
      switch(item.type) {
          case 'quiz': setView(ViewState.QUIZ_ACTIVE); break;
          case 'summary': setView(ViewState.SUMMARY_ACTIVE); break;
          case 'flashcards': setView(ViewState.FLASHCARDS_ACTIVE); break;
          case 'note': setView(ViewState.NOTES_ACTIVE); break;
          default: break;
      }
  };

  const clearHistoryData = () => {
      setHistoryData(null);
      setView(ViewState.HOME);
  };

  const renderView = () => {
    switch (view) {
      case ViewState.HOME:
        return <Home onChangeView={setView} isLoggedIn={!!user} />;
      
      case ViewState.AUTH:
        return <Auth onLogin={handleLogin} />;
        
      case ViewState.PROFILE:
        if (!user) return <Auth onLogin={handleLogin} />;
        return <Profile user={user} onBack={() => setView(ViewState.HOME)} onLogout={handleLogout} onUpdateUser={setUser} />;

      case ViewState.SECURITY_AUDIT:
        return <SecurityAudit onBack={() => setView(ViewState.PROFILE)} />;

      case ViewState.QUIZ_UPLOAD:
      case ViewState.QUIZ_ACTIVE:
        return <QuizGenerator onBack={clearHistoryData} initialData={historyData} />;
      
      case ViewState.SUMMARY_UPLOAD:
      case ViewState.SUMMARY_ACTIVE:
        return <Summarizer onBack={clearHistoryData} initialData={historyData} />;
      
      case ViewState.FLASHCARDS_UPLOAD:
      case ViewState.FLASHCARDS_ACTIVE:
        return <FlashcardGenerator onBack={clearHistoryData} initialData={historyData} />;
      
      case ViewState.NOTES_UPLOAD:
      case ViewState.NOTES_ACTIVE:
        return <NotesGenerator onBack={clearHistoryData} initialData={historyData} />;

      case ViewState.HISTORY:
        return <History onBack={() => setView(ViewState.HOME)} onOpen={handleOpenHistoryItem} />;
      
      default:
        return <Home onChangeView={setView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView(ViewState.HOME)}>
              <div className="flex-shrink-0 flex items-center">
                 {/* Logo Icon */}
                 <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-sm">
                    S
                 </div>
                 <span className="font-bold text-xl text-slate-900 tracking-tight">StudyGenius</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
                 {view !== ViewState.HOME && view !== ViewState.AUTH && (
                    <button 
                        onClick={() => setView(ViewState.HOME)}
                        className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors"
                    >
                        Home
                    </button>
                 )}
                 
                 {user ? (
                     <div className="flex items-center ml-4">
                         <button 
                            onClick={() => setView(ViewState.PROFILE)}
                            className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold hover:ring-2 hover:ring-indigo-500 transition-all overflow-hidden"
                            title="Account Profile"
                         >
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                            ) : (
                                user.username[0].toUpperCase()
                            )}
                         </button>
                     </div>
                 ) : (
                     <button 
                        onClick={() => setView(ViewState.AUTH)}
                        className="text-sm font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md transition-colors"
                     >
                        Sign In
                     </button>
                 )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        {renderView()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-slate-400 text-sm">
             <p className="mb-2">Powered by Google Gemini AI</p>
             <div className="flex items-center gap-2 text-xs opacity-75">
                <Lock className="h-3 w-3" />
                <span>Secure • Private • Built for Students</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
