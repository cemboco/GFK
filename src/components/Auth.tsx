import React, { useState } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Auth() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    setError('');
    
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      // First check if the user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', email.split('@')[0])
        .single();

      if (existingUser) {
        setError('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits. Bitte melden Sie sich an.');
        return;
      }

      // Proceed with sign up
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
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

      if (authData.user) {
        // Wait a brief moment to ensure the auth session is established
        await new Promise(resolve => setTimeout(resolve, 500));

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: name,
              username: email.split('@')[0],
              created_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError.message);
          setError('Fehler beim Erstellen des Profils. Bitte versuchen Sie es später erneut.');
          return;
        }

        navigate('/');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
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
          Anmelden oder Registrieren
        </h2>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
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
                type="password"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 border border-transparent rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out font-medium"
            >
              Registrieren
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Oder</span>
              </div>
            </div>

            <SupabaseAuth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#7C3AED',
                      brandAccent: '#6D28D9',
                    },
                  },
                },
                className: {
                  input: 'w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition duration-150 ease-in-out',
                  button: 'w-full py-3 px-4 border border-transparent rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out font-medium',
                  label: 'block text-sm font-medium text-gray-700 mb-1',
                }
              }}
              providers={[]}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'E-Mail',
                    password_label: 'Passwort',
                    button_label: 'Anmelden',
                    loading_button_label: 'Anmeldung...',
                    link_text: 'Bereits registriert? Anmelden',
                  },
                  sign_up: {
                    email_label: 'E-Mail',
                    password_label: 'Passwort',
                    button_label: 'Registrieren',
                    loading_button_label: 'Registrierung...',
                    link_text: 'Noch kein Konto? Registrieren',
                  },
                },
              }}
              view="sign_in"
            />
          </div>
        </div>
      </div>
    </div>
  );
}