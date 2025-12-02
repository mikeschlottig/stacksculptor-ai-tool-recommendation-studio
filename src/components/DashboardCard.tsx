import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Layers, Trash2, ExternalLink } from 'lucide-react';
import { RecommendationStack } from '@/lib/recommendation';
import { formatDistanceToNow } from 'date-fns';
interface DashboardCardProps {
  recommendation: RecommendationStack & { sessionId: string; lastActive: number };
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  index: number;
}
export function DashboardCard({ recommendation, onSelect, onDelete, index }: DashboardCardProps) {
  const lastUpdated = formatDistanceToNow(new Date(recommendation.lastActive), { addSuffix: true });
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full rounded-2xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-display text-balance">{recommendation.title}</CardTitle>
          <CardDescription>Last updated {lastUpdated}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <p className="text-muted-foreground line-clamp-3">{recommendation.summary}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <DollarSign className="size-3" />
              ${recommendation.estimatedTotalMonthlyCost}/mo
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Layers className="size-3" />
              {recommendation.tools.length} Tools
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button onClick={() => onSelect(recommendation.sessionId)}>
            <ExternalLink className="mr-2 size-4" /> View Stack
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(recommendation.sessionId)}>
            <Trash2 className="size-4 text-destructive" />
            <span className="sr-only">Delete</span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}