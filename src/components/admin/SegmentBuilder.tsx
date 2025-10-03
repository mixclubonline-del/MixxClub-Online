import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SegmentBuilder = () => {
  const { toast } = useToast();
  const [segmentName, setSegmentName] = useState("");
  const [criteria, setCriteria] = useState<Array<{ field: string; operator: string; value: string }>>([]);

  const addCriteria = () => {
    setCriteria([...criteria, { field: "signup_date", operator: "greater_than", value: "" }]);
  };

  const savedSegments = [
    { name: "High Value Users", size: 234, growth: "+12%" },
    { name: "At Risk", size: 45, growth: "-5%" },
    { name: "Power Users", size: 128, growth: "+8%" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Segment Builder
        </CardTitle>
        <CardDescription>Create custom user segments for targeted campaigns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Segment Name</label>
            <Input
              placeholder="e.g., High Value Customers"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Criteria</label>
            {criteria.map((criterion, index) => (
              <div key={index} className="flex gap-2">
                <Select value={criterion.field} onValueChange={(value) => {
                  const newCriteria = [...criteria];
                  newCriteria[index].field = value;
                  setCriteria(newCriteria);
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signup_date">Signup Date</SelectItem>
                    <SelectItem value="last_login">Last Login</SelectItem>
                    <SelectItem value="total_spent">Total Spent</SelectItem>
                    <SelectItem value="project_count">Project Count</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={criterion.operator} onValueChange={(value) => {
                  const newCriteria = [...criteria];
                  newCriteria[index].operator = value;
                  setCriteria(newCriteria);
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greater_than">Greater than</SelectItem>
                    <SelectItem value="less_than">Less than</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  className="flex-1"
                  placeholder="Value"
                  value={criterion.value}
                  onChange={(e) => {
                    const newCriteria = [...criteria];
                    newCriteria[index].value = e.target.value;
                    setCriteria(newCriteria);
                  }}
                />
              </div>
            ))}

            <Button onClick={addCriteria} variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Criteria
            </Button>
          </div>

          <Button
            onClick={() => {
              toast({ title: "Segment created", description: `"${segmentName}" has been saved` });
              setSegmentName("");
              setCriteria([]);
            }}
            disabled={!segmentName || criteria.length === 0}
            className="w-full"
          >
            Create Segment
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Saved Segments</h3>
          {savedSegments.map((segment, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">{segment.name}</h4>
                  <div className="text-sm text-muted-foreground">
                    {segment.size.toLocaleString()} users
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={segment.growth.startsWith("+") ? "default" : "secondary"}>
                    {segment.growth}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
