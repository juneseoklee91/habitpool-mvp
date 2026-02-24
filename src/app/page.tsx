import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Clock, Users, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 py-24 md:py-32 lg:py-40 overflow-hidden flex flex-col items-center text-center">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 mb-8 leading-[1.1]">
            A habit system that keeps you going,
            <br />
            <span className="text-primary">even when you want to quit.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto mb-10">
            Pledge any amount and prove your commitment with daily verifications for a month. A portion of the failing participants&apos; entry fees is distributed as a reward to successful team members.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto font-medium rounded-full" asChild>
              <Link href="/challenges/new">
                Start a Challenge <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto font-medium rounded-full backdrop-blur-sm bg-background/50 border-primary/20 hover:bg-primary/10" asChild>
              <Link href="/queue">
                View Queue
              </Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground/80 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Team formation may take 1+ days. Verify immediately even while waiting.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              A Challenge Focused Only on Results
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              No unnecessary socialization. Stay motivated by looking at your team&apos;s live performance board and achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Target className="w-8 h-8 text-primary" />}
              title="Custom Pledge & Goal"
              description="Choose your pledge amount and the target success rate of the team you want to be matched with."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-primary" />}
              title="Flexible yet Strict"
              description="Wake-up challenges have a ±30 min window. Regular habits require a single photo before midnight."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-primary" />}
              title="Optimal 12-Player Teams"
              description="You will be matched with 12 other users who share similar target success rates for a 1-month continuous motivation."
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8 text-primary" />}
              title="Guaranteed Rewards"
              description="The entry fees from participants who fail will be distributed equally among the final successful team members."
            />
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="mb-6 p-4 rounded-2xl bg-primary/10 w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
