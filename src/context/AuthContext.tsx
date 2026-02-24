"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { User, onAuthStateChanged } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "@/lib/firebase";

interface UserProfile {
    email: string;
    nickname: string;
    timezone: string;
    paypalEmail?: string;
    pointBalance: number;
    role: "user" | "admin";
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                setUser(firebaseUser);
                if (firebaseUser) {
                    // Fetch or create profile
                    const userRef = doc(db, "users", firebaseUser.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data() as UserProfile;
                        if ((firebaseUser.email === "admin@habitpool.com" || firebaseUser.email === "scyllawater@gmail.com") && data.role !== "admin") {
                            data.role = "admin";
                            await updateDoc(userRef, { role: "admin" });
                        }
                        setProfile(data);
                    } else {
                        // Typically created during signup, but fallback here
                        const defaultProfile: UserProfile = {
                            email: firebaseUser.email || "",
                            nickname: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            pointBalance: 0,
                            role: (firebaseUser.email === "admin@habitpool.com" || firebaseUser.email === "scyllawater@gmail.com") ? "admin" : "user",
                        };
                        await setDoc(userRef, defaultProfile);
                        setProfile(defaultProfile);
                    }
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error("AuthContext Error:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
