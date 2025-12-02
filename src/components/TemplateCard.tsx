import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
interface TemplateCardProps {
  templateId: string;
  title: string;
  description: string;
  icon: keyof typeof LucideIcons;
  tools: string[];
  index: number;
}
export function TemplateCard({ templateId, title, description, icon, tools, index }: TemplateCardProps) {
  const navigate = useNavigate();
  const IconComponent = LucideIcons[icon] as React.ElementType;
  const handleUseTemplate = () => {
    navigate(`/?template=${templateId}`);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full rounded-2xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300 cursor-pointer" onClick={handleUseTemplate}>
        <CardHeader>
          <div className="flex items-center gap-4">
            {IconComponent && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <IconComponent className="size-8 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl font-bold font-display">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2">
            {tools.map(tool => (
              <Badge key={tool} variant="secondary">{tool}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            Use Template
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}