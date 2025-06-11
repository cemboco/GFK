import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, Link } from 'react-router-dom';
import { User, History, Settings, LogOut, MessageSquare, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Message {
  id: string;
  input_text: string;
  output_text: {
    observation: string;
    feeling: string;
    need: string;
    request: string;
  };
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'messages' | 'settings'>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error('Fehler beim Laden des Profils');
      }

      if (!profileData) {
        // If no profile exists, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: user.id }])
          .select()
          .maybeSingle();

        if (createError) {
          throw new Error('Fehler beim Erstellen des Profils');
        }

        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (messagesError) {
        throw new Error('Fehler beim Laden der GFK-Texte');
      }

      setMessages(messagesData || []);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Fehler beim Abmelden');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 bg-gray-50 p-6">
            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                <User className="h-5 w-5 mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'messages'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Meine GFK-Texte
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                <Settings className="h-5 w-5 mr-2" />
                Einstellungen
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Abmelden
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Profil</h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-lg">{profile?.full_name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Benutzername</label>
                      <p className="mt-1 text-lg">{profile?.username || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">E-Mail</label>
                      <p className="mt-1 text-lg">{profile?.email || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mitglied seit</label>
                      <p className="mt-1 text-lg">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('de-DE') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Meine GFK-Texte</h2>
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Ursprünglicher Text:</h3>
                        <p className="mt-2 text-gray-700">{message.input_text}</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-purple-700">Beobachtung:</h4>
                          <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: message.output_text.observation }} />
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-700">Gefühl:</h4>
                          <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: message.output_text.feeling }} />
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-700">Bedürfnis:</h4>
                          <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: message.output_text.need }} />
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-700">Bitte:</h4>
                          <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: message.output_text.request }} />
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleString('de-DE')}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500">
                      Noch keine GFK-Texte vorhanden.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
                <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Benachrichtigungen</h3>
                    <div className="mt-4 space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          defaultChecked
                        />
                        <span className="ml-2 text-gray-700">E-Mail-Benachrichtigungen</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Datenschutz</h3>
                    <div className="mt-4 space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          defaultChecked
                        />
                        <span className="ml-2 text-gray-700">Nutzungsdaten teilen</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Account löschen
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}