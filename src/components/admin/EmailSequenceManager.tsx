import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, Plus, Edit, Trash2, Play, Pause, Users, 
  Clock, CheckCircle, XCircle, AlertCircle, GripVertical,
  Eye, Copy, ChevronDown, ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EmailSequence {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface EmailSequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  subject: string;
  html_template: string;
  delay_hours: number | null;
  is_active: boolean | null;
  conditions: unknown;
}

interface EmailEnrollment {
  id: string;
  user_id: string;
  sequence_id: string;
  current_step: number | null;
  status: string | null;
  enrolled_at: string | null;
  next_email_at: string | null;
  last_email_at: string | null;
  completed_at: string | null;
}

const TRIGGER_EVENTS = [
  { value: 'user.signup', label: 'User Signup' },
  { value: 'user.first_project', label: 'First Project Created' },
  { value: 'user.first_purchase', label: 'First Purchase' },
  { value: 'session.completed', label: 'Session Completed' },
  { value: 'project.completed', label: 'Project Completed' },
  { value: 'referral.created', label: 'Referral Created' },
  { value: 'tier.upgraded', label: 'Tier Upgraded' },
  { value: 'cart.abandoned', label: 'Cart Abandoned' },
  { value: 'manual', label: 'Manual Trigger' },
];

const TEMPLATE_VARIABLES = [
  { name: '{{full_name}}', description: 'User\'s full name' },
  { name: '{{email}}', description: 'User\'s email address' },
  { name: '{{first_name}}', description: 'User\'s first name' },
  { name: '{{project_name}}', description: 'Related project name' },
  { name: '{{session_title}}', description: 'Session title' },
  { name: '{{amount}}', description: 'Payment/reward amount' },
  { name: '{{action_url}}', description: 'Call-to-action URL' },
];

export const EmailSequenceManager = () => {
  const { toast } = useToast();
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<EmailSequence | null>(null);
  const [steps, setSteps] = useState<EmailSequenceStep[]>([]);
  const [enrollments, setEnrollments] = useState<EmailEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<EmailSequenceStep | null>(null);
  const [isNewSequence, setIsNewSequence] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTrigger, setFormTrigger] = useState("");
  const [stepSubject, setStepSubject] = useState("");
  const [stepDelay, setStepDelay] = useState(0);
  const [stepTemplate, setStepTemplate] = useState("");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSequences();
  }, []);

  useEffect(() => {
    if (selectedSequence) {
      fetchSteps(selectedSequence.id);
      fetchEnrollments(selectedSequence.id);
    }
  }, [selectedSequence]);

  const fetchSequences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSequences(data || []);
    }
    setLoading(false);
  };

  const fetchSteps = async (sequenceId: string) => {
    const { data, error } = await supabase
      .from('email_sequence_steps')
      .select('*')
      .eq('sequence_id', sequenceId)
      .order('step_order', { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSteps(data || []);
    }
  };

  const fetchEnrollments = async (sequenceId: string) => {
    const { data, error } = await supabase
      .from('email_sequence_enrollments')
      .select('*')
      .eq('sequence_id', sequenceId)
      .order('enrolled_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching enrollments:', error);
    } else {
      setEnrollments(data || []);
    }
  };

  const toggleSequenceActive = async (sequence: EmailSequence) => {
    const { error } = await supabase
      .from('email_sequences')
      .update({ is_active: !sequence.is_active })
      .eq('id', sequence.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: sequence.is_active ? "Sequence Paused" : "Sequence Activated",
        description: `"${sequence.name}" is now ${sequence.is_active ? 'paused' : 'active'}`
      });
      fetchSequences();
    }
  };

  const openNewSequence = () => {
    setIsNewSequence(true);
    setSelectedSequence(null);
    setFormName("");
    setFormDescription("");
    setFormTrigger("");
    setIsEditorOpen(true);
  };

  const openEditSequence = (sequence: EmailSequence) => {
    setIsNewSequence(false);
    setSelectedSequence(sequence);
    setFormName(sequence.name);
    setFormDescription(sequence.description || "");
    setFormTrigger(sequence.trigger_event || "");
    setIsEditorOpen(true);
  };

  const saveSequence = async () => {
    if (!formName) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    if (isNewSequence) {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          name: formName,
          description: formDescription || null,
          trigger_event: formTrigger || null,
          is_active: false,
        })
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Email sequence created" });
        setIsEditorOpen(false);
        fetchSequences();
        if (data) setSelectedSequence(data);
      }
    } else if (selectedSequence) {
      const { error } = await supabase
        .from('email_sequences')
        .update({
          name: formName,
          description: formDescription || null,
          trigger_event: formTrigger || null,
        })
        .eq('id', selectedSequence.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Email sequence updated" });
        setIsEditorOpen(false);
        fetchSequences();
      }
    }
  };

  const deleteSequence = async (sequence: EmailSequence) => {
    if (!confirm(`Delete "${sequence.name}"? This cannot be undone.`)) return;

    const { error } = await supabase
      .from('email_sequences')
      .delete()
      .eq('id', sequence.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Email sequence removed" });
      if (selectedSequence?.id === sequence.id) setSelectedSequence(null);
      fetchSequences();
    }
  };

  const openStepEditor = (step?: EmailSequenceStep) => {
    if (step) {
      setEditingStep(step);
      setStepSubject(step.subject);
      setStepDelay(step.delay_hours || 0);
      setStepTemplate(step.html_template);
    } else {
      setEditingStep(null);
      setStepSubject("");
      setStepDelay(24);
      setStepTemplate(getDefaultTemplate());
    }
  };

  const getDefaultTemplate = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
  
  <div style="background: linear-gradient(135deg, #5B3CFF 0%, #7C3AED 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎵 MixClub</h1>
  </div>
  
  <div style="background: white; padding: 30px;">
    <p style="margin: 0 0 15px 0; font-size: 16px;">Hi {{full_name}},</p>
    
    <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">
      Your message content goes here...
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{action_url}}" style="display: inline-block; background: #5B3CFF; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Take Action</a>
    </div>
    
    <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
      — The MixClub Team
    </p>
  </div>
  
  <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
    <p style="margin: 0;">
      <a href="https://mixclubonline.com/settings" style="color: #5B3CFF;">Manage notification preferences</a>
    </p>
  </div>
  
</body>
</html>`;

  const saveStep = async () => {
    if (!selectedSequence || !stepSubject || !stepTemplate) {
      toast({ title: "Error", description: "Subject and template are required", variant: "destructive" });
      return;
    }

    if (editingStep) {
      const { error } = await supabase
        .from('email_sequence_steps')
        .update({
          subject: stepSubject,
          delay_hours: stepDelay,
          html_template: stepTemplate,
        })
        .eq('id', editingStep.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Step updated" });
        setEditingStep(null);
        fetchSteps(selectedSequence.id);
      }
    } else {
      const nextOrder = steps.length > 0 ? Math.max(...steps.map(s => s.step_order)) + 1 : 1;
      
      const { error } = await supabase
        .from('email_sequence_steps')
        .insert({
          sequence_id: selectedSequence.id,
          step_order: nextOrder,
          subject: stepSubject,
          delay_hours: stepDelay,
          html_template: stepTemplate,
          is_active: true,
        });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Step added" });
        setEditingStep(null);
        fetchSteps(selectedSequence.id);
      }
    }
  };

  const deleteStep = async (stepId: string) => {
    if (!confirm("Delete this step?")) return;

    const { error } = await supabase
      .from('email_sequence_steps')
      .delete()
      .eq('id', stepId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Step removed" });
      if (selectedSequence) fetchSteps(selectedSequence.id);
    }
  };

  const cancelEnrollment = async (enrollmentId: string) => {
    const { error } = await supabase
      .from('email_sequence_enrollments')
      .update({ status: 'cancelled' })
      .eq('id', enrollmentId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cancelled", description: "Enrollment cancelled" });
      if (selectedSequence) fetchEnrollments(selectedSequence.id);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-400">Completed</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Paused</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const toggleStepExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const insertVariable = (variable: string) => {
    setStepTemplate(prev => prev + variable);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Email Sequences
          </h2>
          <p className="text-muted-foreground">Manage automated email drip campaigns</p>
        </div>
        <Button onClick={openNewSequence}>
          <Plus className="h-4 w-4 mr-2" />
          New Sequence
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sequences List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sequences</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {loading ? (
                <p className="text-muted-foreground text-center py-4">Loading...</p>
              ) : sequences.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No sequences yet</p>
              ) : (
                <div className="space-y-2">
                  {sequences.map((seq) => (
                    <div
                      key={seq.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSequence?.id === seq.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedSequence(seq)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{seq.name}</span>
                            {seq.is_active ? (
                              <Badge variant="default" className="text-xs">Active</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Paused</Badge>
                            )}
                          </div>
                          {seq.trigger_event && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Trigger: {seq.trigger_event}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSequenceActive(seq);
                            }}
                          >
                            {seq.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditSequence(seq);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sequence Details */}
        <Card className="lg:col-span-2">
          {selectedSequence ? (
            <Tabs defaultValue="steps">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedSequence.name}</CardTitle>
                    <CardDescription>{selectedSequence.description}</CardDescription>
                  </div>
                  <TabsList>
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                    <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="steps" className="mt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">{steps.length} steps in this sequence</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => openStepEditor()}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Step
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{editingStep ? 'Edit Step' : 'Add Step'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Subject Line</Label>
                                <Input
                                  value={stepSubject}
                                  onChange={(e) => setStepSubject(e.target.value)}
                                  placeholder="Welcome to MixClub!"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Delay (hours after previous)</Label>
                                <Input
                                  type="number"
                                  value={stepDelay}
                                  onChange={(e) => setStepDelay(parseInt(e.target.value) || 0)}
                                  min={0}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>HTML Template</Label>
                                <div className="flex gap-1 flex-wrap">
                                  {TEMPLATE_VARIABLES.map((v) => (
                                    <Button
                                      key={v.name}
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs"
                                      onClick={() => insertVariable(v.name)}
                                      title={v.description}
                                    >
                                      {v.name}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <Textarea
                                value={stepTemplate}
                                onChange={(e) => setStepTemplate(e.target.value)}
                                className="font-mono text-sm min-h-[300px]"
                                placeholder="HTML email template..."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingStep(null)}>Cancel</Button>
                            <Button onClick={saveStep}>Save Step</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {steps.map((step, index) => (
                          <div key={step.id} className="border rounded-lg">
                            <div
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                              onClick={() => toggleStepExpanded(step.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium">{step.subject}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {step.delay_hours === 0 ? 'Send immediately' : `After ${step.delay_hours}h`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => {
                                      e.stopPropagation();
                                      openStepEditor(step);
                                    }}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Edit Step</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Subject Line</Label>
                                          <Input
                                            value={stepSubject}
                                            onChange={(e) => setStepSubject(e.target.value)}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Delay (hours)</Label>
                                          <Input
                                            type="number"
                                            value={stepDelay}
                                            onChange={(e) => setStepDelay(parseInt(e.target.value) || 0)}
                                            min={0}
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>HTML Template</Label>
                                        <Textarea
                                          value={stepTemplate}
                                          onChange={(e) => setStepTemplate(e.target.value)}
                                          className="font-mono text-sm min-h-[300px]"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={saveStep}>Save</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteStep(step.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {expandedSteps.has(step.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            {expandedSteps.has(step.id) && (
                              <div className="p-3 border-t bg-muted/30">
                                <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                                  {step.html_template.slice(0, 500)}...
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="enrollments" className="mt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {enrollments.length} enrollments (showing last 50)
                    </p>
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Step</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Next Email</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {enrollments.map((enrollment) => (
                            <TableRow key={enrollment.id}>
                              <TableCell className="font-mono text-xs">
                                {enrollment.user_id.slice(0, 8)}...
                              </TableCell>
                              <TableCell>{enrollment.current_step}/{steps.length}</TableCell>
                              <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                              <TableCell className="text-xs">
                                {enrollment.next_email_at 
                                  ? format(new Date(enrollment.next_email_at), 'MMM d, h:mm a')
                                  : '-'
                                }
                              </TableCell>
                              <TableCell>
                                {enrollment.status === 'active' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-destructive"
                                    onClick={() => cancelEnrollment(enrollment.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a sequence to view details</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* New/Edit Sequence Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewSequence ? 'Create Email Sequence' : 'Edit Email Sequence'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Welcome Series"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Onboarding emails for new users..."
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger Event</Label>
              <Select value={formTrigger} onValueChange={setFormTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger..." />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map((event) => (
                    <SelectItem key={event.value} value={event.value}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button onClick={saveSequence}>
              {isNewSequence ? 'Create Sequence' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
