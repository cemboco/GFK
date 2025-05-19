import React from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Auth() {
  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        Anmelden oder Registrieren
      </h2>
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
      />
    </div>
  );
}