import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ParticleCanvas from './components/ParticleCanvas';
import CursorGlow from './components/CursorGlow';
import { TEAM_MEMBERS } from './constants';
import { Member, ViewState } from './types';
import { ArrowLeft, Instagram, ExternalLink, UserCog, Upload, Save, X, Lock, Key } from 'lucide-react';

const App: React.FC = () => {
  // State for members (allows editing)
  const [members, setMembers] = useState<Member[]>(TEAM_MEMBERS);
  
  const [view, setView] = useState<ViewState>('landing');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin / Edit State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Login Form State
  const [loginUser, setLoginUser] = useState<string>(members[0].id.toString());
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Editing Form State (Temporary holder for changes before save)
  const [editForm, setEditForm] = useState<Partial<Member>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Helper to calculate age from DOB
  const calculateAge = (dob: string | undefined): number | string => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) return "N/A";

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const handleMemberClick = (id: number) => {
    setSelectedMemberId(id);
    setView('profile');
    setIsEditing(false); // Reset edit mode when viewing as public
    setIsAdminLoggedIn(false); // Reset admin state when navigating normally
  };

  const handleBackToTeam = () => {
    setView('team');
    setIsAdminLoggedIn(false);
    setIsEditing(false);
  };

  // --- Login Logic ---
  const handleAdminClick = () => {
    setShowLoginModal(true);
    setLoginError('');
    setLoginPass('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find(m => m.id === parseInt(loginUser));
    
    if (targetMember && targetMember.password === loginPass) {
      // Success
      setShowLoginModal(false);
      setIsAdminLoggedIn(true);
      setSelectedMemberId(targetMember.id);
      
      // Initialize Edit Form
      setEditForm(targetMember);
      setIsEditing(true);
      setView('profile');
    } else {
      setLoginError('Invalid password');
    }
  };

  // --- Edit Logic ---
  const handleEditChange = (field: keyof Member, value: string | number) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditForm(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveChanges = () => {
    if (!selectedMemberId) return;
    
    setMembers(prevMembers => 
      prevMembers.map(m => 
        m.id === selectedMemberId ? { ...m, ...editForm } as Member : m
      )
    );
    setIsEditing(false);
    // Stay on profile page to view changes
  };

  const cancelEdit = () => {
    // Revert to original data
    if (selectedMember) {
      setEditForm(selectedMember);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg text-muted z-50 text-xl font-light tracking-widest">
        Preparing EDTA...
      </div>
    );
  }

  return (
    <>
      <ParticleCanvas />
      <CursorGlow />

      <div className="relative z-10 w-full h-full min-h-screen overflow-hidden font-sans text-muted selection:bg-gold1 selection:text-black">
        {/* Main View Router */}
        <AnimatePresence mode="wait">
          
          {/* LANDING VIEW */}
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-br from-gold1 via-gold2 to-yellow-800 animate-float mb-4 select-none drop-shadow-2xl">
                E D T A ³
              </h1>
              <p className="max-w-2xl text-lg md:text-xl opacity-90 mb-12 font-light">
                Portfolio of the group
              </p>
              <button
                onClick={() => setView('team')}
                className="bg-gradient-to-r from-gold1 to-gold2 text-black px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:-translate-y-1 hover:shadow-gold1/40 hover:scale-105 transition-all duration-200"
              >
                Explore
              </button>

              {/* Admin Login Button */}
              <button 
                onClick={handleAdminClick}
                className="absolute bottom-6 right-6 opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 text-xs md:text-sm bg-black/20 px-3 py-1 rounded-full border border-white/5"
              >
                <Lock size={12} /> Admin Login
              </button>
            </motion.div>
          )}

          {/* TEAM VIEW */}
          {view === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="absolute inset-0 flex flex-col items-center justify-start pt-16 md:pt-20 px-4 h-full overflow-y-auto"
            >
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8 shrink-0"
              >
                <h2 className="text-4xl md:text-6xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-br from-gold1 via-gold2 to-yellow-800 mb-2 drop-shadow-lg">
                   E D T A ³
                </h2>
                <p className="opacity-75">Meet the team — click a member to open profile</p>
              </motion.div>

              {/* Grid Layout to fit everyone on screen */}
              <div className="w-full max-w-5xl px-4 pb-8 flex justify-center items-center grow">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full">
                  {members.map((member) => (
                    <motion.div
                      layoutId={`card-container-${member.id}`}
                      key={member.id}
                      onClick={() => handleMemberClick(member.id)}
                      whileHover={{ y: -8 }}
                      className="group relative flex flex-col items-center p-4 bg-glass rounded-2xl cursor-pointer hover:shadow-2xl hover:shadow-gold1/10 transition-colors border border-transparent hover:border-gold1/20 w-full"
                    >
                      <motion.div 
                        layoutId={`member-image-${member.id}`}
                        className="relative w-24 h-24 md:w-32 md:h-32 mb-3 md:mb-4 rounded-xl overflow-hidden bg-zinc-800 shadow-lg"
                      >
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </motion.div>
                      <motion.h3 
                        layoutId={`member-name-${member.id}`}
                        className="font-bold text-base md:text-lg group-hover:text-gold1 transition-colors text-center"
                      >
                        {member.name}
                      </motion.h3>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 mb-8 flex flex-col items-center gap-4 shrink-0"
              >
                <button 
                  onClick={() => window.open('https://instagram.com', '_blank')}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold hover:-translate-y-1 hover:shadow-lg transition-all flex items-center gap-2 border border-white/10"
                >
                  <Instagram size={18} />
                  Visit EDTA Instagram
                </button>
                <button 
                  onClick={() => setView('landing')}
                  className="text-sm opacity-60 hover:opacity-100 hover:text-gold1 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back to Main
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* PROFILE VIEW (With Edit Mode) */}
          {view === 'profile' && selectedMember && (
            <motion.div
              key="profile"
              className="absolute inset-0 z-20 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Top Left Badge */}
              <AnimatePresence>
                {!isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="fixed top-6 left-6 z-30 flex items-center gap-4 pointer-events-none"
                  >
                    <motion.div
                        layoutId={`member-image-${selectedMember.id}`}
                        className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold1/30 shadow-xl"
                    >
                        <img src={selectedMember.image} alt={selectedMember.name} className="w-full h-full object-cover" />
                    </motion.div>
                    <motion.div
                        layoutId={`member-name-${selectedMember.id}`}
                        className="text-xl font-bold text-gold1 drop-shadow-md bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm"
                    >
                        {selectedMember.name}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content Container */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="min-h-full flex flex-col md:flex-row items-center md:items-start justify-center pt-32 pb-12 px-6 md:px-12 gap-12 max-w-6xl mx-auto"
              >
                {/* Profile Card Info */}
                <div className="flex-1 w-full max-w-2xl bg-glass p-8 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold1 to-gold2 opacity-50"></div>
                  
                  {/* ADMIN TOGGLE SWITCH */}
                  {isAdminLoggedIn && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="group flex items-center gap-3 bg-black/40 rounded-full p-1 pl-4 border border-white/10 hover:border-gold1/50 transition-all cursor-pointer shadow-lg"
                      >
                        <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${!isEditing ? 'text-gold1' : 'text-white/40 group-hover:text-white/70'}`}>
                          View
                        </span>
                        
                        {/* Switch Track */}
                        <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isEditing ? 'bg-gold1/20 border border-gold1' : 'bg-white/10 border border-white/20'}`}>
                          {/* Switch Thumb */}
                          <div className={`
                            absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300
                            ${isEditing ? 'translate-x-7 bg-gold1' : 'translate-x-1'}
                          `} />
                        </div>
                        
                        <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 pr-1 ${isEditing ? 'text-gold1' : 'text-white/40 group-hover:text-white/70'}`}>
                          Edit
                        </span>
                      </button>
                    </div>
                  )}

                  <AnimatePresence mode="wait" initial={false}>
                    {isEditing ? (
                      /* EDIT MODE FORM */
                      <motion.div 
                        key="edit-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-gold1 font-bold flex items-center gap-2"><UserCog size={20}/> Edit Details</h3>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs text-gold1/80 uppercase font-bold tracking-wider">Name</label>
                          <input 
                            type="text" 
                            value={editForm.name || ''} 
                            onChange={(e) => handleEditChange('name', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold1 focus:outline-none focus:ring-1 focus:ring-gold1"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gold1/80 uppercase font-bold tracking-wider">Description (About)</label>
                          <textarea 
                            value={editForm.about || ''} 
                            onChange={(e) => handleEditChange('about', e.target.value)}
                            rows={6}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold1 focus:outline-none focus:ring-1 focus:ring-gold1 resize-none"
                            placeholder="Write a description..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="text-xs text-gold1/80 uppercase font-bold tracking-wider">Date of Birth</label>
                                <span className="text-xs text-white/50">Calculated Age: <span className="text-white font-bold">{calculateAge(editForm.dob)}</span></span>
                              </div>
                              <input 
                                type="date" 
                                value={editForm.dob || ''} 
                                onChange={(e) => handleEditChange('dob', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold1 focus:outline-none focus:ring-1 focus:ring-gold1"
                              />
                          </div>
                          {/* Password Change Field */}
                          <div className="space-y-1">
                              <label className="text-xs text-gold1/80 uppercase font-bold tracking-wider">Change Password</label>
                               <div className="relative">
                                <input 
                                  type="text" 
                                  value={editForm.password || ''} 
                                  onChange={(e) => handleEditChange('password', e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 pl-9 text-white focus:border-gold1 focus:outline-none focus:ring-1 focus:ring-gold1"
                                  placeholder="New password"
                                />
                                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                              </div>
                          </div>
                        </div>

                         <div className="space-y-1">
                           <label className="text-xs text-gold1/80 uppercase font-bold tracking-wider">Instagram URL</label>
                          <input 
                            type="text" 
                            value={editForm.instagram || ''} 
                            onChange={(e) => handleEditChange('instagram', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold1 focus:outline-none focus:ring-1 focus:ring-gold1"
                          />
                        </div>
                      </motion.div>
                    ) : (
                      /* VIEW MODE */
                      <motion.div 
                        key="view-profile"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h2 className="text-4xl font-bold mb-6 text-white">{selectedMember.name}</h2>
                        
                        <div className="text-lg leading-relaxed opacity-90 mb-8 whitespace-pre-wrap min-h-[100px]">
                          {selectedMember.about ? selectedMember.about : <span className="text-white/30 italic">No description available.</span>}
                        </div>

                        <div className="space-y-2 border-t border-white/10 pt-6">
                          <div className="flex items-center gap-6">
                             <div className="flex items-center gap-2">
                              <span className="font-bold text-white">Age:</span>
                              <span className="opacity-80">{calculateAge(selectedMember.dob)}</span>
                            </div>
                          </div>
                         
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">Instagram:</span>
                            <a 
                              href={selectedMember.instagram} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-gold1 hover:text-white transition-colors flex items-center gap-1 underline underline-offset-4 decoration-gold1/30 break-all"
                            >
                              @{selectedMember.instagram.split('instagram.com/')[1]?.split('?')[0].replace('/','')} <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Side Image and Actions */}
                <div className="w-full md:w-80 flex flex-col gap-6 items-center shrink-0">
                  <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border border-gold1/20 bg-zinc-900 relative group">
                    <img 
                      src={isEditing ? (editForm.image || selectedMember.image) : selectedMember.image} 
                      alt={selectedMember.name} 
                      className={`w-full h-full object-cover transition-opacity ${isEditing ? 'opacity-50' : ''}`}
                    />
                    
                    {/* Image Upload Overlay */}
                    {isEditing && (
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-black/20 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <Upload size={32} className="text-gold1 mb-2" />
                          <span className="text-white font-bold text-sm">Click to Upload Photo</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col w-full gap-3 relative">
                    <AnimatePresence mode="wait" initial={false}>
                      {isEditing ? (
                          <motion.div 
                            key="edit-actions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full flex flex-col gap-3"
                          >
                              {/* Save Button with Theme Color */}
                              <button 
                                  onClick={saveChanges}
                                  className="w-full bg-gradient-to-r from-gold1 to-gold2 text-black hover:bg-gold1 py-3 rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5"
                              >
                                  <Save size={18} /> Save Changes
                              </button>
                               {/* Cancel Button with Neutral Theme */}
                               <button 
                                  onClick={cancelEdit}
                                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2"
                              >
                                  <X size={18} /> Cancel
                              </button>
                          </motion.div>
                      ) : (
                          <motion.div 
                            key="view-actions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full flex flex-col gap-3"
                          >
                              <button 
                              onClick={() => window.open(selectedMember.instagram, '_blank')}
                              className="w-full bg-gradient-to-r from-gold1 to-gold2 text-black py-3 rounded-xl font-bold shadow-lg hover:translate-y-[-2px] hover:shadow-gold1/30 transition-all flex justify-center items-center gap-2"
                              >
                              <Instagram size={18} /> Open Instagram
                              </button>
                              <button 
                              onClick={handleBackToTeam}
                              className="w-full bg-white/5 text-white border border-white/10 py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
                              >
                              Back to Team
                              </button>
                          </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* LOGIN MODAL - Separate AnimatePresence so it doesn't unmount main view */}
        <AnimatePresence>
          {showLoginModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLoginModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#0f0f11] border border-gold1/30 p-8 rounded-2xl w-full max-w-sm shadow-2xl relative z-10"
              >
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-gold1 mb-6 text-center">Member Login</h2>
                
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Select Member</label>
                    <select 
                      value={loginUser} 
                      onChange={(e) => setLoginUser(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold1 focus:outline-none appearance-none"
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Password</label>
                    <input 
                      type="password" 
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold1 focus:outline-none"
                      placeholder="Enter password"
                    />
                  </div>

                  {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

                  <button 
                    type="submit"
                    className="w-full bg-gold1 text-black font-bold py-3 rounded-xl mt-4 hover:bg-gold2 transition-colors"
                  >
                    Login to Edit
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default App;