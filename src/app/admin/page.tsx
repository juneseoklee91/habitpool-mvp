"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, orderBy, where, getDoc } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Users, Target, Activity, DollarSign, List, BarChart3, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const { profile, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("overview"); // overview, users, challenges, withdrawals
    const [isAdmin, setIsAdmin] = useState(false);

    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [challenges, setChallenges] = useState<any[]>([]);

    useEffect(() => {
        if (!loading) {
            if (!profile || profile.role !== "admin") {
                router.push("/");
                return;
            }
            setIsAdmin(true);
            fetchAllData();
        }
    }, [profile, loading, router]);

    const fetchAllData = async () => {
        try {
            // 1. Fetch Withdrawals
            const wQ = query(collection(db, "withdrawals"), orderBy("requestedAt", "desc"));
            const wSnap = await getDocs(wQ);

            const withdrawalData = await Promise.all(wSnap.docs.map(async (withdrawalDoc: any) => {
                const data = withdrawalDoc.data();
                let userStats = { total: 0, success: 0, failed: 0 };

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

                const challengeName = data.challengeId
                    ? "Challenge ID: " + data.challengeId
                    : (data.type === "refund" ? "Pledge Refund" : "Reward Claim");

                return { id: withdrawalDoc.id, ...data, userStats, challengeName };
            }));
            setWithdrawals(withdrawalData);

            // 2. Fetch Users
            const uQ = query(collection(db, "users"));
            const uSnap = await getDocs(uQ);
            setUsers(uSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));

            // 3. Fetch Challenges
            const cQ = query(collection(db, "challenges"));
            const cSnap = await getDocs(cQ);
            setChallenges(cSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));

        } catch (error) {
            console.error("Failed to fetch admin data", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load admin data." });
        }
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

    // Calculate aggregated stats
    const totalPledged = challenges.reduce((sum, c) => sum + (Number(c.entryFee) || 0), 0);
    const totalUsers = users.length;
    const activeChallengeCount = challenges.filter(c => c.status === "active" || c.status === "waiting").length;
    const pendingWithdrawals = withdrawals.filter(w => w.status === "requested" || w.status === "approved").length;

    return (
        <div className="container py-10 max-w-6xl mx-auto px-4">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">관리자 대시보드 (Admin Console)</h1>
                <p className="text-muted-foreground">
                    플랫폼 전체 현황, 유저 관리 및 출금 요청 승인 처리
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-muted/50 p-1.5 rounded-xl border w-fit">
                <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className="rounded-lg" size="sm" onClick={() => setActiveTab("overview")}
                >
                    <BarChart3 className="w-4 h-4 mr-2" /> 통계 요약
                </Button>
                <Button
                    variant={activeTab === "users" ? "default" : "ghost"}
                    className="rounded-lg" size="sm" onClick={() => setActiveTab("users")}
                >
                    <Users className="w-4 h-4 mr-2" /> 가입 유저 목록
                </Button>
                <Button
                    variant={activeTab === "challenges" ? "default" : "ghost"}
                    className="rounded-lg" size="sm" onClick={() => setActiveTab("challenges")}
                >
                    <Target className="w-4 h-4 mr-2" /> 전체 챌린지
                </Button>
                <Button
                    variant={activeTab === "withdrawals" ? "default" : "ghost"}
                    className="rounded-lg" size="sm" onClick={() => setActiveTab("withdrawals")}
                >
                    <Wallet className="w-4 h-4 mr-2" /> 정산 및 출금 처리
                    {pendingWithdrawals > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingWithdrawals}</span>
                    )}
                </Button>
            </div>

            {/* TAB: Overview (Stats) */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">총 가입 유저</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalUsers}명</div>
                                <p className="text-xs text-muted-foreground mt-1">Mock DB 기준</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">진행/대기중 챌린지</CardTitle>
                                <Activity className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeChallengeCount}건</div>
                                <p className="text-xs text-muted-foreground mt-1">누적 생성: {challenges.length}건</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">총 누적 예치금 (Pledge)</CardTitle>
                                <DollarSign className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${totalPledged.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">모든 챌린지 합산 금액</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">처리 대기중 정산</CardTitle>
                                <List className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingWithdrawals}건</div>
                                <p className="text-xs text-muted-foreground mt-1 bg-red-100 text-red-600 inline-block px-1.5 rounded border border-red-200">
                                    승인 및 이체 필요
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>MVP 어드민 안내사항</CardTitle>
                            <CardDescription>데모 버전을 위한 시스템 현황</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>• 현재 데이터베이스는 로컬 브라우저(LocalStorage)를 활용한 Mock DB로 구동 중입니다.</p>
                            <p>• 실 서버 배포 시, Firebase Configuration 세팅만 변경하면 본 어드민 페이지 역시 그대로 라이브 데이터베이스와 연동됩니다.</p>
                            <p>• 유저의 챌린지 성공/실패 여부는 MVP 상에서 자동으로 일괄 판별(1일 1회 스케줄러 시뮬레이터 이용)되며, 그 결과가 정산 대기열에 쌓이게 됩니다.</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB: Users */}
            {activeTab === "users" && (
                <Card>
                    <CardHeader>
                        <CardTitle>가입 유저 목록 (Users)</CardTitle>
                        <CardDescription>현재 플랫폼에 가입된 모든 유저 리스트입니다. (최신 가입순 정렬 생략)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">User ID</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Nickname</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                                        <th className="px-4 py-3 font-medium text-right text-muted-foreground">Mock Point Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">데이터가 없습니다.</td></tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className="px-4 py-3 font-mono text-xs">{u.id}</td>
                                                <td className="px-4 py-3 font-medium">{u.email}</td>
                                                <td className="px-4 py-3">{u.nickname || "N/A"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {u.role || "user"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-blue-600">${u.pointBalance || 0}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* TAB: Challenges */}
            {activeTab === "challenges" && (
                <Card>
                    <CardHeader>
                        <CardTitle>개설된 전체 챌린지 (Active Projects & Challenges)</CardTitle>
                        <CardDescription>유저들이 생성하여 매칭 대기 중이거나 진행 중인 챌린지 목록입니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Ref ID</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Creator ID</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Title & Goal</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Target %</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 font-medium text-right text-muted-foreground">Pledge</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {challenges.length === 0 ? (
                                        <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">데이터가 없습니다.</td></tr>
                                    ) : (
                                        // Sort mock challenges to show non-mock and recent first
                                        [...challenges].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map((c) => (
                                            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.id.slice(0, 8)}...</td>
                                                <td className="px-4 py-3 font-mono text-xs">{c.userId?.slice(0, 8)}...</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold truncate max-w-[250px]" title={c.title}>{c.title}</div>
                                                    <div className="text-[10px] text-muted-foreground capitalize">{c.type} {c.type === 'wakeup' && `- ${c.targetTime}`}</div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-blue-600">{c.targetSuccessRate}%</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        c.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                            'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}>
                                                        {c.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold">${c.entryFee}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* TAB: Withdrawals (Existing) */}
            {activeTab === "withdrawals" && (
                <Card>
                    <CardHeader>
                        <CardTitle>정산 및 출금 대기열 (Withdrawals & Settlements)</CardTitle>
                        <CardDescription>챌린지 종료 후 보상 획득자 혹은 중도 포기자 환불에 대한 페이팔 이체 승인 대기 목록입니다.</CardDescription>
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
                                                <td className="px-4 py-3 font-mono text-xs">{w.paypalEmail}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`font-bold text-[10px] border rounded-full px-2 py-1 ${w.status === 'requested' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                        w.status === 'approved' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                            w.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}>
                                                        {w.status.toUpperCase()}
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
                                                                        1-Click PayPal
                                                                    </a>
                                                                </Button>
                                                            ) : (
                                                                <Button size="sm" variant="outline" className="border-red-500 text-red-600 bg-red-50 hover:bg-red-100" onClick={() => alert("PayPal refund should be processed. (Demo simulation)")}>
                                                                    Refund Transfer
                                                                </Button>
                                                            )}
                                                            <Button size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-50" onClick={() => handleUpdateStatus(w.id, "completed")}>
                                                                Done
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
            )}
        </div>
    );
}
