"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, orderBy, where, getDoc } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const { profile, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!profile || profile.role !== "admin") {
                router.push("/");
                return;
            }
            setIsAdmin(true);
            fetchWithdrawals();
        }
    }, [profile, loading, router]);

    const fetchWithdrawals = async () => {
        const q = query(collection(db, "withdrawals"), orderBy("requestedAt", "desc"));
        const snap = await getDocs(q);

        const withdrawalData = await Promise.all(snap.docs.map(async (withdrawalDoc: any) => {
            const data = withdrawalDoc.data();
            let userStats = { total: 0, success: 0, failed: 0 };

            // Fetch user's challenge history stats
            if (data.userId) {
                try {
                    const userChallengesQ = query(collection(db, "challenges"), where("userId", "==", data.userId));
                    const userChallengesSnap = await getDocs(userChallengesQ);

                    userChallengesSnap.docs.forEach((c: any) => {
                        const cData = c.data();
                        userStats.total += 1;
                        if (cData.status === "completed") userStats.success += 1;
                        if (cData.status === "failed") userStats.failed += 1;
                    });
                } catch (e) {
                    console.error("Error fetching user stats", e);
                }
            }

            // For the sake of the MVP MVP Demo, if no challenge info is attached, use default text
            const challengeName = data.challengeId
                ? "Challenge ID: " + data.challengeId
                : (data.type === "refund" ? "Pledge Refund" : "Reward Claim");

            return {
                id: withdrawalDoc.id,
                ...data,
                userStats,
                challengeName
            };
        }));

        setWithdrawals(withdrawalData);
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, "withdrawals", id), { status: newStatus });
            toast({ title: "Status Updated", description: `Request changed to ${newStatus}.` });
            setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
        } catch (error) {
            toast({ variant: "destructive", title: "Failed", description: "Error updating status." });
        }
    };

    if (loading || !isAdmin) return <div className="p-10 text-center">Checking permissions...</div>;

    return (
        <div className="container py-10 max-w-6xl mx-auto px-4">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Console</h1>
                <p className="text-muted-foreground">
                    Withdrawal approval and simulation event logs
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Withdrawal Requests Queue</CardTitle>
                    <CardDescription>PayPal withdrawal requests of $50 or more. Mark as completed after manual transfer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">User ID & History</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Request Details</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">PayPal Email</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 font-medium text-right text-muted-foreground">Action (Manual)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No data.</td>
                                    </tr>
                                ) : (
                                    withdrawals.map((w) => (
                                        <tr key={w.id} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-4 py-3">
                                                <div className="font-mono text-xs mb-1">{w.userId ? w.userId.slice(0, 8) : "Unknown"}...</div>
                                                <div className="text-[10px] text-muted-foreground font-medium">
                                                    Challenges: <span className="text-foreground">{w.userStats?.total || 0}</span> Total
                                                    (<span className="text-green-600">{w.userStats?.success || 0}</span> W / <span className="text-red-600">{w.userStats?.failed || 0}</span> L)
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold mb-1">
                                                    ${w.amount}
                                                    {w.type === "refund" && <span className="ml-2 text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">Refund</span>}
                                                    {(!w.type || w.type === "reward") && <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">Reward</span>}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={w.challengeName || "No Challenge"}>
                                                    {w.challengeName || "No Challenge Data"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{w.paypalEmail}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold text-xs border rounded-full px-2 py-1 bg-secondary text-foreground">
                                                    {w.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2 flex justify-end">
                                                {w.status === "requested" && (
                                                    <>
                                                        <Button size="sm" variant="default" onClick={() => handleUpdateStatus(w.id, "approved")}>
                                                            <Check className="w-4 h-4 mr-1" /> Approve
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(w.id, "rejected")}>
                                                            <X className="w-4 h-4 mr-1" /> Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {w.status === "approved" && (
                                                    <div className="flex gap-2">
                                                        {(!w.type || w.type === "reward") ? (
                                                            <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100" asChild>
                                                                <a href={`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${w.paypalEmail}&amount=${w.amount}&currency_code=USD&item_name=Habit%20Pool%20Settlement`} target="_blank" rel="noreferrer">
                                                                    1-Click PayPal Transfer
                                                                </a>
                                                            </Button>
                                                        ) : (
                                                            <Button size="sm" variant="outline" className="border-red-500 text-red-600 bg-red-50 hover:bg-red-100" onClick={() => alert("PayPal refund should be processed. (Demo simulation)")}>
                                                                Cancel PayPal Payment (Refund)
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="outline" className="border-green-500 text-green-500" onClick={() => handleUpdateStatus(w.id, "completed")}>
                                                            Mark Completed
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 opacity-50 p-6 rounded-xl border border-dashed flex flex-col items-center justify-center text-center">
                <h3 className="font-bold mb-2">MVP Future Features Area</h3>
                <p className="text-sm">Admin features like settlement scheduler simulation and force termination can be added here.</p>
            </div>
        </div>
    );
}
