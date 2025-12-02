import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ToolRecommendation } from '@/lib/recommendation';
import { CheckCircle, ChevronDown, Clipboard, Code, ExternalLink, Zap } from 'lucide-react';
import { toast } from 'sonner';
interface RecommendationCardProps {
  tool: ToolRecommendation;
  index: number;
}
export function RecommendationCard({ tool, index }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (tool.quickstartSnippet?.code) {
      navigator.clipboard.writeText(tool.quickstartSnippet.code);
      setCopied(true);
      toast.success(`Copied ${tool.quickstartSnippet.language} snippet to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const confidenceColor =
    tool.confidence > 85 ? 'bg-green-500' : tool.confidence > 65 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col rounded-2xl shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-bold font-display">{tool.toolName}</CardTitle>
              <CardDescription className="text-primary/80">{tool.role}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary" className="text-lg font-bold">
                ${tool.monthlyCost}<span className="font-normal text-sm">/mo</span>
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="relative w-16 h-2 bg-muted rounded-full">
                  <motion.div
                    className={`absolute top-0 left-0 h-2 rounded-full ${confidenceColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${tool.confidence}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                </div>
                <span>{tool.confidence}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <p className="text-muted-foreground mb-4 flex-grow">{tool.rationale}</p>
          <Separator className="my-4" />
          <div className="space-y-3">
            <h4 className="font-semibold">Starter Plan:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle className="size-4 mt-0.5 text-green-500 flex-shrink-0" /><span>{tool.starterPlan.step1}</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="size-4 mt-0.5 text-green-500 flex-shrink-0" /><span>{tool.starterPlan.step2}</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="size-4 mt-0.5 text-green-500 flex-shrink-0" /><span>{tool.starterPlan.step3}</span></li>
            </ul>
          </div>
          <div className="mt-auto pt-4">
            <Button variant="ghost" onClick={() => setIsExpanded(!isExpanded)} className="w-full justify-center">
              {isExpanded ? 'Show Less' : 'Show Quickstart'}
              <ChevronDown className={`ml-2 size-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
            {isExpanded && tool.quickstartSnippet && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 bg-secondary p-4 rounded-lg overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-mono text-sm flex items-center gap-2"><Code className="size-4" /> {tool.quickstartSnippet.language}</h5>
                  <Button size="sm" variant="ghost" onClick={handleCopy}>
                    {copied ? <CheckCircle className="size-4 text-green-500" /> : <Clipboard className="size-4" />}
                    <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <pre className="text-xs bg-transparent p-0 overflow-x-auto">
                  <code>{tool.quickstartSnippet.code}</code>
                </pre>
              </motion.div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full">
                <Zap className="mr-2 size-4" /> Integrate Now
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Integrate {tool.toolName}</DialogTitle>
                <DialogDescription>
                  Follow these steps to connect {tool.toolName} to your project.
                </DialogDescription>
              </DialogHeader>
              <Accordion type="single" collapsible defaultValue="step-1" className="w-full">
                <AccordionItem value="step-1">
                  <AccordionTrigger>Step 1: Get API Key</AccordionTrigger>
                  <AccordionContent>
                    Log in to your {tool.toolName} dashboard, navigate to the API section, and generate a new secret key.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="step-2">
                  <AccordionTrigger>Step 2: Set Environment Variable</AccordionTrigger>
                  <AccordionContent>
                    Add the API key to your project's environment variables. For example: `TOOL_API_KEY="your_key_here"`.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="step-3">
                  <AccordionTrigger>Step 3: Test Connection</AccordionTrigger>
                  <AccordionContent>
                    Use the quickstart snippet provided in the card to make a test API call and verify the connection.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </DialogContent>
          </Dialog>
          <Button asChild className="w-full">
            <a href={`${tool.docsUrl}?ref=stacksculptor`} target="_blank" rel="noopener noreferrer">
              Open Docs <ExternalLink className="ml-2 size-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}