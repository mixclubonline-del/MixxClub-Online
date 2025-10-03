-- Fix security linter warning for function search path
ALTER FUNCTION audit_financial_changes() SET search_path = public;