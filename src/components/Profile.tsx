import { supabase } from '../supabaseClient';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, History, Settings, LogOut, MessageSquare, Edit2, Save, X, Home, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatUsage } from '../hooks/useChatUsage';
import GFKProgress from './GFKProgress';
import { useLanguage } from '../contexts/LanguageContext';

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

interface ProfileProps {
  user: any;
  onSignOut: () => void;
}

export default function Profile({ user, onSignOut }: ProfileProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'messages' | 'settings'>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedUsername, setEditedUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      navigate('/auth');
    }
  }, [user]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
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
          .insert([{ 
            id: user.id,
            username: user.email?.split('@')[0] || '',
            full_name: user.user_metadata?.full_name || ''
          }])
          .select()
          .maybeSingle();

        if (createError) {
          throw new Error('Fehler beim Erstellen des Profils');
        }

        setProfile(newProfile);
        setEditedName(newProfile?.full_name || '');
        setEditedUsername(newProfile?.username || '');
      } else {
        setProfile(profileData);
        setEditedName(profileData.full_name || '');
        setEditedUsername(profileData.username || '');
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

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs
      if (!editedName.trim()) {
        throw new Error('Name darf nicht leer sein');
      }

      if (!editedUsername.trim()) {
        throw new Error('Benutzername darf nicht leer sein');
      }

      // Check if username is already taken (excluding current user)
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', editedUsername.trim())
        .neq('id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Fehler beim Überprüfen des Benutzernamens');
      }

      if (existingUser) {
        throw new Error('Dieser Benutzername ist bereits vergeben');
      }

      // Update profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: editedName.trim(),
          username: editedUsername.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Fehler beim Speichern des Profils');
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Profil erfolgreich aktualisiert!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(profile?.full_name || '');
    setEditedUsername(profile?.username || '');
    setError(null);
  };

  const handleSignOut = async () => {
    await onSignOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mit Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{t.profile.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-50 p-6">
              <div className="space-y-4">
                {/* Navigation zur Hauptseite in der Sidebar */}
                <Link
                  to="/"
                  className="w-full flex items-center px-4 py-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors border border-purple-200"
                >
                  <Home className="h-5 w-5 mr-2" />
                  {t.profile.messages.backToHome}
                </Link>
                
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    <User className="h-5 w-5 mr-2" />
                    {t.profile.title}
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
                    {t.profile.messages.title}
                    {messages.length > 0 && (
                      <span className="ml-auto bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                        {messages.length}
                      </span>
                    )}
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
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200"
                >
                  {success}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{t.profile.title}</h2>
                    {!isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </motion.button>
                    )}
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder={t.profile.namePlaceholder}
                          />
                        ) : (
                          <p className="text-lg text-gray-900">{profile?.full_name || 'Nicht angegeben'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Benutzername</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Ihr Benutzername"
                          />
                        ) : (
                          <p className="text-lg text-gray-900">{profile?.username || 'Nicht angegeben'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail</label>
                        <p className="text-lg text-gray-900">{user?.email || 'Nicht verfügbar'}</p>
                        <p className="text-sm text-gray-500 mt-1">E-Mail kann nicht geändert werden</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mitglied seit</label>
                        <p className="text-lg text-gray-900">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}
                        </p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 flex items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                            isSaving && 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? 'Speichert...' : 'Speichern'}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Abbrechen
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* GFK Level System Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8"
                  >
                    <GFKProgress user={user} />
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'messages' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{t.profile.messages.title}</h2>
                    <Link
                      to="/"
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Neue GFK-Transformation
                    </Link>
                  </div>
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div key={message.id} className="bg-gray-50 rounded-xl p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium text-gray-900">{t.profileMessages.originalText}</h3>
                          <p className="mt-2 text-gray-700">{message.input_text}</p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-purple-700">{t.profileMessages.observation}</h4>
                            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: message.output_text.observation }} />
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-700">{t.profileMessages.feeling}</h4>
                            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: message.output_text.feeling }} />
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-700">{t.profileMessages.need}</h4>
                            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: message.output_text.need }} />
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-700">{t.profileMessages.request}</h4>
                            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: message.output_text.request }} />
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleString('de-DE')}
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>{t.profileMessages.noMessages}</p>
                        <p className="text-sm mt-2">{t.profileMessages.noMessagesDescription}</p>
                        <Link
                          to="/"
                          className="inline-flex items-center mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          {t.profileMessages.backToHome}
                        </Link>
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
    </div>
  );
}