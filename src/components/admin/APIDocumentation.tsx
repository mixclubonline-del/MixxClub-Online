import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code2, BookOpen } from "lucide-react";

export const APIDocumentation = () => {
  const endpoints = [
    {
      method: "GET",
      path: "/api/users",
      description: "Get list of users",
      auth: "Required",
      response: `{
  "users": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string"
    }
  ]
}`,
    },
    {
      method: "POST",
      path: "/api/projects",
      description: "Create a new project",
      auth: "Required",
      request: `{
  "title": "string",
  "description": "string",
  "client_id": "uuid"
}`,
      response: `{
  "id": "uuid",
  "title": "string",
  "status": "pending"
}`,
    },
  ];

  const codeExamples = {
    javascript: `const response = await fetch('https://api.example.com/users', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,
    python: `import requests

response = requests.get('https://api.example.com/users', 
  headers={
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
)
data = response.json()`,
    curl: `curl -X GET 'https://api.example.com/users' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          API Documentation
        </CardTitle>
        <CardDescription>Interactive API explorer with code examples</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {endpoints.map((endpoint, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={endpoint.method === "GET" ? "default" : "secondary"}
                  className={endpoint.method === "POST" ? "bg-green-600" : ""}
                >
                  {endpoint.method}
                </Badge>
                <code className="text-sm font-mono">{endpoint.path}</code>
              </div>

              <p className="text-sm text-muted-foreground">{endpoint.description}</p>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Authentication: {endpoint.auth}</div>
              </div>

              <Tabs defaultValue="javascript">
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    <code>{codeExamples.javascript}</code>
                  </pre>
                </TabsContent>

                <TabsContent value="python">
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    <code>{codeExamples.python}</code>
                  </pre>
                </TabsContent>

                <TabsContent value="curl">
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    <code>{codeExamples.curl}</code>
                  </pre>
                </TabsContent>
              </Tabs>

              {endpoint.response && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Response</div>
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    <code>{endpoint.response}</code>
                  </pre>
                </div>
              )}
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
