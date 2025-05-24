import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [profile, setProfile] = useState<any>(null);
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
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Fehler beim Laden der Benutzerdaten');
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
                      <p className="mt-1 text-lg">{profile?.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Benutzername</label>
                      <p className="mt-1 text-lg">{profile?.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">E-Mail</label>
                      <p className="mt-1 text-lg">{profile?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mitglied seit</label>
                      <p className="mt-1 text-lg">
                        {new Date(profile?.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
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