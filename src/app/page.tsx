import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Clock, Users, Trophy, ChevronRight, CheckCircle2, TrendingUp, Camera, Coins } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="mx-auto max-w-4xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-8 text-sm font-semibold border border-primary/20">
            <Trophy className="w-4 h-4" /> 성공하면 보상받는 습관 형성 플랫폼
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 mb-6 leading-[1.15]">
            포기하고 싶을 때도<br />
            <span className="text-primary">당신을 움직이게 만듭니다.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            원하는 금액을 걸고 습관을 증명하세요. 스스로의 의지를 돈으로 묶고, 실패한 사람들의 예치금은 성공한 사람들에게 상금으로 분배됩니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto font-bold rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform" asChild>
              <Link href="/challenges/new">
                챌린지 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto font-bold rounded-full backdrop-blur-sm bg-background/50 border-primary/20 hover:bg-primary/5 transition-transform" asChild>
              <a href="#how-it-works">
                어떻게 진행되나요?
              </a>
            </Button>
          </div>
        </div>

        {/* Hero Dashboard App Preview Mockup */}
        <div className="w-full max-w-5xl mx-auto mt-20 relative perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 pointer-events-none" />
          <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-card/80 backdrop-blur-md shadow-2xl overflow-hidden transform rotate-x-12 scale-100 sm:scale-105 transition-transform duration-700 hover:rotate-x-0">
            <div className="h-12 bg-muted/50 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto bg-background/50 text-xs font-mono text-muted-foreground px-4 py-1 rounded-full border border-white/5">habitpool.site/dashboard</div>
            </div>
            <div className="p-4 sm:p-8 grid md:grid-cols-2 gap-6 bg-card/30">
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-background border border-border/50 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">Wake-up Target: 06:00</div>
                    <span className="text-sm font-medium text-muted-foreground">Remaining: 21 days</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">Morning Workout</h3>
                  <p className="text-sm text-muted-foreground mb-4">Pledge: $50.00</p>
                  <div className="p-4 rounded-xl bg-muted/30 border border-white/5 flex justify-between items-center">
                    <span className="text-sm font-semibold">Today&apos;s Verification</span>
                    <Button size="sm" className="rounded-full shadow-md"><Camera className="w-4 h-4 mr-2" /> Upload</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-background border border-border/50 shadow-sm">
                  <h4 className="font-bold flex items-center gap-2 mb-4 text-sm"><Users className="w-4 h-4" /> Team Status Board</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className={`p-2 rounded-lg border flex flex-col items-center justify-center text-[10px] font-medium ${i === 1 ? 'bg-green-500/10 text-green-600 border-green-500/20' : i === 3 ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-secondary text-muted-foreground border-transparent'}`}>
                        {i === 1 ? 'Me' : 'User' + i}
                        <div className="mt-1 flex items-center gap-1">
                          {i === 1 ? <CheckCircle2 className="w-3 h-3" /> : i === 3 ? <span className="w-3 h-3 rounded-full bg-red-500/50 block" /> : <Clock className="w-3 h-3" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-secondary/20 border-t border-border/50 scroll-mt-10">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground mb-4">
              어떻게 진행되나요?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              단순하지만 강력한 4단계 시스템으로 당신의 성공을 강제합니다.
            </p>
          </div>

          <div className="space-y-24">

            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-xl font-black">1</div>
                <h3 className="text-3xl font-bold">원하는 금액으로 참여</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  자신의 의지만큼 돈을 거세요. 최소 $10부터 원하는 만큼 예치금을 설정할 수 있습니다. 잃고 싶지 않은 금액일수록 성공 확률은 기하급수적으로 올라갑니다.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="p-6 rounded-3xl bg-card border shadow-lg transform rotate-2 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-bold">Entry Fee (Pledge)</span>
                    <span className="text-2xl font-black text-primary">$50.00</span>
                  </div>
                  <input type="range" className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer mb-2" defaultValue="50" min="10" max="200" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$10</span><span>$100</span><span>$200+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl font-black">2</div>
                <h3 className="text-3xl font-bold">비슷한 성공률끼리 우선 매칭</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  목표 달성률이 비슷한 12명의 익명 유저들과 한 팀으로 묶입니다. 경쟁과 협력이 동시에 일어나는 최적의 인원수로 한 달간 챌린지를 진행합니다.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="p-6 rounded-3xl bg-card border shadow-lg transform -rotate-1 hover:rotate-0 transition-transform">
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-blue-500" /> Target Success Rate Matching</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Users className="w-4 h-4 text-blue-600" /></div>
                      <div className="flex-1"><div className="h-2 w-1/2 bg-blue-500/30 rounded-full mb-1" /><div className="h-2 w-1/3 bg-muted rounded-full" /></div>
                      <span className="font-bold text-blue-600">80% Group</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Users className="w-4 h-4" /></div>
                      <div className="flex-1"><div className="h-2 w-1/2 bg-muted rounded-full mb-1" /><div className="h-2 w-1/3 bg-muted rounded-full" /></div>
                      <span className="font-bold text-muted-foreground">95% Group</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center text-xl font-black">3</div>
                <h3 className="text-3xl font-bold">매일 사진 인증</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  변명은 통하지 않습니다. 규칙대로 매일 사진을 찍어 올려야만 인증됩니다. 실시간 팀 보드에서 누가 살아남고 누가 탈락하는지 지켜보세요.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="p-6 rounded-3xl bg-card border shadow-lg transform rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-orange-500/30 bg-orange-500/5 mb-4">
                    <Camera className="w-10 h-10 text-orange-500 mb-2" />
                    <span className="font-bold text-orange-700 dark:text-orange-400">Click to Verify Today</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground">Streak: <span className="text-foreground">🔥 5 Days</span></span>
                    <span className="text-orange-500 flex items-center gap-1"><Clock className="w-4 h-4" /> 06:05 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-500 flex items-center justify-center text-xl font-black">4</div>
                <h3 className="text-3xl font-bold">성과에 따라 보상 분배</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  중도 포기한 사람들의 예치금은 수수료를 제외하고 최종 생존자들에게 1/N로 분배됩니다. 습관도 만들고, 상금도 얻어가는 완벽한 동기부여를 경험하세요.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="p-6 rounded-3xl bg-card border shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Coins className="w-5 h-5 text-green-500" /> Settlement Report</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center text-muted-foreground">
                      <span>My Initial Pledge</span><span>$50.00</span>
                    </li>
                    <li className="flex justify-between items-center text-red-500 font-medium">
                      <span>Failed Users Pool (4 ppl)</span><span>+$200.00</span>
                    </li>
                    <li className="flex justify-between items-center border-t pt-3 mt-3">
                      <span className="font-bold">Total Reward (1/8 share)</span><span className="font-black text-green-500 text-lg">+$72.50</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25">
                    Claim Reward to PayPal
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-black mb-8">준비되셨나요?</h2>
        <Button size="lg" className="h-16 px-10 text-xl rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
          <Link href="/challenges/new">
            지금 챌린지 시작하기 <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
        </Button>
      </section>

    </div>
  );
}
