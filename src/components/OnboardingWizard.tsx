import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserProfile } from '@/lib/recommendation';
import { ArrowLeft, Bot, Building, DollarSign, Zap } from 'lucide-react';
const formSchema = z.object({
  useCase: z.string().min(20, "Please describe your use case in at least 20 characters."),
  ambition: z.string(),
  budget: z.number().min(0).max(5000),
  constraints: z.array(z.string()),
  integrations: z.array(z.string()),
});
type OnboardingFormValues = z.infer<typeof formSchema>;
const steps = [
  { id: 'useCase', title: 'Your Use Case', icon: <Bot className="size-6" /> },
  { id: 'ambition', title: 'Ambition & Scale', icon: <Building className="size-6" /> },
  { id: 'constraints', title: 'Budget & Constraints', icon: <DollarSign className="size-6" /> },
  { id: 'integrations', title: 'Integrations', icon: <Zap className="size-6" /> },
];
const ambitions = [
  { id: 'discovery', label: 'Discovery & Prototyping', description: 'Exploring ideas, building a proof-of-concept.' },
  { id: 'automation', label: 'Internal Automation', description: 'Streamlining business processes for my team.' },
  { id: 'growth', label: 'Customer-Facing Product', description: 'Building a scalable product for external users.' },
];
const constraintsOptions = [
  { id: 'oss', label: 'Prefer Open Source' },
  { id: 'managed', label: 'Prefer Managed Services' },
  { id: 'simple', label: 'Simplicity is Key' },
];
const integrationsOptions = [
  { id: 'slack', label: 'Slack' },
  { id: 'discord', label: 'Discord' },
  { id: 'hubspot', label: 'HubSpot' },
  { id: 'notion', label: 'Notion' },
  { id: 'gcp', label: 'Google Cloud' },
  { id: 'aws', label: 'AWS' },
];
interface OnboardingWizardProps {
  onSubmit: (data: UserProfile) => void;
  isGenerating: boolean;
  initialValues?: UserProfile | null;
}
export function OnboardingWizard({ onSubmit, isGenerating, initialValues }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      useCase: '',
      ambition: 'discovery',
      budget: 50,
      constraints: [],
      integrations: [],
    },
  });
  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);
  const processForm = (data: OnboardingFormValues) => {
    onSubmit(data);
  };
  const nextStep = async () => {
    const fieldsToValidate: (keyof OnboardingFormValues)[] = currentStep === 0 ? ['useCase'] : [];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(s => s + 1);
    }
  };
  const prevStep = () => setCurrentStep(s => s - 1);
  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;
  return (
    <div className="w-full">
      <div className="mb-6 space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold font-display flex items-center gap-3">
            {steps[currentStep].icon}
            {steps[currentStep].title}
          </h2>
          <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm)} className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <FormField
                  control={form.control}
                  name="useCase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Describe what you want to build.</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="e.g., I want to build a customer support chatbot that can answer questions based on our documentation and escalate complex issues to a human agent."
                          className="min-h-[120px] text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {currentStep === 1 && (
                <FormField
                  control={form.control}
                  name="ambition"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg">What is your primary goal?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {ambitions.map(ambition => (
                            <FormItem key={ambition.id} className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent has-[[data-state=checked]]:bg-accent">
                              <FormControl>
                                <RadioGroupItem value={ambition.id} />
                              </FormControl>
                              <div className="flex flex-col">
                                <FormLabel className="font-normal cursor-pointer">{ambition.label}</FormLabel>
                                <p className="text-sm text-muted-foreground">{ambition.description}</p>
                              </div>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">What's your estimated monthly budget?</FormLabel>
                        <div className="flex items-center gap-4">
                          <FormControl>
                            <Slider
                              min={0}
                              max={5000}
                              step={10}
                              onValueChange={(value) => field.onChange(value[0])}
                              defaultValue={[field.value]}
                            />
                          </FormControl>
                          <div className="font-bold text-lg w-24 text-right">${field.value}</div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="constraints"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-lg">Any constraints or preferences?</FormLabel>
                        </div>
                        {constraintsOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="constraints"
                            render={({ field }) => (
                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(field.value?.filter((value) => value !== item.id));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {currentStep === 3 && (
                <FormField
                  control={form.control}
                  name="integrations"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-lg">What services do you need to integrate with?</FormLabel>
                        <p className="text-sm text-muted-foreground">Select all that apply.</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {integrationsOptions.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="integrations"
                            render={({ field }) => (
                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(field.value?.filter((value) => value !== item.id));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between items-center pt-4">
            <div>
              {currentStep > 0 && (
                <Button type="button" variant="ghost" onClick={prevStep} disabled={isGenerating}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
            </div>
            <div>
              {currentStep < steps.length - 1 && (
                <Button type="button" onClick={nextStep}>
                  Next Step
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="submit" className="btn-gradient px-8" disabled={isGenerating}>
                  {isGenerating ? 'Sculpting Your Stack...' : 'Generate My Stack'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}