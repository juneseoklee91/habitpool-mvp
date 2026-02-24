"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wallet, DollarSign, History, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PointsWalletPage() {
    const { user, profile } = useAuth();
    const { toast } = useToast();

    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [paypalEmail, setPaypalEmail] = useState(profile?.paypalEmail || "");
    const [requestAmount, setRequestAmount] = useState<number>(50);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchHistory() {
            if (!user) return;
            const q = query(
                collection(db, "withdrawals"),
                where("userId", "==", user.uid),
                orderBy("requestedAt", "desc")
            );
            const snap = await getDocs(q);
            const data = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            setWithdrawals(data);
            setLoading(false);
        }

        // Set initial email if profile loads later
        if (profile?.paypalEmail && !paypalEmail) {
            setPaypalEmail(profile.paypalEmail);
        }

        fetchHistory();
    }, [user, profile]);

    const handleWithdrawalRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile) return;

        if (requestAmount < 50) {
            toast({ title: "오류", description: "최소 출금 가능 금액은 $50입니다.", variant: "destructive" });
            return;
        }

        if (requestAmount > profile.pointBalance) {
            toast({ title: "잔액 부족", description: "보유 포인트가 요청 금액보다 적습니다.", variant: "destructive" });
            return;
        }

        if (!paypalEmail.includes("@")) {
            toast({ title: "이메일 형식 오류", description: "정확한 PayPal 이메일 주소를 입력해주세요.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            // Create request
            await addDoc(collection(db, "withdrawals"), {
                userId: user.uid,
                amount: requestAmount,
                paypalEmail: paypalEmail,
                status: "requested",
                requestedAt: serverTimestamp(),
            });

            // Save paypal email to profile for future
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { paypalEmail });

            toast({ title: "출금 요청 완료", description: "요청이 관리자에게 전송되었습니다. 검토 후 PayPal로 송금됩니다." });

            // Optimistic update of UI
            setWithdrawals(prev => [{
                id: "temp-1",
                amount: requestAmount,
                paypalEmail,
                status: "requested",
                requestedAt: new Date()
            }, ...prev]);

        } catch (error) {
            toast({ title: "요청 실패", description: "네트워크 오류가 발생했습니다.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelRequest = async (id: string, amount: number) => {
        if (!confirm("출금 요청을 취소하시겠습니까? 포인트가 다시 복구됩니다.")) return;
        try {
            await deleteDoc(doc(db, "withdrawals", id));
            // Restore points in UI locally (mock level)
            toast({ title: "요청 취소 완료", description: "출금 요청이 취소되었습니다." });
            setWithdrawals(prev => prev.filter(w => w.id !== id));
        } catch (error) {
            toast({ title: "취소 실패", description: "네트워크 오류가 발생했습니다.", variant: "destructive" });
        }
    };

    if (loading || !profile) {
        return (
            <div className="container py-8 max-w-4xl mx-auto px-4 space-y-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const canWithdraw = profile.pointBalance >= 50;

    return (
        <div className="container py-8 max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold tracking-tight mb-8">포인트 지갑</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            보유 리워드 포인트
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-extrabold text-foreground mb-2">
                            ${profile.pointBalance.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            출금 가능 최소 잔액: $50
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>출금 요청</CardTitle>
                        <CardDescription>보유한 포인트를 PayPal 계정으로 출금합니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">PayPal 이메일</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={paypalEmail}
                                    onChange={(e) => setPaypalEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">출금 요청 금액 ($)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="amount"
                                        type="number"
                                        min={50}
                                        max={profile.pointBalance}
                                        required
                                        value={requestAmount}
                                        onChange={(e) => setRequestAmount(Number(e.target.value))}
                                    />
                                    <Button type="button" variant="secondary" onClick={() => setRequestAmount(profile.pointBalance)}>
                                        전액
                                    </Button>
                                </div>
                            </div>

                            {!canWithdraw && (
                                <div className="flex items-center gap-2 text-sm text-yellow-500/90 bg-yellow-500/10 p-2 rounded-lg mt-2">
                                    <AlertCircle className="w-4 h-4" /> 포인트가 $50 이상부터 출금이 가능합니다.
                                </div>
                            )}

                            <Button type="submit" className="w-full mt-2" disabled={!canWithdraw || isSubmitting}>
                                {isSubmitting ? "요청 중..." : "출금 요청하기"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                <History className="w-5 h-5" /> 출금 내역
            </h2>

            {withdrawals.length === 0 ? (
                <Card className="text-center py-12 bg-muted/20 border-dashed">
                    <CardContent>
                        <p className="text-muted-foreground">기록된 출금 요청 내역이 없습니다.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {withdrawals.map((w) => (
                        <Card key={w.id} className="p-4 flex items-center justify-between bg-card text-sm sm:text-base">
                            <div>
                                <div className="font-semibold flex items-center gap-2">
                                    ${w.amount} {w.type === "refund" ? "환불 요청" : "출금 요청"}
                                    {w.type === "refund" && <span className="text-[10px] text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">참가금 환불</span>}
                                    {(!w.type || w.type === "reward") && <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">상금 출금</span>}
                                </div>
                                <div className="text-muted-foreground text-xs">{w.paypalEmail}</div>
                            </div>

                            <div className="text-right">
                                <StatusBadge status={w.status} />
                                <div className="text-muted-foreground text-xs mt-1">
                                    {w.requestedAt?.toDate ? w.requestedAt.toDate().toLocaleDateString() : '방금 전'}
                                </div>
                                {w.status === "requested" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 mt-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleCancelRequest(w.id, w.amount)}
                                    >
                                        요청 취소
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string, color: string }> = {
        requested: { label: "검토 대기중", color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
        approved: { label: "송금 대기 (승인됨)", color: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
        completed: { label: "송금 완료", color: "bg-green-500/20 text-green-600 border-green-500/30" },
        rejected: { label: "반려됨", color: "bg-red-500/20 text-red-600 border-red-500/30" }
    };

    const display = map[status] || { label: status, color: "bg-secondary text-muted-foreground" };

    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${display.color}`}>
            {display.label}
        </span>
    );
}
