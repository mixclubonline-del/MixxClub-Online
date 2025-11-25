import { useState } from "react";
import { useLabelPartnerships, useLabelServices, useUserServiceRequests, useSubmitServiceRequest } from "@/hooks/useLabelServices";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, CheckCircle2, Clock, XCircle, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function LabelServices() {
  const { user } = useAuth();
  const { data: partnerships, isLoading: partnershipsLoading } = useLabelPartnerships();
  const { data: services, isLoading: servicesLoading } = useLabelServices();
  const { data: userRequests } = useUserServiceRequests(user?.id);
  const submitRequest = useSubmitServiceRequest();

  const [selectedService, setSelectedService] = useState<any>(null);
  const [submissionData, setSubmissionData] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmitRequest = async () => {
    if (!user || !selectedService) return;

    await submitRequest.mutateAsync({
      serviceId: selectedService.id,
      artistId: user.id,
      submissionData: { message: submissionData },
    });

    setSubmissionData("");
    setDialogOpen(false);
    setSelectedService(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (partnershipsLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Label Services
          </h1>
          <p className="text-muted-foreground mt-2">
            Access exclusive services from our partner labels and industry professionals
          </p>
        </div>

        <Tabs defaultValue="services" className="space-y-8">
          <TabsList>
            <TabsTrigger value="services">Available Services</TabsTrigger>
            <TabsTrigger value="partnerships">Label Partnerships</TabsTrigger>
            {user && <TabsTrigger value="requests">My Requests</TabsTrigger>}
          </TabsList>

          {/* Available Services */}
          <TabsContent value="services" className="space-y-6">
            {services && services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service: any) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary">{service.service_type}</Badge>
                        <span className="text-2xl font-bold text-primary">
                          ${service.price}
                        </span>
                      </div>
                      <CardTitle className="mt-2">{service.service_name}</CardTitle>
                      <CardDescription>
                        {service.label_partnerships?.label_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {service.description || "Professional service tailored to your needs"}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Dialog open={dialogOpen && selectedService?.id === service.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) setSelectedService(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full"
                            onClick={() => setSelectedService(service)}
                            disabled={!user}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Request Service
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request {service.service_name}</DialogTitle>
                            <DialogDescription>
                              Submit your request and we'll get back to you shortly
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Service Details</Label>
                              <p className="text-sm text-muted-foreground">
                                {service.service_name} - ${service.price}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="message">Your Message</Label>
                              <Textarea
                                id="message"
                                placeholder="Tell us about your project and requirements..."
                                value={submissionData}
                                onChange={(e) => setSubmissionData(e.target.value)}
                                rows={6}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={handleSubmitRequest}
                              disabled={submitRequest.isPending || !submissionData.trim()}
                            >
                              Submit Request
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No services available</h3>
                <p className="text-muted-foreground">
                  Check back later for new services from our partners
                </p>
              </div>
            )}
          </TabsContent>

          {/* Label Partnerships */}
          <TabsContent value="partnerships" className="space-y-6">
            {partnerships && partnerships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partnerships.map((partnership: any) => (
                  <Card key={partnership.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle>{partnership.label_name}</CardTitle>
                          <CardDescription>{partnership.label_type}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {partnership.contact_email && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Contact</Label>
                            <p className="text-sm">{partnership.contact_email}</p>
                          </div>
                        )}
                        {partnership.revenue_share && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Revenue Share</Label>
                            <p className="text-sm font-semibold">{partnership.revenue_share}%</p>
                          </div>
                        )}
                        <Separator />
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <div className="mt-1">
                            <Badge variant={partnership.partnership_status === 'active' ? 'default' : 'secondary'}>
                              {partnership.partnership_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No partnerships available</h3>
                <p className="text-muted-foreground">
                  We're working on bringing you the best label partnerships
                </p>
              </div>
            )}
          </TabsContent>

          {/* User Requests */}
          {user && (
            <TabsContent value="requests" className="space-y-6">
              {userRequests && userRequests.length > 0 ? (
                <div className="space-y-4">
                  {userRequests.map((request: any) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.request_status)}
                            <CardTitle className="text-lg">
                              {request.label_services?.service_name}
                            </CardTitle>
                          </div>
                          {getStatusBadge(request.request_status)}
                        </div>
                        <CardDescription>
                          Submitted {new Date(request.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service Type:</span>
                            <span className="font-medium">{request.label_services?.service_type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-medium">${request.label_services?.price}</span>
                          </div>
                          {request.submission_data?.message && (
                            <>
                              <Separator className="my-2" />
                              <div>
                                <Label className="text-xs text-muted-foreground">Your Message:</Label>
                                <p className="text-sm mt-1">{request.submission_data.message}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No service requests yet</h3>
                  <p className="text-muted-foreground">
                    Submit a request to get started with our label services
                  </p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
