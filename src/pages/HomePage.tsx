import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Bot, BrainCircuit, FileText, LifeBuoy, Sparkles, AlertTriangle, LayoutDashboard, DollarSign, BarChart, TrendingUp, Package, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { RecommendationCard } from '@/components/RecommendationCard';
import { SupportChatPanel } from '@/components/SupportChatPanel';
import { RecommendationExports } from '@/pages/RecommendationExports';
import { generateRecommendation, UserProfile, RecommendationStack, saveUserProfile, loadUserProfile } from '@/lib/recommendation';
import { Skeleton } from '@/components/ui/skeleton';
import { chatService } from '@/lib/chat';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
type AppState = 'idle' | 'onboarding' | 'generating' | 'results';
async function getRecommendationBySession(sessionId: string): Promise<RecommendationStack | null> {
  try {
    const res = await fetch(`/api/recommendations/${sessionId}`);
    const data = await res.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch recommendation by session:", error);
    return null;
  }
}
const MOCK_PROFILES: Record<string, UserProfile> = {
  'content-creator': {
    useCase: 'I want to build an AI-powered content creation assistant. It should help me write blog posts, generate social media captions, and create marketing copy based on a few keywords.',
    ambition: 'discovery',
    budget: 75,
    constraints: ['simple', 'managed'],
    integrations: ['notion'],
  },
  'ecommerce-ai': {
    useCase: 'I need an AI system for my e-commerce store to provide personalized product recommendations and an intelligent customer support chatbot that can handle order tracking and FAQs.',
    ambition: 'growth',
    budget: 250,
    constraints: ['managed'],
    integrations: ['slack'],
  },
  'internal-automation': {
    useCase: 'I want to automate internal document processing. The AI should be able to read PDFs, extract key information like invoice numbers and dates, and summarize the content.',
    ambition: 'automation',
    budget: 150,
    constraints: ['oss'],
    integrations: ['gcp'],
  },
};
function getMockProfile(template: string): UserProfile | null {
  return MOCK_PROFILES[template] || null;
}
export function HomePage() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationStack | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stacksculptor_subscribed') === 'true';
    }
    return false;
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stacksculptor_subscribed', String(isSubscribed));
    }
  }, [isSubscribed]);
  useEffect(() => {
    const sessionId = searchParams.get('session');
    const template = searchParams.get('template');
    if (sessionId) {
      const loadSession = async () => {
        setAppState('generating'); // Show loading state
        const rec = await getRecommendationBySession(sessionId);
        if (rec) {
          chatService.switchSession(sessionId);
          setRecommendation(rec);
          setAppState('results');
        } else {
          toast.error("Could not load the specified stack.");
          navigate('/');
          setAppState('idle');
        }
      };
      loadSession();
    } else if (template) {
      const mockProfile = getMockProfile(template);
      if (mockProfile) {
        setUserProfile(mockProfile);
        setAppState('onboarding');
        toast.info(`Loaded the "${template.replace('-', ' ')}" template!`);
        setSearchParams({}, { replace: true });
      } else {
        toast.error("Invalid template specified.");
        navigate('/');
        setAppState('idle');
      }
    } else {
      const savedProfile = loadUserProfile();
      if (savedProfile) {
        setUserProfile(savedProfile);
      }
    }
  }, [searchParams, navigate, setSearchParams]);
  const handleStart = () => {
    if (!isSubscribed) {
      toast.error('Subscription Required', {
        description: 'Please subscribe for $20/month to generate a custom stack.',
        action: {
          label: 'View Pricing',
          onClick: () => navigate('/pricing'),
        },
      });
      return;
    }
    setAppState('onboarding');
  };
  const handleWizardSubmit = async (data: UserProfile) => {
    setUserProfile(data);
    saveUserProfile(data);
    setAppState('generating');
    setRecommendation(null);
    setStreamingText('');
    const { parsed } = await generateRecommendation(data, (chunk) => {
      setStreamingText((prev) => prev + chunk);
    });
    if (parsed && parsed.tools.length > 0) {
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
    setStreamingText('');
  };
  const COLORS = ['#F38020', '#6D28D9', '#0F172A', '#f5576c', '#4facfe'];
  const pieData = recommendation?.tools.map(tool => ({ name: tool.toolName, value: tool.monthlyCost })) || [];
  const potentialSavings = recommendation ? (recommendation.tools.length * 8 * 25) + (500 - recommendation.estimatedTotalMonthlyCost) : 0;
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
            {streamingText && (
              <Card className="text-left bg-secondary/50 max-w-3xl mx-auto">
                <CardContent className="p-6">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-muted-foreground max-h-64 overflow-y-auto">
                    {streamingText}
                    <span className="animate-pulse">▋</span>
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 'results':
        return (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-balance leading-tight mb-4">{recommendation?.title}</h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{recommendation?.summary}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <Card className="lg:col-span-1"><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Est. Monthly Cost</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-gradient flex items-center gap-2"><DollarSign /> ${recommendation?.estimatedTotalMonthlyCost}</div></CardContent></Card>
                <Card className="lg:col-span-1"><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Potential Savings</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold flex items-center gap-2"><TrendingUp /> ${potentialSavings.toFixed(0)}</div><p className="text-xs text-muted-foreground mt-1">vs. manual research & trial</p></CardContent></Card>
                <Card className="lg:col-span-1 h-48"><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Cost Breakdown</CardTitle></CardHeader><CardContent className="h-full -mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} fill="#8884d8">
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent></Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendation?.tools.map((tool, index) => (
                <RecommendationCard key={tool.toolName} tool={tool} index={index} />
              )) ?? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
            </div>
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
              <RecommendationExports stack={recommendation} />
              <Button variant="secondary" onClick={handleReset}>Start Over</Button>
              <Button variant="outline" onClick={() => setIsSupportChatOpen(true)}>
                <LifeBuoy className="mr-2 h-4 w-4" /> Ask for Changes
              </Button>
              <Button asChild variant="outline">
                <Link to="/marketplace"><Package className="mr-2 h-4 w-4" /> Explore Marketplace</Link>
              </Button>
            </div>
          </div>
        );
      case 'onboarding':
        return (
          <Card className="w-full max-w-3xl mx-auto p-6 md:p-8 animate-fade-in shadow-2xl bg-card/80 backdrop-blur-lg">
            <OnboardingWizard onSubmit={handleWizardSubmit} isGenerating={Boolean(appState === 'generating')} initialValues={userProfile} />
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
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button size="lg" className="btn-gradient px-10 py-6 text-xl font-semibold" onClick={handleStart}>
                Get Your Custom Stack
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link to="/dashboard"><LayoutDashboard className="mr-2 size-5" /> View Dashboard</Link>
                </Button>
            </div>
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
          <div className="flex items-center justify-center gap-4 bg-secondary/50 p-2 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center space-x-2">
              <Label htmlFor="sub-toggle">{isSubscribed ? "You are subscribed!" : "Mock Subscription ($20/mo)"}</Label>
              <Switch id="sub-toggle" checked={isSubscribed} onCheckedChange={setIsSubscribed} />
            </div>
            <div className="h-4 w-px bg-border"></div>
            <Button asChild variant="link" className="text-muted-foreground">
                <Link to="/pricing"><DollarSign className="mr-1 size-4"/> View Pricing</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg max-w-2xl mx-auto">
            <AlertTriangle className="size-4 text-amber-500 flex-shrink-0" />
            <span>AI requests are subject to rate limits. Built with ❤️ at Cloudflare.</span>
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