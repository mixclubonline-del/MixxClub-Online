-- Add RLS policies to payments table for user access

-- Allow users to view payments for their projects (client or engineer)
CREATE POLICY "Users can view their project payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = payments.project_id
    AND (projects.client_id = auth.uid() OR projects.engineer_id = auth.uid())
  )
);

-- Allow admins to view all payments
CREATE POLICY "Admins can view all payments"
ON payments FOR SELECT
USING (is_admin(auth.uid()));

-- System can insert payments (for webhooks and edge functions)
CREATE POLICY "System can create payments"
ON payments FOR INSERT
WITH CHECK (true);

-- System can update payment status (webhooks only)
CREATE POLICY "System can update payments"
ON payments FOR UPDATE
USING (true);