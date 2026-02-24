"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function QueuePage() {
    const { user } = useAuth();
    const [waitingChallenges, setWaitingChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQueue() {
            if (!user) return;

            const q = query(
                collection(db, "challenges"),
                where("status", "==", "waiting"),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            setWaitingChallenges(data);
            setLoading(false);
        }

        if (user) {
            fetchQueue();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return (
            <div className="container py-10 max-w-4xl mx-auto px-4 space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="container py-10 max-w-4xl mx-auto px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Matching Queue</h1>
                <p className="text-muted-foreground">
                    A challenge will automatically start when 12 participants with similar target success rates are gathered.
                </p>
            </div>

            {waitingChallenges.length === 0 ? (
                <Card className="text-center py-20 bg-muted/20 border-border/50">
                    <CardContent>
                        <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No challenges in the queue.</h3>
                        <p className="text-muted-foreground mb-6">Start a new challenge and claim your rewards.</p>
                        <Button asChild>
                            <Link href="/challenges/new">Join Now <ArrowRight className="ml-2 w-4 h-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {waitingChallenges.map((challenge) => (
                        <Card key={challenge.id} className="overflow-hidden border-primary/20 bg-card">
                            <div className="h-2 w-full bg-primary/20 animate-pulse" />
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl mb-1">{challenge.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <span className="bg-secondary px-2 py-0.5 rounded-md text-xs font-medium">
                                                {challenge.type === "wakeup" ? "Wake-up" : "Regular"}
                                            </span>
                                            {challenge.type === "wakeup" && (
                                                <span className="text-primary font-medium">{challenge.targetTime} Target</span>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-primary">${challenge.entryFee}</span>
                                        <span className="text-xs text-muted-foreground">Pledge</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl bg-muted/50">
                                    <div className="flex-1 space-y-1 text-center sm:text-left">
                                        <p className="text-sm text-muted-foreground">Target Group</p>
                                        <p className="font-semibold text-lg">{challenge.targetSuccessRate}% Matching</p>
                                    </div>
                                    <div className="flex-1 space-y-1 text-center sm:text-left border-l border-border/50 pl-0 sm:pl-6">
                                        <p className="text-sm text-muted-foreground">Current Status</p>
                                        <p className="font-semibold text-lg text-primary flex items-center justify-center sm:justify-start gap-2">
                                            <Users className="w-5 h-5" /> Waiting for team match
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center gap-3 text-sm text-yellow-500/90 bg-yellow-500/10 p-3 rounded-lg">
                                    <Clock className="w-5 h-5 shrink-0" />
                                    <p>We are searching for users with similar success rates. Team formation may take <b>1+ days</b>. You can check the status on the dashboard.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
