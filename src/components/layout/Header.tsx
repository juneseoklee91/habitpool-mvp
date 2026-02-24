"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "@/lib/firebase";

export function Header() {
    const { user, profile } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8 mx-auto">
                <Link href="/" className="flex items-center space-x-2 mr-6">
                    <Target className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl tracking-tight text-foreground">
                        Habit Pool
                    </span>
                </Link>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {user && (
                            <>
                                <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60 hidden md:block">
                                    Dashboard
                                </Link>
                                <Link href="/points" className="transition-colors hover:text-foreground/80 text-foreground/60 hidden md:block">
                                    My Wallet
                                </Link>
                                {profile?.role === "admin" && (
                                    <Link href="/admin" className="transition-colors hover:text-foreground/80 text-foreground/60 hidden lg:block text-red-500 font-bold">
                                        Admin
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                    <div className="flex items-center space-x-2">
                        {user ? (
                            <>
                                <span className="text-sm text-muted-foreground mr-2 hidden sm:inline-block">
                                    {profile?.nickname || user.email}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => signOut(auth)} title="Logout">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                                <Button asChild>
                                    <Link href="/challenges/new">Join Now</Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                                    <Link href="/login">Log In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
