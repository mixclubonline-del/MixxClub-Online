/**
 * useReferralRedemption — Processes ?ref= param on signup.
 * 
 * On successful auth, looks up referrer by user ID in the ref param,
 * updates the referrals table, and awards coinz to both parties.
 */

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const REFERRER_REWARD = 100;
const REFEREE_REWARD = 50;

export function useReferralRedemption() {
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (!refCode || processedRef.current) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (processedRef.current) return;
        if (event !== 'SIGNED_IN' || !session?.user) return;

        const newUserId = session.user.id;
        // Don't self-refer
        if (newUserId === refCode) return;

        processedRef.current = true;

        try {
          // Check if referrer exists
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', refCode)
            .maybeSingle();

          if (!referrerProfile) return;

          // Check if already referred
          const { data: existingReferral } = await supabase
            .from('referrals')
            .select('id')
            .eq('referrer_id', refCode)
            .eq('referred_user_id', newUserId)
            .maybeSingle();

          if (existingReferral) return;

          // Find an open referral record from this referrer, or create one
          const { data: openReferral } = await supabase
            .from('referrals')
            .select('id')
            .eq('referrer_id', refCode)
            .is('referred_user_id', null)
            .eq('status', 'pending')
            .limit(1)
            .maybeSingle();

          if (openReferral) {
            // Complete existing referral
            await supabase
              .from('referrals')
              .update({
                referred_user_id: newUserId,
                status: 'completed',
                converted_at: new Date().toISOString(),
              })
              .eq('id', openReferral.id);
          } else {
            // Create new completed referral
            await supabase
              .from('referrals')
              .insert({
                referrer_id: refCode,
                referral_code: `REF-${refCode.substring(0, 8)}`,
                referred_user_id: newUserId,
                status: 'completed',
                converted_at: new Date().toISOString(),
              });
          }

          // Note: referred_by tracking is handled via the referrals table record
          await (supabase.rpc as any)('earn_coinz', {
            p_user_id: refCode,
            p_amount: REFERRER_REWARD,
            p_source: 'referral',
            p_description: 'Referral bonus: new user signed up',
            p_reference_type: 'referral',
            p_reference_id: newUserId,
          });

          // Award coinz to new user via RPC
          await (supabase.rpc as any)('earn_coinz', {
            p_user_id: newUserId,
            p_amount: REFEREE_REWARD,
            p_source: 'referral',
            p_description: 'Welcome bonus: signed up via referral',
            p_reference_type: 'referral',
            p_reference_id: refCode,
          });

          console.log('[Referral] Successfully processed referral', { referrer: refCode, referee: newUserId });
        } catch (err) {
          console.error('[Referral] Failed to process referral:', err);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [searchParams]);
}
