import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MermaidDiagram } from "./MermaidDiagram";

export const MerchStoreFlowchart = () => {
  const flowchartCode = `
graph TD
    A[Admin: Sync Products from Printful] --> B{Products Synced?}
    B -->|Yes| C[Products Stored in Database]
    B -->|No| D[Error: Check API Key]
    
    C --> E[User Visits Merch Store]
    E --> F[Browse Available Products]
    
    F --> G{User Logged In?}
    G -->|No| H[Redirect to Auth Page]
    G -->|Yes| I[Add Items to Cart]
    
    H --> I
    
    I --> J[View Cart Summary]
    J --> K[Click 'Proceed to Checkout']
    
    K --> L[System Calls printful-create-order Function]
    L --> M{Order Created?}
    
    M -->|Success| N[Printful Generates Order]
    M -->|Failure| O[Show Error Message]
    
    N --> P[User Receives Order Confirmation]
    P --> Q[Printful Fulfills Order]
    Q --> R[Product Ships to Customer]
    
    R --> S[Order Complete]
    
    style A fill:#4f46e5,stroke:#4338ca,color:#fff
    style C fill:#10b981,stroke:#059669,color:#fff
    style S fill:#10b981,stroke:#059669,color:#fff
    style D fill:#ef4444,stroke:#dc2626,color:#fff
    style O fill:#ef4444,stroke:#dc2626,color:#fff
    style G fill:#f59e0b,stroke:#d97706,color:#fff
    style M fill:#f59e0b,stroke:#d97706,color:#fff
  `;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merch Store System Flow</CardTitle>
        <CardDescription>
          Complete workflow from product sync to customer delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <MermaidDiagram chart={flowchartCode} />
        </div>
        
        <div className="space-y-4 mt-6 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Key Components:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Product Sync:</strong> Admin imports products from Printful via API</li>
              <li><strong>Database Storage:</strong> Products stored in merch_products and merch_variants tables</li>
              <li><strong>User Shopping:</strong> Authenticated users can browse and add items to cart</li>
              <li><strong>Order Processing:</strong> printful-create-order edge function handles order creation</li>
              <li><strong>Fulfillment:</strong> Printful automatically fulfills and ships orders</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Users must be logged in to make purchases</li>
              <li>Cart totals calculated in real-time based on selected variants</li>
              <li>Printful API key must be configured in edge function secrets</li>
              <li>All orders are tracked in the database for record keeping</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
