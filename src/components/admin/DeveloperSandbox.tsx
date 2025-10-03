import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DeveloperSandbox = () => {
  const { toast } = useToast();
  const [endpoint, setEndpoint] = useState("/api/users");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("{}");
  const [response, setResponse] = useState("");

  const handleTest = () => {
    const mockResponse = {
      status: 200,
      data: {
        users: [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" }
        ]
      },
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": "98"
      },
      time: "156ms"
    };

    setResponse(JSON.stringify(mockResponse, null, 2));
    toast({ title: "Request sent", description: `${method} ${endpoint} - 200 OK` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          Developer Sandbox
        </CardTitle>
        <CardDescription>Test API endpoints and inspect requests/responses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>

          <Select value={endpoint} onValueChange={setEndpoint}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/api/users">GET /api/users</SelectItem>
              <SelectItem value="/api/projects">GET /api/projects</SelectItem>
              <SelectItem value="/api/audio/upload">POST /api/audio/upload</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleTest}>
            <Play className="mr-2 h-4 w-4" />
            Send Request
          </Button>
        </div>

        {(method === "POST" || method === "PUT") && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Request Body</label>
            <Textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        )}

        {response && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Response</label>
            <Textarea
              value={response}
              readOnly
              rows={12}
              className="font-mono text-sm bg-muted"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
