import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { Users, Activity, Settings, Database, Loader2, Code, Image as ImageIcon } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Admin({ user }: { user: User | null }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'activity' | 'developer'>('overview');

  // Developer Profile State
  const [devProfile, setDevProfile] = useState({ 
    name: '', role: '', bio: '', imageUrl: '', skills: '',
    socialLinks: { github: '', twitter: '', linkedin: '', youtube: '', facebook: '', instagram: '', huggingface: '' }
  });
  const [devSaving, setDevSaving] = useState(false);
  const [devImage, setDevImage] = useState<File | null>(null);

  useKeyboardShortcuts({
    onSave: () => {
      if (tab === 'developer' && !devSaving) {
        saveDevProfile();
      }
    }
  });

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchData = async () => {
      try {
        const logsQ = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
        const logsSnapshot = await getDocs(logsQ);
        setLogs(logsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

        const usersQ = query(collection(db, 'users'), limit(50));
        const usersSnapshot = await getDocs(usersQ);
        setUsersList(usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

        const devDoc = await getDoc(doc(db, 'site_settings', 'developer_profile'));
        if (devDoc.exists()) {
          const data = devDoc.data();
          setDevProfile({
            name: data.name || '',
            role: data.role || '',
            bio: data.bio || '',
            imageUrl: data.imageUrl || '',
            skills: data.skills?.join(', ') || '',
            socialLinks: data.socialLinks || { github: '', twitter: '', linkedin: '', youtube: '', facebook: '', instagram: '', huggingface: '' }
          });
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
        toast.error("Failed to fetch admin data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const saveDevProfile = async (e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault();
    setDevSaving(true);
    const toastId = toast.loading('Saving developer profile...');
    try {
      let finalImageUrl = devProfile.imageUrl;
      if (devImage) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(devImage);
        finalImageUrl = await base64Promise;
      }

      const updatedProfile = {
        name: devProfile.name,
        role: devProfile.role,
        bio: devProfile.bio,
        imageUrl: finalImageUrl,
        skills: devProfile.skills.split(',').map(s => s.trim()).filter(Boolean),
        socialLinks: devProfile.socialLinks
      };

      await setDoc(doc(db, 'site_settings', 'developer_profile'), updatedProfile, { merge: true });
      setDevProfile(prev => ({ ...prev, imageUrl: finalImageUrl }));
      setDevImage(null);
      toast.success('Developer profile updated successfully!', { id: toastId });
    } catch (error) {
      console.error('Error saving developer profile:', error);
      toast.error('Failed to save profile. Please try again.', { id: toastId });
    } finally {
      setDevSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-200">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage users and monitor platform activity.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setTab('overview')} className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === 'overview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Database className="w-4 h-4" /> Overview
        </button>
        <button onClick={() => setTab('users')} className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === 'users' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Users className="w-4 h-4" /> Users
        </button>
        <button onClick={() => setTab('activity')} className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === 'activity' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Activity className="w-4 h-4" /> Activity Logs
        </button>
        <button onClick={() => setTab('developer')} className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 ${tab === 'developer' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Code className="w-4 h-4" /> Developer Profile
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
          
          {tab === 'overview' && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-6">Platform Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 rounded-2xl p-6">
                  <div className="text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-2"><Users className="w-5 h-5"/> Total Users</div>
                  <div className="text-4xl font-extrabold text-blue-900">{usersList.length}</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 rounded-2xl p-6">
                  <div className="text-emerald-600 dark:text-emerald-400 font-medium mb-2 flex items-center gap-2"><Activity className="w-5 h-5"/> Total Actions</div>
                  <div className="text-4xl font-extrabold text-emerald-900">{logs.length}</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`} alt="" className="w-8 h-8 rounded-full" />
                        <span className="font-medium text-slate-900 dark:text-slate-200">{u.displayName || 'Anonymous'}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-mono text-sm">{u.uid}</td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'activity' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="py-4 px-6">Action</th>
                    <th className="py-4 px-6">Details</th>
                    <th className="py-4 px-6">User ID</th>
                    <th className="py-4 px-6">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-200">{l.action}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm"><pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded">{JSON.stringify(l.details, null, 2)}</pre></td>
                      <td className="py-4 px-6 text-slate-400 font-mono text-sm">{l.userId}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">{l.timestamp?.toDate ? l.timestamp.toDate().toLocaleString() : 'Just now'}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">No activity logs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'developer' && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-6">Edit Developer Profile</h2>
              <form onSubmit={saveDevProfile} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Developer Name</label>
                  <input
                    type="text"
                    value={devProfile.name}
                    onChange={e => setDevProfile({...devProfile, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="E.g. MRC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role/Tagline</label>
                  <input
                    type="text"
                    value={devProfile.role}
                    onChange={e => setDevProfile({...devProfile, role: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="E.g. Building the ultimate PDF tools."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    value={devProfile.bio}
                    onChange={e => setDevProfile({...devProfile, bio: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Tell users about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={devProfile.skills}
                    onChange={e => setDevProfile({...devProfile, skills: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="React, TypeScript, Firebase, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    {devProfile.imageUrl && !devImage && (
                      <img src={devProfile.imageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700/50" />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      <span>{devImage ? devImage.name : 'Upload New Picture'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files && setDevImage(e.target.files[0])} />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['github', 'twitter', 'linkedin', 'youtube', 'facebook', 'instagram', 'huggingface'].map(network => (
                      <div key={network}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">{network}</label>
                        <input
                          type="url"
                          value={devProfile.socialLinks[network as keyof typeof devProfile.socialLinks] || ''}
                          onChange={e => setDevProfile({
                            ...devProfile,
                            socialLinks: { ...devProfile.socialLinks, [network]: e.target.value }
                          })}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          placeholder={`https://${network}.com/...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={devSaving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {devSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

        </motion.div>
      )}
    </div>
  );
}
