import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/api-client';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async (tokens) => {
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
    }, []);

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

    const loginUser = async (userData) => {
        setErrorMsg("");
        setLoading(true);
        try {
            const response = await apiClient.post("/auth/jwt/create/", userData);
            const tokens = response.data
            setAuthTokens(tokens);
            await AsyncStorage.setItem("authTokens", JSON.stringify(tokens));
            await fetchUserProfile(tokens)  // ← pass tokens directly
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
            const res = await apiClient.post("/auth/users/", userData);
            console.log('Register success:', res.data)
            return { success: true }
        } catch (err) {
            const errorData = err.response?.data
            const firstError = errorData
                ? Object.values(errorData)[0]?.[0]
                : "Registration failed"
            return {
                success: false,
                message: firstError || "Registration failed",
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