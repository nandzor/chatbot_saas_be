import React, { createContext, useContext, useState, useEffect } from 'react';
import superAdminAuthService from '@/services/SuperAdminAuthService';

const SuperAdminAuthContext = createContext();

export const useSuperAdminAuth = () => {
    const context = useContext(SuperAdminAuthContext);
    if (!context) {
        throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider');
    }
    return context;
};

export const SuperAdminAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize authentication state
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check if user is already authenticated
            if (superAdminAuthService.isAuthenticated()) {
                const currentUser = superAdminAuthService.getUser();

                // Validate tokens with backend
                const isValid = await superAdminAuthService.validateTokens();

                if (isValid) {
                    setUser(currentUser);
                    setIsAuthenticated(true);
                } else {
                    // Tokens are invalid, clear auth
                    superAdminAuthService.clearAuth();
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            setError(error.message);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password, remember = false) => {
        try {
            setIsLoading(true);
            setError(null);

            const authData = await superAdminAuthService.login(email, password, remember);

            setUser(authData.user);
            setIsAuthenticated(true);

            return authData;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await superAdminAuthService.logout();
        } catch (error) {
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    const logoutAll = async () => {
        try {
            setIsLoading(true);
            await superAdminAuthService.logoutAll();
        } catch (error) {
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setIsLoading(true);
            setError(null);

            const updatedUser = await superAdminAuthService.updateProfile(profileData);
            setUser(updatedUser);

            return updatedUser;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await superAdminAuthService.changePassword(
                currentPassword,
                newPassword,
                newPasswordConfirmation
            );

            return result;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const forgotPassword = async (email) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await superAdminAuthService.forgotPassword(email);
            return result;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (token, email, password, passwordConfirmation) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await superAdminAuthService.resetPassword(
                token,
                email,
                password,
                passwordConfirmation
            );

            return result;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getSessions = async () => {
        try {
            setError(null);
            return await superAdminAuthService.getSessions();
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const revokeSession = async (sessionId) => {
        try {
            setError(null);
            return await superAdminAuthService.revokeSession(sessionId);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const refreshProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const updatedUser = await superAdminAuthService.getProfile();
            setUser(updatedUser);

            return updatedUser;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    // Permission and role checking
    const hasPermission = (permission) => {
        return superAdminAuthService.hasPermission(permission);
    };

    const hasRole = (role) => {
        return superAdminAuthService.hasRole(role);
    };

    const isSuperAdmin = () => {
        return superAdminAuthService.isSuperAdmin();
    };

    const value = {
        // State
        user,
        isAuthenticated,
        isLoading,
        error,

        // Actions
        login,
        logout,
        logoutAll,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        getSessions,
        revokeSession,
        refreshProfile,
        clearError,

        // Permission checks
        hasPermission,
        hasRole,
        isSuperAdmin,

        // Service access
        authService: superAdminAuthService,
    };

    return (
        <SuperAdminAuthContext.Provider value={value}>
            {children}
        </SuperAdminAuthContext.Provider>
    );
};

export default SuperAdminAuthContext;
