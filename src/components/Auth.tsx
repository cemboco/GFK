import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TermsModal from './TermsModal';
import PrivacyPolicy from './PrivacyPolicy';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Auth() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/profile');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    if (!acceptedTerms) {
      setError('Bitte akzeptieren Sie die AGB und die Datenschutzerklärung.');
      setIsLoading(false);
      return;
    }
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits. Bitte melden Sie sich an.');
        } else {
          setError(`Fehler bei der Registrierung: ${signUpError.message}`);
        }
        return;
      }

      if (user) {
        // Profile creation is handled by database trigger
        navigate('/profile');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError('Ungültige E-Mail oder Passwort.');
        return;
      }

      navigate('/profile');
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-8 bg-white rounded-xl shadow-lg">
      <div className="flex items-center mb-6">
        <Link 
          to="/" 
          className="text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 ml-auto mr-auto">
          {view === 'sign_in' ? 'Anmelden' : 'Registrieren'}
        </h2>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {view === 'sign_up' ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    required
                  />
                  <span>
                    Ich akzeptiere die{' '}
                    <button type="button" className="text-purple-600 underline" onClick={() => setShowTermsModal(true)}>AGB</button>
                    {' '}und die{' '}
                    <button type="button" className="text-purple-600 underline" onClick={() => setShowPrivacyModal(true)}>Datenschutzerklärung</button>
                  </span>
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 border border-transparent rounded-xl text-white ${
                  isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out font-medium`}
              >
                {isLoading ? 'Registrierung...' : 'Registrieren'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 border border-transparent rounded-xl text-white ${
                  isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out font-medium`}
              >
                {isLoading ? 'Anmeldung...' : 'Anmelden'}
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Oder</span>
              </div>
            </div>

            <button
              onClick={() => setView(view === 'sign_in' ? 'sign_up' : 'sign_in')}
              className="mt-4 w-full text-center text-sm text-purple-600 hover:text-purple-700"
            >
              {view === 'sign_in' 
                ? 'Noch kein Konto? Registrieren' 
                : 'Bereits registriert? Anmelden'}
            </button>
          </div>
        </div>
      </div>

      {/* Modals für AGB und Datenschutz */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyPolicy isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
}