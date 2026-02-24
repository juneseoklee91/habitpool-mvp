"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, orderBy } from "@/lib/firebase";
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
        setWithdrawals(snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, "withdrawals", id), { status: newStatus });
            toast({ title: "상태 변경 완료", description: `요청을 ${newStatus} 상태로 변경했습니다.` });
            setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
        } catch (error) {
            toast({ variant: "destructive", title: "실패", description: "업데이트 중 오류가 발생했습니다." });
        }
    };

    if (loading || !isAdmin) return <div className="p-10 text-center">권한 검사 중...</div>;

    return (
        <div className="container py-10 max-w-6xl mx-auto px-4">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">관리자 콘솔</h1>
                <p className="text-muted-foreground">
                    출금 요청 승인 및 매칭 시뮬레이션 이벤트 로그
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>출금 요청 대기열</CardTitle>
                    <CardDescription>유저들이 요청한 $50 이상의 PayPal 출금 내역입니다. 실제 송금 후 송금 완료 처리를 해주세요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">유저 ID</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">요청 금액</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">PayPal 이메일</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">상태</th>
                                    <th className="px-4 py-3 font-medium text-right text-muted-foreground">액션 (수동변경)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">데이터가 없습니다.</td>
                                    </tr>
                                ) : (
                                    withdrawals.map((w) => (
                                        <tr key={w.id} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-4 py-3 font-mono text-xs">{w.userId?.slice(0, 8)}...</td>
                                            <td className="px-4 py-3 font-bold">
                                                ${w.amount}
                                                {w.type === "refund" && <span className="ml-2 text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">참가금 환불</span>}
                                                {(!w.type || w.type === "reward") && <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">상금 출금</span>}
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
                                                            <Check className="w-4 h-4 mr-1" /> 승인
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(w.id, "rejected")}>
                                                            <X className="w-4 h-4 mr-1" /> 반려
                                                        </Button>
                                                    </>
                                                )}
                                                {w.status === "approved" && (
                                                    <div className="flex gap-2">
                                                        {(!w.type || w.type === "reward") ? (
                                                            <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100" asChild>
                                                                <a href={`https://www.paypal.com/myaccount/transfer/homepage?recipient=${w.paypalEmail}&amount=${w.amount}`} target="_blank" rel="noreferrer">
                                                                    PayPal 1-Click 상금 송금
                                                                </a>
                                                            </Button>
                                                        ) : (
                                                            <Button size="sm" variant="outline" className="border-red-500 text-red-600 bg-red-50 hover:bg-red-100" onClick={() => alert("페이팔 결제 취소가 진행되어야 합니다. (데모 시뮬레이션)")}>
                                                                페이팔 결제 취소 (환불)
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="outline" className="border-green-500 text-green-500" onClick={() => handleUpdateStatus(w.id, "completed")}>
                                                            완료 마킹
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
                <h3 className="font-bold mb-2">MVP 부가 기능 예약 영역</h3>
                <p className="text-sm">정산 스케줄러 시뮬레이션, 챌린지 강제 종료 등의 관리자 기능이 이 곳에 추가될 수 있습니다.</p>
            </div>
        </div>
    );
}
