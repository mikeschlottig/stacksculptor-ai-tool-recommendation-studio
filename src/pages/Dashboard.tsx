import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCard } from '@/components/DashboardCard';
import { TemplateCard } from '@/components/TemplateCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster, toast } from 'sonner';
import { Home, PlusCircle, DollarSign, Layers, Clock, Package } from 'lucide-react';
import { RecommendationStack } from '@/lib/recommendation';
import { SessionInfo } from '../../worker/types';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
type CombinedRecommendation = RecommendationStack & { sessionId: string; lastActive: number };
async function fetchRecommendations(): Promise<CombinedRecommendation[]> {
  try {
    const [recsRes, sessionsRes] = await Promise.all([
      fetch('/api/recommendations'),
      fetch('/api/sessions')
    ]);
    if (!recsRes.ok || !sessionsRes.ok) {
      throw new Error('Failed to fetch data');
    }
    const recsData = await recsRes.json();
    const sessionsData = await sessionsRes.json();
    if (!recsData.success || !sessionsData.success) {
      throw new Error('API returned an error');
    }
    const sessionsMap = new Map<string, SessionInfo>(sessionsData.data.map((s: SessionInfo) => [s.id, s]));
    return recsData.data
      .map((rec: RecommendationStack & { sessionId: string }) => {
        const session = sessionsMap.get(rec.sessionId);
        return session ? { ...rec, lastActive: session.lastActive } : null;
      })
      .filter(Boolean)
      .sort((a: CombinedRecommendation, b: CombinedRecommendation) => b.lastActive - a.lastActive);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    toast.error("Failed to load your saved stacks.");
    return [];
  }
}
async function deleteRecommendation(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/recommendations/${sessionId}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting recommendation:", error);
    return false;
  }
}
export function Dashboard() {
  const [recommendations, setRecommendations] = useState<CombinedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchRecommendations();
    setRecommendations(data);
    setIsLoading(false);
  }, []);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const { totalCost, timeSaved, chartData } = useMemo(() => {
    const totalCost = recommendations.reduce((sum, rec) => sum + rec.estimatedTotalMonthlyCost, 0);
    const timeSaved = recommendations.length * 8;
    const chartData = recommendations.slice(0, 5).map(r => ({ name: r.title.substring(0, 15) + '...', cost: r.estimatedTotalMonthlyCost })).reverse();
    return { totalCost, timeSaved, chartData };
  }, [recommendations]);
  const handleSelect = (sessionId: string) => {
    navigate(`/?session=${sessionId}`);
  };
  const handleDelete = async (sessionId: string) => {
    const success = await deleteRecommendation(sessionId);
    if (success) {
      toast.success("Stack deleted successfully.");
      setRecommendations(prev => prev.filter(r => r.sessionId !== sessionId));
    } else {
      toast.error("Failed to delete stack.");
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12">
            <h1 className="text-5xl font-display font-bold text-gradient">Your Stacks</h1>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline"><Link to="/"><Home className="mr-2 size-4" /> Home</Link></Button>
              <Button asChild variant="outline"><Link to="/marketplace"><Package className="mr-2 size-4" /> Marketplace</Link></Button>
              <Button asChild><Link to="/"><PlusCircle className="mr-2 size-4" /> Create New Stack</Link></Button>
            </div>
          </header>
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Total Stacks</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold flex items-center gap-2"><Layers /> {recommendations.length}</div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Est. Total Monthly Cost</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold flex items-center gap-2"><DollarSign /> ${totalCost}</div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Estimated Time Saved</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold flex items-center gap-2"><Clock /> {timeSaved} hrs</div></CardContent></Card>
              <Card className="md:col-span-2 lg:col-span-1"><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Recent Stack Costs</CardTitle></CardHeader><CardContent className="h-24 -mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}} />
                    <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </div>
          </section>
          <section className="mb-12">
            <h2 className="text-3xl font-display font-bold mb-6">My Saved Stacks</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((rec, index) => (
                  <DashboardCard key={rec.sessionId} recommendation={rec} onSelect={handleSelect} onDelete={handleDelete} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                <h3 className="text-2xl font-semibold">No Saved Stacks Yet</h3>
                <p className="text-muted-foreground mt-2">Create your first AI stack recommendation to see it here.</p>
                <Button asChild className="mt-6"><Link to="/">Create a New Stack</Link></Button>
              </div>
            )}
          </section>
          <section>
            <h2 className="text-3xl font-display font-bold mb-6">Start from a Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TemplateCard templateId="content-creator" title="Content Creator" description="AI tools for writing blog posts, social media content, and marketing copy." icon="PenSquare" tools={['LLM', 'Vector DB', 'Deployment']} index={0} />
              <TemplateCard templateId="ecommerce-ai" title="E-commerce AI" description="Power your store with personalized recommendations and a support chatbot." icon="Store" tools={['Agent', 'LLM', 'Monitoring']} index={1} />
              <TemplateCard templateId="internal-automation" title="Internal Automation" description="Automate document processing, data extraction, and internal workflows." icon="Bot" tools={['Data Processing', 'LLM', 'Agent']} index={2} />
            </div>
          </section>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
}