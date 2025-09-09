import React,{useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'
import {useAuth} from '../authContext';

const Auth = () => {
    const {user, setUser} = useAuth()
    const navigate = useNavigate()
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false)
    const [isSignup, setisSignup] = useState(false)
    const [message,setMessage] = useState('')

    useEffect(() => {
      if (user){navigate('/home')}
    },[user, navigate])

    const checkIfEmailExists = async (email) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: 'dummy123' // just any wrong password
    });

    if (error && error.message.includes('Invalid login credentials')) {
        return true; // Email exists, password is wrong
    }

    return false;
    };
    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try{
            let response;
            if (isSignup) {
                const exists = await checkIfEmailExists(email);
                if (exists) {
                    setMessage('Email already in use. Please sign in.');
                    setLoading(false);
                    return;
                }
                const {data, error} = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                    data: {
                        username: username 
                    }
                    }
                })
                if (error) throw error;
                setMessage("Check your email for confirmation link")
            }else{
                const {data, error} = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error;
                setMessage('Signed in successfully')
            }         
        } catch (error) {
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
            {isSignup ? 'Create your account' : 'SIGN IN'}
          </h2>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleAuth}>
          <div>
            {isSignup && <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="relative block mb-5 w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-800 focus:border-gray-800"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            </div>}
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-800 focus:border-gray-800"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-800 focus:border-gray-800"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-gray-800 hover:text-gray-600"
              onClick={() => setisSignup(!isSignup)}
            >
              {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          {message && (
            <div className={`text-center text-sm ${message.includes('error') || message.includes('Invalid') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
}

export default Auth;