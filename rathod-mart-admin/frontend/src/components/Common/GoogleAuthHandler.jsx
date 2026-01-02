// frontend/src/components/Common/GoogleAuthHandler.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../../services/api";
import { setCredentials } from "../../store/authSlice";

/**
 * Component to handle Google OAuth callback for Admin Panel
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
            // Fetch admin user profile after successful Google auth
            const fetchUserProfile = async () => {
                try {
                    const res = await api.get("/users/admin-profile");
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
                    navigate("/login");
                }
            };

            fetchUserProfile();

            // Clean up URL parameters
            searchParams.delete("google_auth");
            setSearchParams(searchParams, { replace: true });
        }

        if (error) {
            let errorMessage;

            if (error === "not_authorized") {
                errorMessage = "You don't have admin privileges. Please contact an administrator.";
            } else if (error === "account_inactive") {
                errorMessage = "Your account is inactive. Please contact an administrator.";
            } else {
                errorMessage = "Google authentication failed. Please try again.";
            }

            toast.error(errorMessage);
            searchParams.delete("error");
            setSearchParams(searchParams, { replace: true });
            navigate("/login");
        }
    }, [searchParams, setSearchParams, dispatch, navigate]);

    return null; // This component doesn't render anything
};

export default GoogleAuthHandler;
