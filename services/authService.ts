import { User } from '../types';

// Keys for LocalStorage
const USERS_DB_KEY = 'bc_users_db';
const SESSION_KEY = 'bc_current_session';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface StoredUser extends User {
  password: string; // In a real app, this would be hashed.
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (name: string, email: string, password: string): Promise<User> => {
    await delay(800); // Simulate API latency

    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    
    // Check if user exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password // Storing strictly for this demo. Never store plain text passwords in production.
    };

    users.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    
    // Auto-login after register
    const { password: _, ...userSession } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
    
    return userSession;
  },

  /**
   * Login an existing user
   */
  login: async (email: string, password: string): Promise<User> => {
    await delay(800); // Simulate API latency

    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Create session object (exclude password)
    const { password: _, ...userSession } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));

    return userSession;
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Get current session on app load
   */
  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};