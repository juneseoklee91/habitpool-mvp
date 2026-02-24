"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, orderBy, addDoc, serverTimestamp } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle2, XCircle, AlertCircle, Info, Users, Clock, Trophy, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Helper components would normally be broken down, but combined here for MVP simplicity
export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refundRequested, setRefundRequested] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading) return;

        async function fetchData() {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                // Check if user has already requested refund for MVP
                const refundQ = query(
                    collection(db, "withdrawals"),
                    where("userId", "==", user.uid),
                    where("type", "==", "refund")
                );
                const refundSnap = await getDocs(refundQ);
                if (refundSnap.docs.length > 0) {
                    setRefundRequested(true);
                }

                const q = query(
                    collection(db, "challenges"),
                    where("userId", "==", user.uid),
                    where("status", "==", "active")
                );
                const snap = await getDocs(q);
                let data = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

                // For MVP demonstration: if user has no active challenges, inject a fake one
                if (data.length === 0) {
                    data = [{
                        id: "mock-active-1",
                        title: "30-min Morning Workout",
                        type: "regular",
                        targetSuccessRate: 80,
                        entryFee: 50,
                        status: "active",
                        isMatching: true,
                        userId: user.uid,
                        createdAt: Date.now() - 86400000 * 5 // started 5 days ago
                    }];
                }

                setActiveChallenges(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user, authLoading]);

    const handleRefundRequest = async () => {
        if (!user) return;
        if (!confirm("Are you sure you want to request a $50.00 refund from the admin? (Cannot be canceled in demo)")) return;

        try {
            await addDoc(collection(db, "withdrawals"), {
                userId: user.uid,
                amount: 50,
                paypalEmail: user.email, // using login email as fallback for refund
                status: "requested",
                type: "refund",
                requestedAt: serverTimestamp(),
            });
            setRefundRequested(true);
            toast({ title: "Refund Requested", description: "Your pledge refund request has been submitted. Check the admin console." });
        } catch (error) {
            toast({ variant: "destructive", title: "Request Failed", description: "An error occurred." });
        }
    };

    if (loading) {
        return (
            <div className="container py-8 max-w-5xl mx-auto px-4 space-y-6">
                <Skeleton className="h-[250px] w-full" />
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-5xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">My Dashboard</h1>
                    <p className="text-muted-foreground">Check your active challenges and team performance board.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/challenges/new">Start New Challenge</Link>
                </Button>
            </div>

            {user?.email === "demo@habit.com" && (
                <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5 overflow-hidden shadow-lg">
                    <div className="bg-gradient-to-r from-yellow-500/20 to-transparent p-6 border-b border-yellow-500/20 flex items-start gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-full shrink-0">
                            <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                🎉 Challenge 100% Successful & Settled!
                            </h2>
                            <p className="text-muted-foreground mt-1 text-sm md:text-base">
                                The 30-day <strong className="text-foreground">&quot;30-min Morning Workout&quot;</strong> challenge is complete. Points have been credited to your wallet.
                            </p>
                        </div>
                    </div>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                                <Users className="w-5 h-5" /> Final Team Results
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between items-center bg-card p-3 rounded-lg border">
                                    <span className="text-muted-foreground">Total Participants</span>
                                    <span className="font-bold">12 people</span>
                                </li>
                                <li className="flex justify-between items-center bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                    <span className="text-green-700 dark:text-green-400">100% Success (Survivors)</span>
                                    <span className="font-bold text-green-700 dark:text-green-400">4 people (Inc. me)</span>
                                </li>
                                <li className="flex justify-between items-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    <span className="text-red-700 dark:text-red-400">Dropouts & Failures (67%)</span>
                                    <span className="font-bold text-red-700 dark:text-red-400">8 people</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                                <Coins className="w-5 h-5" /> My Settlement Report
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between items-center">
                                    <span className="text-muted-foreground">My Initial Pledge</span>
                                    <span className="font-semibold">$50.00</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Failed Users Pledge Pool (8 ppl)</span>
                                    <span className="font-semibold text-red-500/80">+$400.00</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Platform Fee (10%)</span>
                                    <span className="font-semibold text-muted-foreground">-$40.00</span>
                                </li>
                                <li className="flex justify-between items-center border-b pb-3">
                                    <span className="text-muted-foreground">Distribution per Survivor (1/4)</span>
                                    <span className="font-bold text-primary">+$90.00</span>
                                </li>
                                <li className="flex justify-between items-center bg-primary/10 p-3 rounded-lg font-bold text-lg text-primary">
                                    <span>Total Secured Amount</span>
                                    <span className="flex items-center gap-1"><TrendingUp className="w-5 h-5" /> $140.00</span>
                                </li>
                            </ul>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-border/50">
                                <Button
                                    variant="outline"
                                    className="border-red-500/50 text-red-600 hover:bg-red-500/10 hover:text-red-700 disabled:opacity-50"
                                    onClick={handleRefundRequest}
                                    disabled={refundRequested}
                                >
                                    {refundRequested ? "Refund Requested" : "Refund Initial Pledge ($50.00)"}
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                                    <Link href="/points">
                                        Claim Reward ($90.00)
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeChallenges.length === 0 ? (
                <Card className="text-center py-24 bg-muted/20 border-dashed">
                    <CardContent>
                        <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No active challenges.</h3>
                        <p className="text-muted-foreground mb-6">
                            You haven&apos;t joined any challenges or are still in the queue.
                            <br />
                            Join now to earn from the reward pool!
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button asChild>
                                <Link href="/challenges/new">Join Now</Link>
                            </Button>
                            <Button asChild variant="secondary">
                                <Link href="/queue">View Queue</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="gap-8 grid grid-cols-1 lg:grid-cols-12">
                    {/* Main List */}
                    <div className="lg:col-span-8 space-y-8">
                        {activeChallenges.map(c => (
                            <ActiveChallengeCard key={c.id} challenge={c} />
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" />
                                    Guidelines
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-3">
                                <p>✔️ Photo upload is allowed once per day.</p>
                                <p>✔️ Wake-up challenge verification is strictly within ±30 mins of target time.</p>
                                <p>✔️ Verified based on server time, not local device time.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActiveChallengeCard({ challenge }: { challenge: any }) {
    const { toast } = useToast();

    // Calculate days passed and remaining (30-day challenge)
    const createdAtMillis = challenge.createdAt?.toMillis ? challenge.createdAt.toMillis() : (challenge.createdAt || Date.now());
    const daysPassed = Math.floor((Date.now() - createdAtMillis) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, 30 - daysPassed);

    // MVP Fake progression data
    const progressPercent = Math.min(100, (daysPassed / 30) * 100);

    // Simulated Matching Logic
    const isMatching = challenge.isMatching;
    const isDayTwoRelaxed = isMatching && daysPassed >= 1;
    const simulatedMembers = isDayTwoRelaxed ? "5명 (80~95% 유사 그룹 병합)" : "1명";

    // Checking if photo upload is allowed right now
    const canUpload = true;

    return (
        <Card className="overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-colors">
            <Link href={`/dashboard/${challenge.id}/verify`} className="block">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                            {challenge.type === "wakeup" ? `Wake-up Target: ${challenge.targetTime}` : "Regular Verification"}
                        </span>
                        <span className="text-muted-foreground text-sm font-medium">
                            Remaining: {remainingDays} days
                        </span>
                    </div>
                    <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                    <CardDescription>
                        <div className="mb-2">My Pledge: ${challenge.entryFee} ({challenge.targetSuccessRate}% Target Group)</div>
                        {isMatching && (
                            <div className="text-primary font-semibold text-sm bg-primary/10 p-2 rounded-md inline-block">
                                ⏳ 팀원 매칭 중... (현재 {simulatedMembers})
                                {!isDayTwoRelaxed ? " - 2일차에는 최소 5명 팀을 위해 유사 목표 그룹과 자동 병합됩니다." : ""}
                            </div>
                        )}
                    </CardDescription>
                </CardHeader>
            </Link>

            <CardContent className="p-6">
                {/* Upload Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 bg-card rounded-2xl border border-border/50 shadow-sm p-6">
                    <div className="text-center sm:text-left">
                        <h4 className="text-lg font-bold mb-1">Today&apos;s Verification</h4>
                        <p className="text-sm text-muted-foreground">
                            {challenge.type === "wakeup" ? "Upload within the designated 1 hour!" : "Upload a photo before midnight to verify."}
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="h-14 px-8 rounded-full"
                        disabled={!canUpload}
                        asChild
                    >
                        <Link href={`/dashboard/${challenge.id}/verify`}>
                            <Camera className="w-5 h-5 mr-2" /> Take/Upload Photo
                        </Link>
                    </Button>
                </div>

                {/* My Progress */}
                <div className="mb-10">
                    <div className="flex justify-between text-sm font-medium mb-3">
                        <span>My Streak: <span className="text-primary font-bold">5 days</span></span>
                        <span className="text-muted-foreground">10 / 30 days</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                </div>

                {/* Team Status Board */}
                <div>
                    <h4 className="font-bold flex items-center gap-2 mb-4 text-lg">
                        <Users className="w-5 h-5" /> Team Status Board
                    </h4>
                    {challenge.isMatching ? (
                        <div className="p-8 text-center bg-secondary/10 rounded-2xl border border-dashed border-border/60">
                            <Clock className="w-8 h-8 mx-auto mb-3 text-muted-foreground animate-pulse" />
                            <h5 className="font-semibold text-lg mb-1">Currently matching...</h5>
                            <p className="text-sm text-muted-foreground">Team members are being gathered. You can still verify your habit today!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            <TeamMemberCard name="Me" status="success" streak={5} />
                            <TeamMemberCard name="HabitKing" status="pending" streak={4} />
                            <TeamMemberCard name="RunnerUp" status="failed" streak={0} />
                            <TeamMemberCard name="SleepyHead" status="pending" streak={2} />
                            <TeamMemberCard name="EarlyBird" status="success" streak={10} />
                            <TeamMemberCard name="LetsDoIt" status="success" streak={8} />
                            <TeamMemberCard name="NeverGiveUp" status="pending" streak={6} />
                            <TeamMemberCard name="TryHard" status="failed" streak={0} />
                            <TeamMemberCard name="IronWill" status="success" streak={15} />
                            <TeamMemberCard name="LateBloomer" status="success" streak={3} />
                            <TeamMemberCard name="GivesUpEasy" status="failed" streak={0} />
                            <TeamMemberCard name="SteadyPace" status="pending" streak={5} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function TeamMemberCard({ name, status, streak }: { name: string, status: "success" | "pending" | "failed", streak: number }) {
    const statusColors = {
        success: "bg-green-500/10 text-green-600 border-green-500/20",
        pending: "bg-secondary text-muted-foreground border-transparent",
        failed: "bg-red-500/10 text-red-600 border-red-500/20"
    };

    const statusIcon = {
        success: <CheckCircle2 className="w-4 h-4" />,
        pending: <Clock className="w-4 h-4" />,
        failed: <XCircle className="w-4 h-4" />
    };

    return (
        <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-2 ${statusColors[status]}`}>
            <span className="text-xs font-bold truncate w-full px-1">{name}</span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
                {statusIcon[status]}
                <span>{status === "success" ? "Success" : status === "failed" ? "Failed" : "Pending"}</span>
            </div>
            <span className="text-[10px] bg-background/50 rounded px-2 py-0.5 opacity-80">
                🔥 {streak} Days
            </span>
        </div>
    );
}
