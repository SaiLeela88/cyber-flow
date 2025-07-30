import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Upload, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const incidentTypes = [
  { value: "phishing", label: "Phishing Attack", description: "Suspicious emails or fake websites" },
  { value: "malware", label: "Malware Detection", description: "Virus, ransomware, or malicious software" },
  { value: "data_breach", label: "Data Breach", description: "Unauthorized access to sensitive data" },
  { value: "ransomware", label: "Ransomware", description: "Files encrypted by malicious software" },
  { value: "social_engineering", label: "Social Engineering", description: "Manipulation attempts by attackers" },
  { value: "insider_threat", label: "Insider Threat", description: "Internal security threats" },
  { value: "ddos_attack", label: "DDoS Attack", description: "Distributed denial of service" },
  { value: "credential_theft", label: "Credential Theft", description: "Stolen passwords or access credentials" },
  { value: "unauthorized_access", label: "Unauthorized Access", description: "Illegal system or data access" },
  { value: "system_compromise", label: "System Compromise", description: "Compromised systems or networks" },
  { value: "other", label: "Other", description: "Other security incidents" }
];

const priorityLevels = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "critical", label: "Critical", color: "bg-red-500" }
];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  incident_type: z.string().min(1, "Please select an incident type"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  incident_date: z.date({ required_error: "Please select when the incident occurred" }),
  priority: z.string().min(1, "Please select a priority level"),
  location: z.string().optional(),
  affected_systems: z.string().optional(),
  estimated_impact: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface IncidentFormProps {
  onSubmit: (data: FormData & { attachments?: File[] }) => Promise<void>;
  isSubmitting?: boolean;
  aiSuggestion?: string;
  onGetAISuggestion?: (description: string) => void;
}

export const IncidentForm = ({ 
  onSubmit, 
  isSubmitting = false,
  aiSuggestion,
  onGetAISuggestion 
}: IncidentFormProps) => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      incident_type: "",
      description: "",
      priority: "medium",
      location: "",
      affected_systems: "",
      estimated_impact: "",
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
        });
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
        });
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAISuggestion = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 10) {
      toast({
        variant: "destructive",
        title: "Description too short",
        description: "Please provide at least 10 characters for AI analysis",
      });
      return;
    }

    setAiLoading(true);
    try {
      await onGetAISuggestion?.(description);
    } finally {
      setAiLoading(false);
    }
  };

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit({ ...data, attachments });
      form.reset();
      setAttachments([]);
      toast({
        title: "Incident reported successfully",
        description: "Your security incident has been submitted and will be reviewed by our security team.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to submit incident",
        description: "Please try again or contact support if the problem persists.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Report Security Incident</h1>
        <p className="text-muted-foreground">
          Help us protect our organization by reporting any security threats or suspicious activities
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>Incident Details</span>
          </CardTitle>
          <CardDescription>
            Please provide as much detail as possible to help our security team respond effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Brief summary of the incident"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a clear, concise title that summarizes the incident
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="incident_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select incident type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {incidentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityLevels.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                                <span>{priority.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description with AI Suggestion */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Detailed Description *</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAISuggestion}
                        disabled={aiLoading || !field.value || field.value.length < 10}
                        className="text-xs"
                      >
                        {aiLoading ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-1" />
                        )}
                        AI Analysis
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what happened, when you noticed it, what systems were affected, and any other relevant details..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include timeline, affected systems, and any suspicious activities observed
                    </FormDescription>
                    <FormMessage />
                    
                    {/* AI Suggestion Display */}
                    {aiSuggestion && (
                      <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-primary">AI Analysis</h4>
                            <p className="text-sm text-muted-foreground mt-1">{aiSuggestion}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Date and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="incident_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>When did this occur? *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Building A, Floor 3, Remote work"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Where did the incident occur?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="affected_systems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affected Systems</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Email server, Customer database, Workstation"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        List any systems, applications, or devices that were affected
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Impact</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the potential or actual impact of this incident..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        What was affected? How many users? Any data loss or system downtime?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div>
                  <FormLabel>Attachments</FormLabel>
                  <FormDescription>
                    Upload screenshots, logs, or other relevant files (Max 10MB each)
                  </FormDescription>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <div className="space-y-2">
                    <Button variant="outline" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose Files
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Supported: JPG, PNG, GIF, PDF, TXT
                    </p>
                  </div>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm">{file.name}</div>
                          <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                  className="shadow-cyber"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Incident Report"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};