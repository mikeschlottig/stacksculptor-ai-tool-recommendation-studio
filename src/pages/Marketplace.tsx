import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster, toast } from 'sonner';
import { Home, Zap, ExternalLink, Search, AlertTriangle } from 'lucide-react';
import { RecommendationStack, ToolRecommendation } from '@/lib/recommendation';
import { Input } from '@/components/ui/input';
type CombinedRecommendation = RecommendationStack & { sessionId: string };
async function fetchAllTools(): Promise<ToolRecommendation[]> {
  try {
    const res = await fetch('/api/recommendations');
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    const data = await res.json();
    if (!data.success) throw new Error('API returned an error');
    const allTools = data.data.flatMap((rec: CombinedRecommendation) => rec.tools);
    // Deduplicate tools by name
    const uniqueTools = new Map<string, ToolRecommendation>();
    allTools.forEach((tool: ToolRecommendation) => {
      if (!uniqueTools.has(tool.toolName)) {
        uniqueTools.set(tool.toolName, tool);
      }
    });
    return Array.from(uniqueTools.values());
  } catch (error) {
    console.error("Error fetching tools:", error);
    toast.error("Failed to load the tools marketplace.");
    return [];
  }
}
function MarketplaceToolCard({ tool, index }: { tool: ToolRecommendation, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full rounded-2xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-display">{tool.toolName}</CardTitle>
          <CardDescription>{tool.role}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <p className="text-muted-foreground mb-4 flex-grow">{tool.rationale}</p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Mock Integration Setup</AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p>1. Connect your {tool.toolName} account.</p>
                <p>2. Paste your API key when prompted.</p>
                <p>3. Test the workflow to ensure connection.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <div className="p-4 pt-0">
          <Button asChild className="w-full btn-gradient">
            <a href={`${tool.docsUrl}?ref=stacksculptor`} target="_blank" rel="noopener noreferrer">
              Visit Site <ExternalLink className="ml-2 size-4" />
            </a>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
export function Marketplace() {
  const [tools, setTools] = useState<ToolRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const loadTools = async () => {
      setIsLoading(true);
      const allTools = await fetchAllTools();
      setTools(allTools);
      setIsLoading(false);
    };
    loadTools();
  }, []);
  const filteredTools = useMemo(() => {
    return tools.filter(tool =>
      tool.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.rationale.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tools, searchTerm]);
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ThemeToggle />
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
                AI Tools <span className="text-gradient">Marketplace</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-4">
                Discover the best AI tools, vetted and recommended by StackSculptor. Integrate them into your workflow with ease.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild>
                  <Link to="/"><Home className="mr-2 size-4" /> Back to Home</Link>
                </Button>
              </div>
            </motion.div>
          </header>
          <div className="relative mb-8 max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for tools, roles, or keywords..."
              className="pl-10 h-12 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTools.map((tool, index) => (
                <MarketplaceToolCard key={tool.toolName} tool={tool} index={index} />
              ))}
            </div>
          )}
          { !isLoading && filteredTools.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                <h3 className="text-2xl font-semibold">No Tools Found</h3>
                <p className="text-muted-foreground mt-2">Your search for "{searchTerm}" did not match any tools.</p>
            </div>
          )}
        </div>
      </div>
      <footer className="p-4 text-center text-muted-foreground text-sm">
        <div className="max-w-3xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-2 p-2 bg-secondary/50 rounded-lg">
                <AlertTriangle className="size-4 text-muted-foreground flex-shrink-0" />
                <span>Affiliate Disclaimer: Some links may be affiliate links, which help support StackSculptor at no extra cost to you.</span>
            </div>
            <p>Powered by StackSculptor. Built with ❤️ at Cloudflare.</p>
        </div>
      </footer>
      <Toaster richColors />
    </div>
  );
}