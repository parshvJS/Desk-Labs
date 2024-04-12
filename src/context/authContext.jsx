import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import { getCurrentUser } from '../utils/api.js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const INITIAL_USER = {
    email: '',
    password: '',
    username: '',
    id: '',
    name: '',
    imageUrl: '',
    bio: '',
};

export const INITIAL_AUTHSTATE = {
    user: INITIAL_USER,
    setUser: () => { },
    isAuthenticated: false,
    setIsAuthenticated: () => { },
    isLoading: false,
    checkAuthUser: async () => false,
};

const authContext = createContext(INITIAL_AUTHSTATE);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(INITIAL_USER);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    const checkAuthUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (currentUser == -1) {
                setIsAuthenticated(false)
                return -1
            }
            if (currentUser) {
                setUser({
                    id: currentUser.$id,
                    email: currentUser.email,
                    username: currentUser.username,
                    name: currentUser.name,
                    imageUrl: currentUser.imageUrl,
                    bio: currentUser.bio,
                });
                setIsAuthenticated(true);
                return true;
            }
            console.log(currentUser,"is me in context");
            return false;
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const cookieFallback = localStorage.getItem('cookieFallback');
        if (
            cookieFallback === '[]' ||
            cookieFallback === null ||
            cookieFallback === undefined
        ) {
            setIsAuthenticated(false)
        }

        checkAuthUser();
    }, []); // Add navigate to useEffect dependencies

    const value = {
        user,
        setUser,
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkAuthUser,
    };

    return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export default AuthProvider;
export const useUserContext = () => useContext(authContext);
