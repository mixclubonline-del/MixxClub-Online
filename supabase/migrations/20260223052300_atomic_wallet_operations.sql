-- Atomic Wallet Operations
-- Fix race conditions in earn/spend/gift by doing all math in Postgres
-- with FOR UPDATE row locks to prevent concurrent modification.

-- ══════════════════════════════════════════════
-- 1. ATOMIC EARN COINZ
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.earn_coinz(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_description text DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_reference_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet mixx_wallets;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock the row to prevent concurrent modifications
  SELECT * INTO v_wallet
  FROM mixx_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Create wallet if it doesn't exist
  IF v_wallet IS NULL THEN
    INSERT INTO mixx_wallets (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_wallet;
  END IF;

  -- Atomic balance update
  UPDATE mixx_wallets
  SET
    earned_balance = earned_balance + p_amount,
    total_earned = total_earned + p_amount
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO mixx_transactions (
    user_id, transaction_type, source, amount,
    balance_type, description, reference_type, reference_id
  ) VALUES (
    p_user_id, 'EARN', p_source, p_amount,
    'earned', p_description, p_reference_type, p_reference_id
  );

  -- Return updated wallet
  SELECT * INTO v_wallet FROM mixx_wallets WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'earned_balance', v_wallet.earned_balance,
    'purchased_balance', v_wallet.purchased_balance,
    'total_earned', v_wallet.total_earned,
    'amount', p_amount
  );
END;
$function$;


-- ══════════════════════════════════════════════
-- 2. ATOMIC SPEND COINZ
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.spend_coinz(
  p_user_id uuid,
  p_amount integer,
  p_source text,
  p_description text DEFAULT NULL,
  p_prefer_earned boolean DEFAULT true,
  p_reference_type text DEFAULT NULL,
  p_reference_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet mixx_wallets;
  v_earned_to_spend integer := 0;
  v_purchased_to_spend integer := 0;
  v_total_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock the row to prevent concurrent modifications
  SELECT * INTO v_wallet
  FROM mixx_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  v_total_balance := v_wallet.earned_balance + v_wallet.purchased_balance;

  IF v_total_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Have %, need %', v_total_balance, p_amount;
  END IF;

  -- Split across balance types
  IF p_prefer_earned THEN
    v_earned_to_spend := LEAST(v_wallet.earned_balance, p_amount);
    v_purchased_to_spend := p_amount - v_earned_to_spend;
  ELSE
    v_purchased_to_spend := LEAST(v_wallet.purchased_balance, p_amount);
    v_earned_to_spend := p_amount - v_purchased_to_spend;
  END IF;

  -- Atomic balance update
  UPDATE mixx_wallets
  SET
    earned_balance = earned_balance - v_earned_to_spend,
    purchased_balance = purchased_balance - v_purchased_to_spend,
    total_spent = total_spent + p_amount
  WHERE user_id = p_user_id;

  -- Record transaction(s)
  IF v_earned_to_spend > 0 THEN
    INSERT INTO mixx_transactions (
      user_id, transaction_type, source, amount,
      balance_type, description, reference_type, reference_id
    ) VALUES (
      p_user_id, 'SPEND', p_source, v_earned_to_spend,
      'earned', p_description, p_reference_type, p_reference_id
    );
  END IF;

  IF v_purchased_to_spend > 0 THEN
    INSERT INTO mixx_transactions (
      user_id, transaction_type, source, amount,
      balance_type, description, reference_type, reference_id
    ) VALUES (
      p_user_id, 'SPEND', p_source, v_purchased_to_spend,
      'purchased', p_description, p_reference_type, p_reference_id
    );
  END IF;

  -- Return updated wallet
  SELECT * INTO v_wallet FROM mixx_wallets WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'earned_balance', v_wallet.earned_balance,
    'purchased_balance', v_wallet.purchased_balance,
    'total_spent', v_wallet.total_spent,
    'amount', p_amount
  );
END;
$function$;


-- ══════════════════════════════════════════════
-- 3. ATOMIC GIFT COINZ
-- Sender deduct + recipient credit + both
-- transactions in a single atomic operation.
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.gift_coinz(
  p_sender_id uuid,
  p_recipient_id uuid,
  p_amount integer,
  p_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sender_wallet mixx_wallets;
  v_recipient_wallet mixx_wallets;
  v_purchased_to_spend integer;
  v_earned_to_spend integer;
  v_total_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot gift to yourself';
  END IF;

  -- Lock SENDER row first (consistent lock ordering prevents deadlocks)
  SELECT * INTO v_sender_wallet
  FROM mixx_wallets
  WHERE user_id = p_sender_id
  FOR UPDATE;

  IF v_sender_wallet IS NULL THEN
    RAISE EXCEPTION 'Sender wallet not found';
  END IF;

  v_total_balance := v_sender_wallet.earned_balance + v_sender_wallet.purchased_balance;

  IF v_total_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Have %, need %', v_total_balance, p_amount;
  END IF;

  -- Prefer spending purchased balance for gifts
  v_purchased_to_spend := LEAST(v_sender_wallet.purchased_balance, p_amount);
  v_earned_to_spend := p_amount - v_purchased_to_spend;

  -- Ensure recipient wallet exists, lock it
  INSERT INTO mixx_wallets (user_id)
  VALUES (p_recipient_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_recipient_wallet
  FROM mixx_wallets
  WHERE user_id = p_recipient_id
  FOR UPDATE;

  -- === All locks acquired. Now do the actual updates atomically. ===

  -- Deduct from sender
  UPDATE mixx_wallets
  SET
    purchased_balance = purchased_balance - v_purchased_to_spend,
    earned_balance = earned_balance - v_earned_to_spend,
    total_spent = total_spent + p_amount,
    total_gifted = total_gifted + p_amount
  WHERE user_id = p_sender_id;

  -- Credit to recipient
  UPDATE mixx_wallets
  SET
    earned_balance = earned_balance + p_amount,
    total_received = total_received + p_amount,
    total_earned = total_earned + p_amount
  WHERE user_id = p_recipient_id;

  -- Record paired transactions
  INSERT INTO mixx_transactions (
    user_id, transaction_type, source, amount,
    balance_type, counterparty_id, description
  ) VALUES
  (
    p_sender_id, 'GIFT_SENT', 'gift', p_amount,
    CASE WHEN v_purchased_to_spend > 0 THEN 'purchased' ELSE 'earned' END,
    p_recipient_id, COALESCE(p_message, 'Gift sent')
  ),
  (
    p_recipient_id, 'GIFT_RECEIVED', 'gift', p_amount,
    'earned',
    p_sender_id, COALESCE(p_message, 'Gift received')
  );

  -- Return result
  SELECT * INTO v_sender_wallet FROM mixx_wallets WHERE user_id = p_sender_id;

  RETURN jsonb_build_object(
    'success', true,
    'sender_earned_balance', v_sender_wallet.earned_balance,
    'sender_purchased_balance', v_sender_wallet.purchased_balance,
    'amount', p_amount,
    'recipient_id', p_recipient_id
  );
END;
$function$;


-- ══════════════════════════════════════════════
-- 4. INDEXES on hot tables for 500-user scale
-- ══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_mixx_transactions_user_id
  ON mixx_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_mixx_transactions_created_at
  ON mixx_transactions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mixx_transactions_user_type
  ON mixx_transactions (user_id, transaction_type);
