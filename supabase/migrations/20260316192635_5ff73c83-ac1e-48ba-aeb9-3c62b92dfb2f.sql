
-- earn_coinz: Atomic wallet credit with row locking and transaction recording
CREATE OR REPLACE FUNCTION public.earn_coinz(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT DEFAULT 'engagement',
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_wallet public.mixx_wallets;
  v_new_earned INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock the wallet row to prevent concurrent updates
  SELECT * INTO v_wallet FROM public.mixx_wallets WHERE user_id = p_user_id FOR UPDATE;

  IF v_wallet IS NULL THEN
    INSERT INTO public.mixx_wallets (user_id, earned_balance, total_earned)
    VALUES (p_user_id, p_amount, p_amount)
    RETURNING * INTO v_wallet;
    v_new_earned := p_amount;
  ELSE
    v_new_earned := COALESCE(v_wallet.earned_balance, 0) + p_amount;
    UPDATE public.mixx_wallets
    SET earned_balance = v_new_earned,
        total_earned = COALESCE(total_earned, 0) + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  -- Record transaction
  INSERT INTO public.mixx_transactions (
    user_id, transaction_type, source, amount, balance_type, description,
    metadata
  ) VALUES (
    p_user_id, 'EARN', p_source, p_amount, 'earned',
    COALESCE(p_description, 'Earned ' || p_amount || ' MixxCoinz'),
    jsonb_build_object('reference_type', p_reference_type, 'reference_id', p_reference_id)
  );

  RETURN json_build_object('success', true, 'new_balance', v_new_earned, 'amount', p_amount);
END;
$$;

-- spend_coinz: Atomic wallet debit with balance check, row locking, and transaction recording
CREATE OR REPLACE FUNCTION public.spend_coinz(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT DEFAULT 'marketplace',
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_wallet public.mixx_wallets;
  v_total_balance INTEGER;
  v_remaining INTEGER;
  v_earned_debit INTEGER;
  v_purchased_debit INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock the wallet row
  SELECT * INTO v_wallet FROM public.mixx_wallets WHERE user_id = p_user_id FOR UPDATE;

  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  v_total_balance := COALESCE(v_wallet.earned_balance, 0) + COALESCE(v_wallet.purchased_balance, 0);

  IF v_total_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: have %, need %', v_total_balance, p_amount;
  END IF;

  -- Spend earned coinz first, then purchased
  v_remaining := p_amount;
  v_earned_debit := LEAST(v_remaining, COALESCE(v_wallet.earned_balance, 0));
  v_remaining := v_remaining - v_earned_debit;
  v_purchased_debit := v_remaining;

  UPDATE public.mixx_wallets
  SET earned_balance = COALESCE(earned_balance, 0) - v_earned_debit,
      purchased_balance = COALESCE(purchased_balance, 0) - v_purchased_debit,
      total_spent = COALESCE(total_spent, 0) + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO public.mixx_transactions (
    user_id, transaction_type, source, amount, balance_type, description,
    metadata
  ) VALUES (
    p_user_id, 'SPEND', p_source, p_amount, 'mixed',
    COALESCE(p_description, 'Spent ' || p_amount || ' MixxCoinz'),
    jsonb_build_object('earned_debit', v_earned_debit, 'purchased_debit', v_purchased_debit, 'reference_type', p_reference_type, 'reference_id', p_reference_id)
  );

  RETURN json_build_object(
    'success', true,
    'amount_spent', p_amount,
    'new_earned_balance', COALESCE(v_wallet.earned_balance, 0) - v_earned_debit,
    'new_purchased_balance', COALESCE(v_wallet.purchased_balance, 0) - v_purchased_debit
  );
END;
$$;
