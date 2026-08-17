import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Github, Twitter, Linkedin, Mail, Send, CheckCircle2, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const HuggingFaceIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5.5 11.5A6.5 6.5 0 0 1 12 5a6.5 6.5 0 0 1 6.5 6.5" />
    <path d="M19 11v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M12 16a3.5 3.5 0 0 0 3-1.5" />
    <path d="M3 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
    <path d="M21 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
  </svg>
);

export default function Developer() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'site_settings', 'developer_profile');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile(snap.data());
        }
      } catch (error) {
        console.error("Failed to load developer profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus('submitting');
    // Simulate sending
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  const socials = [
    { icon: MessageCircle, label: 'WhatsApp', url: '#', color: 'bg-green-500' },
    { icon: Youtube, label: 'YouTube', url: '#', color: 'bg-red-600' },
    { icon: Github, label: 'GitHub', url: '#', color: 'bg-slate-900' },
    { icon: Twitter, label: 'X (Twitter)', url: '#', color: 'bg-slate-800' },
    { icon: Facebook, label: 'Facebook', url: '#', color: 'bg-blue-600' },
    { icon: Instagram, label: 'Instagram', url: '#', color: 'bg-pink-600' },
    { icon: Linkedin, label: 'LinkedIn', url: '#', color: 'bg-blue-700' },
    { icon: HuggingFaceIcon, label: 'Hugging Face', url: '#', color: 'bg-amber-500' }
  ];

  const defaultSkills = ['React', 'TypeScript', 'Firebase', 'Tailwind CSS', 'Node.js', 'Python', 'AI/ML'];
  const skills = profile?.skills?.length > 0 ? profile.skills : defaultSkills;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800/90 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden"
      >
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-600 p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            {profile?.imageUrl ? (
              <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-white dark:bg-slate-800/90">
                <img src={profile.imageUrl} alt="Developer" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white/30 shadow-2xl">
                <span className="text-2xl font-bold tracking-tight">MRC.dev</span>
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{profile?.name || 'MRC'}</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium">{profile?.role || 'Building the ultimate PDF tools.'}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-12">
          
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-4">About Me</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">
              {profile?.bio || "Hi, I'm MRC, the developer behind PDF AI. I'm passionate about building tools that make a real difference, optimizing complex workflows, and crafting beautiful, lightning-fast digital experiences."}
            </p>
          </div>

          <div className="mb-12">
            <h3 className="text-center font-bold text-slate-400 mb-6 uppercase tracking-widest text-sm">Skills & Technologies</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {skills.map((skill: string, idx: number) => (
                <span key={idx} className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-100 dark:border-slate-800 font-medium hover:bg-blue-50 transition-colors cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {profile?.socialLinks && Object.values(profile.socialLinks).some(url => url) && (
            <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-center font-bold text-slate-400 mb-8 uppercase tracking-widest text-sm">Connect with Me</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {socials.filter(s => {
                  const linkKey = s.label === 'X (Twitter)' ? 'twitter' : s.label === 'Hugging Face' ? 'huggingface' : s.label.toLowerCase();
                  return profile.socialLinks[linkKey];
                }).map((social, idx) => {
                  const Icon = social.icon;
                  // Map the label to the key in socialLinks
                  const linkKey = social.label === 'X (Twitter)' ? 'twitter' : social.label === 'Hugging Face' ? 'huggingface' : social.label.toLowerCase();
                  const url = profile.socialLinks[linkKey];
                  
                  if (!url) return null;
                  
                  return (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-100 hover:shadow-md transition-all group min-w-[120px] sm:min-w-[140px]">
                      <div className={`w-12 h-12 ${social.color} text-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900">{social.label === 'X (Twitter)' ? 'Twitter' : social.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Form */}
          <div className="pt-16 mt-12 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">Get In Touch</h3>
                <p className="text-slate-500 dark:text-slate-400">Have a question or want to collaborate? Send me a message!</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 dark:bg-slate-900/50 focus:bg-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email *</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 dark:bg-slate-900/50 focus:bg-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 dark:bg-slate-900/50 focus:bg-white"
                    placeholder="What is this regarding?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message *</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 dark:bg-slate-900/50 focus:bg-white resize-none"
                    placeholder="Write your message here..."
                  />
                </div>
                
                {status === 'success' ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 py-4 rounded-xl font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Message sent successfully!
                  </div>
                ) : (
                  <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70"
                  >
                    {status === 'submitting' ? 'Sending...' : (
                      <>
                        <Send className="w-5 h-5" /> Send Message
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
