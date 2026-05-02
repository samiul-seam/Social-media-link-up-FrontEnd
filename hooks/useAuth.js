import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/api-client';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(true);

    // Load tokens on app start
    useEffect(() => {
        const loadTokens = async () => {
            try {
                const token = await AsyncStorage.getItem("authTokens");
                if (token) {
                    const parsed = JSON.parse(token);
                    setAuthTokens(parsed);
                    await fetchUserProfile(parsed);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        loadTokens();
    }, []);

    useEffect(() => {
        if (authTokens) {
            fetchUserProfile();
        } else {
            setUser(null);
        }
    }, [authTokens]);
 
    const fetchUserProfile = useCallback(async (tokens = authTokens) => {
        if (!tokens?.access) {
            setUser(null);
            return;
        } 
        try {
            const response = await apiClient.get("auth/users/me/", {
                headers: {
                    Authorization: `JWT ${tokens.access}`,
                },
            });
            setUser(response.data);
        } catch (error) {
            console.log(error);
            setUser(null);
        }
    }, [authTokens]);

    const loginUser = async (userData) => {
        setErrorMsg("");
        setLoading(true);
        try {
            const response = await apiClient.post("/auth/jwt/create/", userData);
            setAuthTokens(response.data);
            await AsyncStorage.setItem("authTokens", JSON.stringify(response.data));
            await fetchUserProfile(); 
            return { success: true };
        } catch (error) {
            setErrorMsg(error.response?.data?.detail || "Login failed");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const registerUser = async (userData) => {
        setErrorMsg("");
        setLoading(true);
        try {
            await apiClient.post("/auth/users/", userData);
            return {
                success: true,
                message: "Registration successful. Check your email to activate your account.",
            };
        } catch {
            return {
                success: false,
                message: "Registration failed",
            };
        } finally {
            setLoading(false);
        }
    };

    const logOutUser = async () => {
        setUser(null);
        setAuthTokens(null);
        await AsyncStorage.removeItem("authTokens");
    };

    return {
        user,
        setUser,
        errorMsg,
        loading,
        authTokens,
        loginUser,
        registerUser,
        logOutUser,
    };
};

export default useAuth;