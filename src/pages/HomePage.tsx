import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, BrainCircuit, FileText, LifeBuoy, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { RecommendationCard } from '@/components/RecommendationCard';
import { SupportChatPanel } from '@/components/SupportChatPanel';
import { RecommendationExports } from '@/pages/RecommendationExports';
import { generateRecommendation, UserProfile, RecommendationStack } from '@/lib/recommendation';
import { Skeleton } from '@/components/ui/skeleton';
import { chatService } from '@/lib/chat';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
type AppState = 'idle' | 'onboarding' | 'generating' | 'results';
export function HomePage() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationStack | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem('stacksculptor_subscribed') === 'true';
  });
  useEffect(() => {
    localStorage.setItem('stacksculptor_subscribed', String(isSubscribed));
  }, [isSubscribed]);
  const handleStart = () => {
    if (!isSubscribed) {
      toast.error('Subscription Required', {
        description: 'Please subscribe for $20/month to generate a custom stack.',
        action: {
          label: 'Subscribe Now',
          onClick: () => setIsSubscribed(true),
        },
      });
      return;
    }
    setAppState('onboarding');
  };
  const handleWizardSubmit = async (data: UserProfile) => {
    setUserProfile(data);
    setAppState('generating');
    setRecommendation(null);
    setStreamingText('');
    const { parsed } = await generateRecommendation(data, (chunk) => {
      setStreamingText((prev) => prev + chunk);
    });
    if (parsed) {
      setRecommendation(parsed);
      setAppState('results');
      toast.success('Your custom AI stack is ready!');
    } else {
      setAppState('onboarding'); // Go back to edit
      toast.error('Failed to generate stack', {
        description: 'The AI failed to return a valid recommendation. Please try adjusting your inputs or try again later.',
      });
    }
  };
  const handleReset = () => {
    setAppState('onboarding');
    setRecommendation(null);
    setUserProfile(null);
    setStreamingText('');
  };
  const renderContent = () => {
    switch (appState) {
      case 'generating':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <BrainCircuit className="w-12 h-12 text-white" />
              </motion.div>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Sculpting Your Stack...</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our AI is analyzing your requirements to build the perfect combination of tools. This may take a moment.</p>
            <Card className="text-left bg-secondary/50 max-w-3xl mx-auto">
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap text-sm font-mono text-muted-foreground max-h-64 overflow-y-auto">
                  {streamingText}
                  <span className="animate-pulse">▋</span>
                </pre>
              </CardContent>
            </Card>
          </div>
        );
      case 'results':
        return (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-balance leading-tight mb-4">{recommendation?.title}</h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{recommendation?.summary}</p>
              <div className="mt-6 flex justify-center items-center gap-4 text-xl font-semibold">
                <span>Estimated Monthly Cost:</span>
                <span className="text-3xl font-bold text-gradient">${recommendation?.estimatedTotalMonthlyCost}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendation?.tools.map((tool, index) => (
                <RecommendationCard key={tool.toolName} tool={tool} index={index} />
              )) ?? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
            </div>
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
              <RecommendationExports stack={recommendation} />
              <Button variant="secondary" onClick={handleReset}>Start Over</Button>
              <Button variant="outline" onClick={() => setIsSupportChatOpen(true)}>
                <LifeBuoy className="mr-2 h-4 w-4" /> Ask for Changes
              </Button>
            </div>
          </div>
        );
      case 'onboarding':
        return (
          <Card className="w-full max-w-3xl mx-auto p-6 md:p-8 animate-fade-in shadow-2xl bg-card/80 backdrop-blur-lg">
            <OnboardingWizard onSubmit={handleWizardSubmit} isGenerating={appState === 'generating'} />
          </Card>
        );
      case 'idle':
      default:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-primary floating">
                <Sparkles className="w-12 h-12 text-white rotating" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
              Stop Guessing. <br /> Start <span className="text-gradient">Building</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Overwhelmed by AI tools? Tell us your goal, and we'll design a custom, actionable tool stack with a step-by-step guide—in minutes.
            </p>
            <Button size="lg" className="btn-gradient px-10 py-6 text-xl font-semibold" onClick={handleStart}>
              Get Your Custom Stack
            </Button>
          </div>
        );
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ThemeToggle />
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]"></div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24 lg:py-32 flex items-center justify-center min-h-screen">
          {renderContent()}
        </div>
      </main>
      <footer className="absolute bottom-0 left-0 right-0 p-4">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm space-y-2">
          <div className="flex items-center justify-center gap-4 bg-secondary/50 p-2 rounded-lg max-w-md mx-auto">
            <div className="flex items-center space-x-2">
              <Label htmlFor="sub-toggle">{isSubscribed ? "You are subscribed!" : "Mock Subscription ($20/mo)"}</Label>
              <Switch id="sub-toggle" checked={isSubscribed} onCheckedChange={setIsSubscribed} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg max-w-2xl mx-auto">
            <AlertTriangle className="size-4 text-amber-500 flex-shrink-0" />
            <span>AI requests are subject to rate limits across all users. Built with ❤️ at Cloudflare.</span>
          </div>
        </div>
      </footer>
      <SupportChatPanel
        open={isSupportChatOpen}
        onOpenChange={setIsSupportChatOpen}
        sessionId={chatService.getSessionId()}
      />
      <Toaster richColors closeButton />
    </div>
  );
}