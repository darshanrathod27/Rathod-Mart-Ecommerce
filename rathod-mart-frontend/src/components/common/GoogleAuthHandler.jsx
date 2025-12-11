// src/components/common/GoogleAuthHandler.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../../data/api";
import { setCredentials } from "../../store/authSlice";

/**
 * Component to handle Google OAuth callback
 * Checks URL params for google_auth success/error and fetches user profile
 */
const GoogleAuthHandler = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const googleAuth = searchParams.get("google_auth");
        const error = searchParams.get("error");

        if (googleAuth === "success") {
            // Fetch user profile after successful Google auth
            const fetchUserProfile = async () => {
                try {
                    const res = await api.get("/users/profile");
                    dispatch(setCredentials(res.data));
                    toast.success(`Welcome, ${res.data.name}!`, {
                        icon: "🎉",
                        style: {
                            borderRadius: "10px",
                            background: "#2E7D32",
                            color: "#fff",
                        },
                    });
                } catch (err) {
                    console.error("Failed to fetch user profile after Google auth:", err);
                    toast.error("Google login failed. Please try again.");
                }
            };

            fetchUserProfile();

            // Clean up URL parameters
            searchParams.delete("google_auth");
            setSearchParams(searchParams);
        }

        if (error === "google_auth_failed") {
            toast.error("Google authentication failed. Please try again.");
            searchParams.delete("error");
            setSearchParams(searchParams);
            navigate("/login");
        }
    }, [searchParams, setSearchParams, dispatch, navigate]);

    return null; // This component doesn't render anything
};

export default GoogleAuthHandler;
