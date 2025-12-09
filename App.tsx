import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { User, Lead, LeadStatus, AuthState } from './types';
import { FileUpload } from './components/FileUpload';
import { Button } from './components/Button';
import { CallModal } from './components/CallModal';
import { authService } from './services/authService';
import { LogOut, Phone, User as UserIcon, CalendarCheck, FileText, LayoutDashboard, Shield, Loader2, AlertCircle, Sun, Moon } from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Theme Context ---
type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {} });

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark'; // Default to dark for Black Cygnet brand
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

// Common Input Styles for consistency
const INPUT_STYLES = "appearance-none block w-full px-4 py-3 border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-lg shadow-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition-all";

// --- Auth Component ---
const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user: User;
      if (isLogin) {
        user = await authService.login(email, password);
      } else {
        if (!name) throw new Error("Name is required.");
        user = await authService.register(name, email, password);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 dark:from-zinc-800 dark:via-white dark:to-zinc-800 opacity-20"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-black p-4 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <Shield className="h-10 w-10 text-black dark:text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Black Cygnet
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500 uppercase tracking-widest font-medium">
          Client Relationship Manager
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-black/50 backdrop-blur-sm py-8 px-10 shadow-xl dark:shadow-2xl border border-zinc-200 dark:border-zinc-800 sm:rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
                <div className="mt-1">
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={INPUT_STYLES}
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Email</label>
              <div className="mt-1">
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_STYLES}
                  placeholder="name@blackcygnet.co.za"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Password</label>
              <div className="mt-1">
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT_STYLES}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary"
              className="w-full justify-center py-3 font-semibold tracking-wide"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-600 uppercase text-xs tracking-widest">Or</span>
              </div>
            </div>

            <div className="mt-8 text-center">
               <button 
                onClick={toggleMode}
                disabled={isLoading}
                className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white text-sm transition-colors font-medium"
               >
                 {isLogin ? 'Create a new account' : 'Sign in to existing account'}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Component ---
const Dashboard = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [stats, setStats] = useState({ total: 0, booked: 0, calls: 0 });

  // Load leads from local storage on mount
  useEffect(() => {
    const savedLeads = localStorage.getItem(`leads_${user.id}`);
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    }
  }, [user.id]);

  // Update stats whenever leads change
  useEffect(() => {
    setStats({
      total: leads.length,
      booked: leads.filter(l => l.status === LeadStatus.BOOKED).length,
      calls: leads.filter(l => l.status !== LeadStatus.NEW).length
    });
    localStorage.setItem(`leads_${user.id}`, JSON.stringify(leads));
  }, [leads, user.id]);

  const handleDataLoaded = (newLeads: Lead[]) => {
    setLeads(newLeads);
  };

  const handleUpdateStatus = (leadId: string, status: LeadStatus, notes?: string) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { 
          ...lead, 
          status, 
          notes: notes || lead.notes,
          lastContacted: new Date().toISOString()
        };
      }
      return lead;
    }));
  };

  const statusStyles = (status: LeadStatus) => {
    switch(status) {
      case LeadStatus.NEW: return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900';
      case LeadStatus.BOOKED: return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900';
      case LeadStatus.RESCHEDULED: return 'bg-zinc-200 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600';
      case LeadStatus.CANCELLED: return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900';
      case LeadStatus.NO_ANSWER: return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900';
      case LeadStatus.CALLED: return 'bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-black dark:bg-white p-2 rounded-lg shadow-sm">
                <Shield className="h-5 w-5 text-white dark:text-black" />
             </div>
             <span className="text-xl font-bold text-black dark:text-white tracking-tight">BLACK CYGNET</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <ThemeToggle />
            <div className="hidden md:flex flex-col items-end">
               <span className="text-sm font-medium text-zinc-900 dark:text-white">{user.name}</span>
               <span className="text-xs text-zinc-500">{user.email}</span>
            </div>
            <button 
              onClick={onLogout}
              className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {leads.length === 0 ? (
           <div className="mt-12 flex flex-col items-center justify-center animate-fade-in-up">
             <div className="text-center mb-12">
               <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6 tracking-tight">Welcome, Agent {user.name.split(' ')[0]}</h2>
               <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                 Begin your outreach campaign. Import your lead list to generate AI-tailored scripts specifically designed for Black Cygnet's premium life insurance solutions.
               </p>
             </div>
             <FileUpload onDataLoaded={handleDataLoaded} />
           </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Leads', value: stats.total, icon: LayoutDashboard, color: 'text-zinc-900 dark:text-white' },
                { label: 'Calls Attempted', value: stats.calls, icon: Phone, color: 'text-zinc-500 dark:text-zinc-400' },
                { label: 'Consultations Booked', value: stats.booked, icon: CalendarCheck, color: 'text-zinc-900 dark:text-white' }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-lg transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm transition-colors duration-300">
               <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                 <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Active Leads</h3>
                 <Button variant="outline" size="sm" onClick={() => setLeads([])} className="text-xs">
                   IMPORT NEW LIST
                 </Button>
               </div>
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                   <thead className="bg-zinc-50 dark:bg-black/40">
                     <tr>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phone Number</th>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">ID Number</th>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email Address</th>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                       <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                     {leads.map((lead) => (
                       <tr key={lead.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm font-bold text-zinc-900 dark:text-white transition-colors">{lead.name}</div>
                           {lead.company && <div className="text-xs text-zinc-500 mt-0.5">{lead.company}</div>}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-zinc-600 dark:text-zinc-300 font-mono">{lead.phone || '-'}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-600 dark:text-zinc-300 font-mono">{lead.idNumber || '-'}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-600 dark:text-zinc-300">{lead.email || '-'}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-bold uppercase tracking-wide rounded-sm border ${statusStyles(lead.status)}`}>
                             {lead.status === LeadStatus.NO_ANSWER ? 'NO ANSWER' : lead.status}
                           </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <Button 
                              size="sm" 
                              variant={lead.status === LeadStatus.NEW ? 'primary' : 'outline'}
                              onClick={() => setActiveLead(lead)}
                              className="w-24 justify-center"
                            >
                              {lead.status === LeadStatus.NEW ? 'CALL' : 'VIEW'}
                           </Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {activeLead && (
        <CallModal 
          lead={activeLead} 
          userName={user.name}
          onClose={() => setActiveLead(null)} 
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

// --- Main App & Router Wrapper ---
const AppContainer = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) return null;

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default AppContainer;