import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ConfigAuthContextType {
    isAuthenticated: boolean;
    authToken: string | null;
    isCheckingAuth: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const ConfigAuthContext = createContext<ConfigAuthContextType | undefined>(undefined);

export function ConfigAuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Check and restore authentication state on mount
    useEffect(() => {
        const checkAuth = async () => {
            setIsCheckingAuth(true);
            const stored = localStorage.getItem('config_auth');

            if (stored) {
                try {
                    const authData = JSON.parse(stored);
                    const sessionLifetime = 8 * 60 * 60 * 1000;
                    const elapsed = Date.now() - authData.timestamp;

                    if (elapsed > sessionLifetime) {
                        localStorage.removeItem('config_auth');
                        setIsCheckingAuth(false);
                        return;
                    }

                    const response = await fetch('/api/config/verify', {
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${authData.token}`,
                        },
                    });

                    if (response.ok) {
                        setAuthToken(authData.token);
                        setIsAuthenticated(true);
                        
                        const refreshed = { ...authData, timestamp: Date.now() };
                        localStorage.setItem('config_auth', JSON.stringify(refreshed));
                    } else {
                        localStorage.removeItem('config_auth');
                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                    localStorage.removeItem('config_auth');
                }
            }

            setIsCheckingAuth(false);
        };

        checkAuth();
    }, []);

    // Persist to localStorage when auth state changes
    useEffect(() => {
        if (isAuthenticated && authToken) {
            const authData = {
                isAuthenticated: true,
                token: authToken,
                timestamp: Date.now(),
            };
            localStorage.setItem('config_auth', JSON.stringify(authData));
        } else {
            localStorage.removeItem('config_auth');
        }
    }, [isAuthenticated, authToken]);

    // Check session expiration periodically
    useEffect(() => {
        if (!isAuthenticated) return;

        const checkSessionExpiration = () => {
            const stored = localStorage.getItem('config_auth');
            if (stored) {
                const authData = JSON.parse(stored);
                const sessionLifetime = 8 * 60 * 60 * 1000;
                const elapsed = Date.now() - authData.timestamp;
                
                if (elapsed > sessionLifetime) {
                    logout();
                }
            }
        };

        const interval = setInterval(checkSessionExpiration, 60000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const login = (token: string) => {
        setAuthToken(token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setAuthToken(null);
        localStorage.removeItem('config_auth');
    };

    return (
        <ConfigAuthContext.Provider value={{ isAuthenticated, authToken, isCheckingAuth, login, logout }}>
            {children}
        </ConfigAuthContext.Provider>
    );
}

export function useConfigAuth() {
    const context = useContext(ConfigAuthContext);
    if (!context) {
        throw new Error('useConfigAuth must be used within a ConfigAuthProvider');
    }
    return context;
}
