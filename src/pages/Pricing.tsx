import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CheckCircle, Home, Sparkles } from 'lucide-react';
import { Toaster, toast } from 'sonner';
const benefits = [
  "Unlimited Custom Stack Generations",
  "Access to All Project Templates",
  "Save & Manage Your Stacks",
  "Personalized Starter Guides",
  "Priority Support Chat",
  "Save Hundreds of Dollars & Dozens of Hours"
];
export function Pricing() {
  const [isSubscribed, setIsSubscribed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stacksculptor_subscribed') === 'true';
    }
    return false;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stacksculptor_subscribed', String(isSubscribed));
    }
    if (isSubscribed) {
      toast.success("Subscription Activated!", { description: "You now have full access to StackSculptor." });
    }
  }, [isSubscribed]);
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ThemeToggle />
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
              <span className="text-gradient">Unlock</span> Your AI Potential
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
              Get unlimited access to custom AI stack recommendations and save countless hours of research for one simple price.
            </p>
          </header>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Card className="max-w-2xl mx-auto shadow-2xl bg-card/80 backdrop-blur-lg rounded-3xl">
              <CardHeader className="text-center p-8">
                <CardTitle className="text-3xl font-bold font-display">StackSculptor Pro</CardTitle>
                <CardDescription className="text-5xl font-bold text-gradient my-4">
                  $20<span className="text-xl text-muted-foreground font-medium">/month</span>
                </CardDescription>
                <p className="text-muted-foreground">No hidden fees. Cancel anytime.</p>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-4 mb-8">
                  {benefits.map((benefit, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="size-5 text-green-500 flex-shrink-0" />
                      <span className="text-foreground/90">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
                {isSubscribed ? (
                  <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <h3 className="text-xl font-bold text-green-600 dark:text-green-400">You are subscribed!</h3>
                    <p className="text-muted-foreground mt-2">
                      Your mock account is active. You can now generate unlimited stacks.
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/">Start Building <Sparkles className="ml-2 size-4" /></Link>
                    </Button>
                  </div>
                ) : (
                  <Button size="lg" className="w-full btn-gradient text-xl font-semibold py-7" onClick={() => setIsSubscribed(true)}>
                    Subscribe Now
                  </Button>
                )}
              </CardContent>
              <CardFooter className="p-8 pt-0 flex flex-col items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="sub-toggle" className="text-muted-foreground">Use this toggle to simulate subscription status across the app.</Label>
                  <Switch
                    id="sub-toggle"
                    checked={isSubscribed}
                    onCheckedChange={setIsSubscribed}
                    aria-label="Toggle subscription"
                  />
                </div>
                <Button asChild variant="ghost">
                  <Link to="/"><Home className="mr-2 size-4" /> Back to Home</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
}