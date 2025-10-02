import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, FileText, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  version: number;
  effective_date: string;
  docusign_envelope_id: string | null;
  docusign_status: string | null;
  docusign_sent_at: string | null;
  docusign_completed_at: string | null;
  attorney_reviewed: boolean;
  attorney_email: string | null;
  attorney_name: string | null;
  attorney_notes: string | null;
  attorney_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminLegalDocuments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [activeTab, setActiveTab] = useState("terms");
  const [attorneyEmail, setAttorneyEmail] = useState("");
  const [attorneyName, setAttorneyName] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchDocuments();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      toast.error("Please sign in");
      navigate("/auth");
      return;
    }

    const { data: isAdmin } = await supabase.rpc("is_admin", { user_uuid: user.id });
    if (!isAdmin) {
      toast.error("Access Denied: Admin privileges required");
      navigate("/");
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("*")
        .order("version", { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
      
      // Select first document of active tab
      const tabDoc = data?.find((d) => d.document_type === activeTab);
      if (tabDoc) setSelectedDoc(tabDoc);
    } catch (error: any) {
      toast.error("Failed to load documents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendForReview = async () => {
    if (!selectedDoc || !attorneyEmail || !attorneyName) {
      toast.error("Please fill in attorney information");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("docusign-send-for-review", {
        body: {
          document_id: selectedDoc.id,
          attorney_email: attorneyEmail,
          attorney_name: attorneyName,
        },
      });

      if (error) throw error;

      toast.success("Document sent to attorney for review!");
      fetchDocuments();
      setAttorneyEmail("");
      setAttorneyName("");
    } catch (error: any) {
      toast.error("Failed to send document: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (doc: LegalDocument) => {
    if (doc.attorney_reviewed) {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Reviewed</Badge>;
    }
    if (doc.docusign_status === "sent") {
      return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
    }
    return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Not Sent</Badge>;
  };

  const filteredDocs = documents.filter((d) => d.document_type === activeTab);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Legal Documents</h1>
            <p className="text-muted-foreground">View and manage legal documents with DocuSign integration</p>
          </div>
          <Button onClick={fetchDocuments} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="security">Security Plan</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Version History Sidebar */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">Version History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : filteredDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents found</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredDocs.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedDoc?.id === doc.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                          }`}
                        >
                          <div className="font-medium">v{doc.version}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                          {doc.attorney_reviewed && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Reviewed
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document Content */}
              <Card className="col-span-9">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedDoc?.title || "Select a document"}</CardTitle>
                      {selectedDoc && (
                        <CardDescription>
                          Version {selectedDoc.version} • Last Updated: {new Date(selectedDoc.updated_at).toLocaleString()}
                        </CardDescription>
                      )}
                    </div>
                    {selectedDoc && getStatusBadge(selectedDoc)}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedDoc ? (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{selectedDoc.content}</pre>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Select a document version to view</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Attorney Review Section */}
            {selectedDoc && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Attorney Review Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDoc.attorney_reviewed ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Reviewed by {selectedDoc.attorney_name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reviewed on: {new Date(selectedDoc.attorney_reviewed_at!).toLocaleString()}
                        </p>
                        <p className="text-sm">Email: {selectedDoc.attorney_email}</p>
                        {selectedDoc.attorney_notes && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Review Notes:</p>
                            <p className="text-sm">{selectedDoc.attorney_notes}</p>
                          </div>
                        )}
                      </div>
                    ) : selectedDoc.docusign_status === "sent" ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Clock className="w-5 h-5" />
                          <span className="font-medium">Pending Review</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sent to: {selectedDoc.attorney_email} on {new Date(selectedDoc.docusign_sent_at!).toLocaleString()}
                        </p>
                        <p className="text-sm">DocuSign Envelope ID: {selectedDoc.docusign_envelope_id}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">This document has not been sent for review yet.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Send for Attorney Review</CardTitle>
                    <CardDescription>Use DocuSign to send this document to an attorney for review and signature</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="attorney-email">Attorney Email</Label>
                        <Input
                          id="attorney-email"
                          type="email"
                          placeholder="attorney@lawfirm.com"
                          value={attorneyEmail}
                          onChange={(e) => setAttorneyEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="attorney-name">Attorney Name</Label>
                        <Input
                          id="attorney-name"
                          placeholder="Jane Doe"
                          value={attorneyName}
                          onChange={(e) => setAttorneyName(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSendForReview} disabled={sending || !attorneyEmail || !attorneyName}>
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? "Sending..." : "Send via DocuSign"}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}