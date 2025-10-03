import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Calendar } from "lucide-react";

export const DataRetentionManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState("chatbot_messages");
  const [retentionDays, setRetentionDays] = useState("90");

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const days = parseInt(retentionDays);
      let result;

      switch (selectedTable) {
        case "chatbot_messages":
          result = await supabase.rpc("cleanup_old_chatbot_messages", { days_to_keep: days });
          break;
        case "audit_logs":
          result = await supabase.rpc("cleanup_old_audit_logs", { days_to_keep: days });
          break;
        case "notifications":
          result = await supabase.rpc("cleanup_old_notifications", { days_to_keep: days });
          break;
        default:
          throw new Error("Invalid table selected");
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Cleanup completed",
        description: `Deleted ${data?.[0]?.deleted_count || 0} records`,
      });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      setShowConfirmDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Cleanup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const tables = [
    { value: "chatbot_messages", label: "Chatbot Messages", defaultDays: 90 },
    { value: "audit_logs", label: "Audit Logs", defaultDays: 180 },
    { value: "notifications", label: "Read Notifications", defaultDays: 30 },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Data Retention Manager
          </CardTitle>
          <CardDescription>
            Configure and execute data cleanup policies for GDPR compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Table to Clean</label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Retention Period (Days)</label>
              <Input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                min="1"
                max="365"
              />
              <p className="text-xs text-muted-foreground">
                Records older than this will be permanently deleted
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Current Retention Policies</h4>
            <div className="space-y-1 text-sm">
              {tables.map((table) => (
                <div key={table.value} className="flex justify-between">
                  <span>{table.label}</span>
                  <span className="text-muted-foreground">{table.defaultDays} days</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setShowConfirmDialog(true)}
            variant="destructive"
            className="w-full"
            disabled={cleanupMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Execute Cleanup
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all records from {selectedTable} older than {retentionDays} days.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => cleanupMutation.mutate()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
