import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export const RestoreManager = () => {
  const { toast } = useToast();
  const [selectedBackup, setSelectedBackup] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  const restoreMutation = useMutation({
    mutationFn: async () => {
      // Simulate restore process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setRestoreProgress(i);
      }
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Restore completed",
        description: "Database has been successfully restored",
      });
      setShowConfirmDialog(false);
      setRestoreProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Restore failed",
        description: error.message,
        variant: "destructive",
      });
      setRestoreProgress(0);
    },
  });

  const backups = [
    { value: "backup-1", label: "Full Backup - Jan 15, 2024 (2.4 GB)" },
    { value: "backup-2", label: "Incremental Backup - Jan 14, 2024 (450 MB)" },
    { value: "backup-3", label: "Full Backup - Jan 8, 2024 (2.3 GB)" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Restore Manager
          </CardTitle>
          <CardDescription>
            Restore database from previous backups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Warning: Destructive Action
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Restoring from a backup will replace all current data with the backup's data.
                  This action cannot be undone. Please ensure you have a recent backup before proceeding.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Backup to Restore</label>
            <Select value={selectedBackup} onValueChange={setSelectedBackup}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a backup..." />
              </SelectTrigger>
              <SelectContent>
                {backups.map((backup) => (
                  <SelectItem key={backup.value} value={backup.value}>
                    {backup.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBackup && (
            <Card className="p-4 bg-muted">
              <h4 className="font-medium mb-2">Backup Preview</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Tables:</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span className="font-medium">15,432</span>
                </div>
                <div className="flex justify-between">
                  <span>Users:</span>
                  <span className="font-medium">1,203</span>
                </div>
                <div className="flex justify-between">
                  <span>Projects:</span>
                  <span className="font-medium">4,582</span>
                </div>
              </div>
            </Card>
          )}

          {restoreMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Restoring database...</span>
                <span>{restoreProgress}%</span>
              </div>
              <Progress value={restoreProgress} />
            </div>
          )}

          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={!selectedBackup || restoreMutation.isPending}
            variant="destructive"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore from Backup
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore your database from the selected backup, replacing all current data.
              This action cannot be undone. Make sure you have a recent backup of your current state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Restore Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
