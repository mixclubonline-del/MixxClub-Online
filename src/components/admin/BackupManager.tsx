import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Download, Calendar, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const BackupManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState("daily");

  const { data: backups } = useQuery({
    queryKey: ["backups"],
    queryFn: async () => {
      // Mock data - in production this would query backup metadata
      return [
        {
          id: "1",
          name: "full-backup-2024-01-15",
          size: "2.4 GB",
          created_at: new Date("2024-01-15").toISOString(),
          type: "full",
          status: "completed",
        },
        {
          id: "2",
          name: "incremental-backup-2024-01-14",
          size: "450 MB",
          created_at: new Date("2024-01-14").toISOString(),
          type: "incremental",
          status: "completed",
        },
        {
          id: "3",
          name: "full-backup-2024-01-08",
          size: "2.3 GB",
          created_at: new Date("2024-01-08").toISOString(),
          type: "full",
          status: "completed",
        },
      ];
    },
  });

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      // In production, this would trigger a backup job
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Backup initiated", description: "Full backup started successfully" });
      queryClient.invalidateQueries({ queryKey: ["backups"] });
    },
  });

  const downloadBackup = (backupId: string, backupName: string) => {
    toast({
      title: "Downloading backup",
      description: `Starting download of ${backupName}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Backup Manager
        </CardTitle>
        <CardDescription>Configure and manage database backups</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <div className="space-y-2">
              <Calendar className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Backup Schedule</h3>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Automated backups run at 2:00 AM UTC
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <HardDrive className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Storage Usage</h3>
              <div className="text-2xl font-bold">7.2 GB</div>
              <p className="text-sm text-muted-foreground">
                {backups?.length || 0} backups stored
              </p>
            </div>
          </Card>
        </div>

        <Button
          onClick={() => createBackupMutation.mutate()}
          disabled={createBackupMutation.isPending}
          className="w-full"
        >
          <Database className="mr-2 h-4 w-4" />
          Create Manual Backup
        </Button>

        <div className="space-y-4">
          <h3 className="font-semibold">Available Backups</h3>
          {backups?.map((backup) => (
            <Card key={backup.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{backup.name}</span>
                    <Badge variant={backup.type === "full" ? "default" : "secondary"}>
                      {backup.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(backup.created_at).toLocaleString()} • {backup.size}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadBackup(backup.id, backup.name)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
