import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Check your email for the login link!');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900">
      <h2 className="text-2xl font-bold mb-4">Login to SparkCRM</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Your email"
          className="border px-4 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Send Magic Link
        </button>
      </form>
    </div>
  );
}
