// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/users/google/callback",
                scope: ["profile", "email"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists with this Google ID
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // User exists, return it
                        return done(null, user);
                    }

                    // Check if user exists with same email (local account)
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // Link Google account to existing local account
                        user.googleId = profile.id;
                        user.authProvider = "google";
                        if (!user.profileImage && profile.photos?.[0]?.value) {
                            user.profileImage = profile.photos[0].value;
                        }
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user with Google data
                    const newUser = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        authProvider: "google",
                        profileImage: profile.photos?.[0]?.value || "",
                        role: "customer",
                        status: "active",
                    });

                    return done(null, newUser);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

export default configurePassport;
