import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Settings, LogOut, 
  TrendingUp, Activity, AlertCircle, Trash2, ShieldCheck, Plus, Sparkles, UserPlus, Image as ImageIcon, Link, Loader2, Inbox, Mail, Menu, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchAdminStats, fetchAllUsers, deleteUserOp, toggleUserStatusOp, 
  generateCommunityReport, UserProfile, fetchMentors, addMentorOp, deleteMentorOp, Mentor,
  fetchMessages, deleteMessageOp, ContactMessage
} from '../services/adminService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'mentors' | 'messages' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data States
  const [stats, setStats] = useState<any>(null);
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [mentorList, setMentorList] = useState<Mentor[]>([]);
  const [messageList, setMessageList] = useState<ContactMessage[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Mentor Form State
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [newMentor, setNewMentor] = useState({ name: '', specialization: '', imageUrl: '', bio: '' });
  const [submittingMentor, setSubmittingMentor] = useState(false);

  // Auth Guard
  useEffect(() => {
    const session = localStorage.getItem('eunoia_admin_session');
    if (!session) navigate('/admin');
  }, [navigate]);

  // Initial Data Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, u, m, msg] = await Promise.all([
        fetchAdminStats(),
        fetchAllUsers(),
        fetchMentors(),
        fetchMessages()
      ]);
      setStats(s);
      setUserList(u);
      setMentorList(m);
      setMessageList(msg);
    } catch (e) {
      console.error("Failed to load admin data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eunoia_admin_session');
    navigate('/admin');
  };

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    const report = await generateCommunityReport();
    setAiReport(report);
    setLoadingAi(false);
  };

  const handleAddMentor = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmittingMentor(true);
      await addMentorOp(newMentor);
      setNewMentor({ name: '', specialization: '', imageUrl: '', bio: '' });
      setShowAddMentor(false);
      setSubmittingMentor(false);
      loadData(); // Refresh list
  };

  const handleDeleteMentor = async (id: string) => {
      if(window.confirm('Are you sure you want to remove this mentor?')) {
          await deleteMentorOp(id);
          loadData();
      }
  };

  const handleDeleteUser = async (id: string) => {
    if(window.confirm('Delete this user? Data cannot be recovered.')) {
        await deleteUserOp(id);
        loadData();
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if(window.confirm('Delete this message?')) {
        await deleteMessageOp(id);
        loadData();
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
      await toggleUserStatusOp(id, currentStatus);
      loadData();
  };

  // Close mobile menu when tab changes
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center sticky top-0 z-30">
         <div className="font-serif font-bold text-purple-600 dark:text-purple-400 tracking-wider">EUNOIA ADMIN</div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen
      `}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 hidden md:block">
          <h1 className="text-xl font-bold font-serif tracking-wider text-purple-600 dark:text-purple-400">EUNOIA <span className="text-xs text-gray-500 font-sans block mt-1">Admin Console</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Overview
          </button>
          <button 
            onClick={() => handleTabChange('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Users className="w-5 h-5" /> Users
          </button>
          <button 
            onClick={() => handleTabChange('mentors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'mentors' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <UserPlus className="w-5 h-5" /> Mentors
          </button>
          <button 
            onClick={() => handleTabChange('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'messages' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Inbox className="w-5 h-5" /> Messages
          </button>
          <button 
            onClick={() => handleTabChange('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full w-full">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold">Dashboard Overview</h2>
                <div className="text-sm text-gray-500">Database: Firestore</div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">Total Seekers</h3>
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-4xl font-bold">{stats.totalUsers}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">New Messages</h3>
                  <MessageSquare className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="text-4xl font-bold">{stats.totalMessages}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">System Health</h3>
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-4xl font-bold text-green-500">100%</div>
              </div>
            </div>

            {/* AI Insight Section */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg md:text-xl font-bold">Gemini Community Intelligence</h3>
              </div>
              
              {!aiReport ? (
                <div className="text-center py-8">
                  <p className="text-purple-200 mb-6 max-w-lg mx-auto text-sm md:text-base">Generate a real-time psychographic analysis of your user base using Gemini 2.5 Flash.</p>
                  <button 
                    onClick={handleGenerateReport}
                    disabled={loadingAi}
                    className="px-6 py-3 bg-white text-purple-900 rounded-full font-bold hover:bg-purple-100 transition-colors disabled:opacity-50 text-sm md:text-base"
                  >
                    {loadingAi ? 'Analyzing Patterns...' : 'Generate Insight Report'}
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20">
                    <p className="whitespace-pre-wrap leading-relaxed font-light text-base md:text-lg">{aiReport}</p>
                  </div>
                  <button onClick={() => setAiReport('')} className="mt-4 text-sm text-purple-300 hover:text-white underline">Refresh Analysis</button>
                </div>
              )}
            </div>

            {/* Visual Charts */}
            {stats.totalUsers > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                      <h3 className="font-bold mb-6">Archetype Distribution</h3>
                      <div className="space-y-4">
                        {Object.entries(stats.archetypeDistribution).map(([name, count]) => (
                          <div key={name}>
                             <div className="flex justify-between text-sm mb-1">
                               <span>{name}</span>
                               <span className="font-bold">{count as number}</span>
                             </div>
                             <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                               <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(Number(count) / stats.totalUsers) * 100}%` }}></div>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                      <h3 className="font-bold mb-6">Temperament Matrix</h3>
                      <div className="grid grid-cols-2 gap-4">
                         {Object.entries(stats.temperamentDistribution).map(([name, count]) => (
                            <div key={name} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{count as number}</div>
                                <div className="text-xs uppercase tracking-wider text-gray-500 break-words">{name}</div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
           <div className="space-y-6 animate-fade-in pb-20">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl md:text-3xl font-bold">User Management</h2>
                <button onClick={loadData} className="text-sm text-purple-500 hover:text-purple-400">Refresh List</button>
              </div>
              
              {userList.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                      <p className="text-gray-500">No registered users found in the database.</p>
                  </div>
              ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-6 py-4">Seeker</th>
                          <th className="px-6 py-4">Archetype</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {userList.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm md:text-base">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-500 mt-1">{user.joinedDate}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs whitespace-nowrap">
                                {user.archetype?.archetype || 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`text-xs font-bold ${user.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                                 {user.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => handleToggleStatus(user.id, user.status)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                                    title="Toggle Status"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              )}
           </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
           <div className="space-y-6 animate-fade-in pb-20">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl md:text-3xl font-bold">Inbox</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{messageList.length} Messages</span>
                    <button onClick={loadData} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
              </div>

              {messageList.length === 0 ? (
                  <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <Inbox className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">No messages yet</p>
                      <p className="text-sm text-gray-500">Inquiries from the contact form will appear here.</p>
                  </div>
              ) : (
                  <div className="grid gap-4">
                      {messageList.map((msg) => (
                          <div key={msg.id} className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-purple-500/50 transition-colors">
                              <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-2">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold shrink-0">
                                          {msg.name.charAt(0)}
                                      </div>
                                      <div className="overflow-hidden">
                                          <h4 className="font-bold text-gray-900 dark:text-white truncate">{msg.name}</h4>
                                          <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                                              <Mail className="w-3 h-3" />
                                              {msg.email}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex flex-row md:flex-col items-end gap-2 w-full md:w-auto justify-between md:justify-start">
                                      <span className="text-xs text-gray-400">{msg.date}</span>
                                      <button 
                                        onClick={() => handleDeleteMessage(msg.id)}
                                        className="text-red-400 hover:text-red-500 p-1"
                                        title="Delete Message"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                              <div className="pl-0 md:pl-13">
                                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap text-sm md:text-base">{msg.message}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
           </div>
        )}

        {/* MENTORS TAB */}
        {activeTab === 'mentors' && (
          <div className="space-y-6 animate-fade-in pb-20">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <h2 className="text-2xl md:text-3xl font-bold">Mentor Management</h2>
               <button 
                onClick={() => setShowAddMentor(!showAddMentor)}
                className="w-full md:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-purple-700"
               >
                 {showAddMentor ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Mentor</>}
               </button>
             </div>
             
             {/* Add Mentor Form */}
             {showAddMentor && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-purple-500 dark:border-purple-500/50 shadow-lg mb-8 animate-fade-in">
                    <h3 className="font-bold text-lg mb-4">Add New Mentor</h3>
                    <form onSubmit={handleAddMentor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Mentor Name</label>
                            <input 
                                required
                                value={newMentor.name}
                                onChange={e => setNewMentor({...newMentor, name: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                placeholder="Dr. Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Specialization</label>
                            <input 
                                required
                                value={newMentor.specialization}
                                onChange={e => setNewMentor({...newMentor, specialization: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                placeholder="e.g. Creative Direction, Anxiety Management"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Profile Image Link</label>
                             <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Link className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input 
                                        required
                                        value={newMentor.imageUrl}
                                        onChange={e => setNewMentor({...newMentor, imageUrl: e.target.value})}
                                        className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                             </div>
                             <p className="text-xs text-gray-400 mt-1">Paste a direct URL to an image (JPG/PNG).</p>
                        </div>
                        <button 
                            type="submit" 
                            disabled={submittingMentor}
                            className="md:col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
                        >
                            {submittingMentor ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Mentor'}
                        </button>
                    </form>
                </div>
             )}

             {/* Mentors List */}
             {mentorList.length === 0 ? (
                 <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <p className="text-gray-500">No mentors added yet. Add one to display on the User Dashboard.</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentorList.map(mentor => (
                        <div key={mentor.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                            <div className="h-48 overflow-hidden bg-gray-100 relative">
                                <img src={mentor.imageUrl} alt={mentor.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image')} />
                                <button 
                                    onClick={() => handleDeleteMentor(mentor.id)}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 flex-1">
                                <h4 className="font-bold text-lg">{mentor.name}</h4>
                                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-2">{mentor.specialization}</p>
                            </div>
                        </div>
                    ))}
                 </div>
             )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in max-w-2xl pb-20">
            <h2 className="text-2xl md:text-3xl font-bold">System Settings</h2>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-bold mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-purple-500"/> Admin Management</h3>
              <div className="space-y-4">
                 <div className="flex flex-col md:flex-row gap-2">
                    <input type="text" placeholder="New Admin Email" className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700" />
                    <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold">Add</button>
                 </div>
                 <p className="text-xs text-gray-500">Note: New admins must be verified via main console.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
               <h3 className="font-bold mb-4">Global Switches</h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <div>
                      <div className="font-medium">Maintenance Mode</div>
                      <div className="text-xs text-gray-500">Disable access for all non-admin users</div>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                       <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;