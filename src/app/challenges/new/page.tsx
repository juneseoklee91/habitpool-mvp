"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function NewChallengePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [title, setTitle] = useState("");
    const [type, setType] = useState<"wakeup" | "general">("general");
    const [targetTime, setTargetTime] = useState("06:00");
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [entryFee, setEntryFee] = useState<number>(30);
    const [targetSuccessRate, setTargetSuccessRate] = useState<number[]>([80]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timezonesList = useMemo(() => {
        return Intl.supportedValuesOf('timeZone').map(tz => {
            const date = new Date();
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
            const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / (60 * 1000);

            const sign = offsetMinutes >= 0 ? '+' : '-';
            const absMinutes = Math.abs(offsetMinutes);
            const hours = Math.floor(absMinutes / 60).toString().padStart(2, '0');
            const mins = (absMinutes % 60).toString().padStart(2, '0');
            const formattedOffset = `(UTC${sign}${hours}:${mins})`;

            return {
                id: tz,
                label: `${formattedOffset} ${tz.replace(/_/g, ' ')}`,
                offset: offsetMinutes
            };
        }).sort((a, b) => a.offset - b.offset);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to join a challenge.", variant: "destructive" });
            router.push("/login");
            return;
        }

        if (entryFee < 10) {
            toast({ title: "Invalid Amount", description: "Pledge amount must be at least $10.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate Payment
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Save to Firestore
            const challengeRef = await addDoc(collection(db, "challenges"), {
                userId: user.uid,
                title,
                type,
                ...(type === "wakeup" ? { targetTime } : {}),
                timezone,
                entryFee,
                targetSuccessRate: targetSuccessRate[0],
                status: "active", // Set to active immediately for MVP
                isMatching: true, // Show matching status on team board
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Successfully Joined! (Payment simulated)",
                description: "You have joined the challenge! You can start verifying immediately while waiting for a full team."
            });
            router.push("/dashboard");
        } catch (error) {
            toast({ title: "Error", description: "Failed to create challenge.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container py-10 max-w-2xl mx-auto px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Start a Habit Challenge</CardTitle>
                    <CardDescription>
                        Set your goal and pledge an entry fee.
                        You will be matched with users seeking a similar success rate.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <Label htmlFor="title">What habit do you want to build?</Label>
                            <Input
                                id="title"
                                placeholder="e.g., 30-min morning run, Drink 2L water"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Challenge Type</Label>
                            <Tabs defaultValue="general" onValueChange={(val) => setType(val as any)}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="general">Regular (Before midnight)</TabsTrigger>
                                    <TabsTrigger value="wakeup">Wake-up (Target time)</TabsTrigger>
                                </TabsList>

                                <TabsContent value="wakeup" className="mt-4 space-y-2 p-4 bg-muted/50 rounded-lg">
                                    <Label htmlFor="time">Target Wake-up Time</Label>
                                    <div className="flex gap-2 items-center">
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={targetTime.split(':')[0]}
                                            onChange={(e) => {
                                                const [, minute] = targetTime.split(':');
                                                setTargetTime(`${e.target.value}:${minute}`);
                                            }}
                                        >
                                            {Array.from({ length: 24 }).map((_, i) => {
                                                const hour = i.toString().padStart(2, '0');
                                                const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
                                                const ampm = i < 12 ? 'AM' : 'PM';
                                                return <option key={hour} value={hour}>{displayHour.toString().padStart(2, '0')} {ampm}</option>;
                                            })}
                                        </select>
                                        <span>:</span>
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={targetTime.split(':')[1]}
                                            onChange={(e) => {
                                                const [hour] = targetTime.split(':');
                                                setTargetTime(`${hour}:${e.target.value}`);
                                            }}
                                        >
                                            {['00', '15', '30', '45'].map(min => (
                                                <option key={min} value={min}>{min}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        You must upload a photo within ±30 mins of target time to succeed.
                                    </p>
                                </TabsContent>
                                <TabsContent value="general" className="mt-0">
                                </TabsContent>
                            </Tabs>

                            <div className="pt-2">
                                <Label htmlFor="timezone" className="block mb-2">Timezone Basis</Label>
                                <select
                                    id="timezone"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                >
                                    {timezonesList.map(tz => (
                                        <option key={tz.id} value={tz.id}>{tz.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground mt-2">
                                    The &quot;Midnight&quot; and &quot;Wake-up time&quot; deadlines will be based on this timezone.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Pledge Amount (USD)</Label>
                                <span className="font-bold text-xl text-primary">${entryFee}</span>
                            </div>
                            <Input
                                type="number"
                                min={10}
                                required
                                value={entryFee}
                                onChange={(e) => setEntryFee(Number(e.target.value))}
                                className="text-lg"
                            />
                            <p className="text-xs text-muted-foreground">
                                Set your desired amount. If you fail, this goes to the reward pool. If you succeed, you get it back.
                            </p>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-border/50">
                            <div className="flex justify-between items-center">
                                <Label>Target Success Rate Group</Label>
                                <span className="font-bold text-lg">{targetSuccessRate[0]}% Team</span>
                            </div>
                            <Slider
                                value={targetSuccessRate}
                                onValueChange={setTargetSuccessRate}
                                max={100}
                                min={75}
                                step={5}
                                className="py-4"
                            />
                            <p className="text-xs text-muted-foreground">
                                Example: Selecting {targetSuccessRate[0]}% matches you with users aiming for a similar target to share motivation.
                            </p>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mt-8">
                            <h4 className="font-semibold mb-2">Please Read</h4>
                            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
                                <li>Pledge is fully refunded upon 100% challenge completion.</li>
                                <li>Failing participants' pledges are distributed to survivors minus a 10% platform fee.</li>
                                <li>If any external transaction fees apply, payouts will be processed after deducting those fees.</li>
                                <li>Team formation (12 players) may take <b>1+ days</b>. You can start verifying immediately.</li>
                            </ul>
                        </div>

                        <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-xl" disabled={isSubmitting}>
                            {isSubmitting ? "Simulating Payment..." : `Pay and Join Challenge ($${entryFee})`}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
