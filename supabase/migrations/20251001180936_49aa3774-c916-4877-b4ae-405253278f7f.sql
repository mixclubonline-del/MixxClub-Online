-- Phase 2.2: Artist Feedback & Rating System - Functions and Triggers Only
-- Function to update engineer stats after review
CREATE OR REPLACE FUNCTION update_engineer_stats_after_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avg_rating numeric;
  v_total_reviews integer;
  v_bonus_amt numeric;
BEGIN
  -- Calculate new average rating
  SELECT 
    AVG(rating),
    COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM project_reviews
  WHERE project_reviews.engineer_id = NEW.engineer_id;
  
  -- Update engineer profile
  UPDATE engineer_profiles
  SET 
    rating_average = ROUND(v_avg_rating, 2),
    total_reviews = v_total_reviews,
    updated_at = now()
  WHERE engineer_profiles.user_id = NEW.engineer_id;
  
  -- Award bonus for high ratings (4.5+)
  IF NEW.rating >= 4.5 THEN
    SELECT ee.base_amount * 0.05 INTO v_bonus_amt
    FROM engineer_earnings ee
    WHERE ee.project_id = NEW.project_id
    AND ee.engineer_id = NEW.engineer_id;
    
    IF v_bonus_amt IS NOT NULL THEN
      -- Add performance bonus
      INSERT INTO performance_bonuses (
        engineer_id,
        project_id,
        bonus_type,
        bonus_amount,
        description,
        status
      ) VALUES (
        NEW.engineer_id,
        NEW.project_id,
        'high_rating',
        v_bonus_amt,
        'High rating bonus (4.5+ stars): ' || NEW.rating::text || ' stars',
        'approved'
      );
      
      -- Update earnings with bonus
      UPDATE engineer_earnings ee
      SET 
        bonus_amount = COALESCE(ee.bonus_amount, 0) + v_bonus_amt,
        total_amount = ee.base_amount + COALESCE(ee.bonus_amount, 0) + v_bonus_amt,
        updated_at = now()
      WHERE ee.project_id = NEW.project_id
      AND ee.engineer_id = NEW.engineer_id;
      
      -- Notify engineer
      PERFORM create_notification(
        NEW.engineer_id,
        'bonus_awarded',
        'Bonus Awarded! 🎉',
        'You earned a $' || v_bonus_amt::text || ' bonus for excellent work (' || NEW.rating::text || ' stars)',
        '/engineer-crm?tab=business',
        NEW.project_id,
        'bonus',
        jsonb_build_object('amount', v_bonus_amt, 'rating', NEW.rating)
      );
    END IF;
  END IF;
  
  -- Notify engineer about review
  PERFORM create_notification(
    NEW.engineer_id,
    'review_received',
    'New Review Received',
    'You received a ' || NEW.rating::text || ' star review',
    '/engineer-crm?tab=profile',
    NEW.id,
    'review',
    jsonb_build_object('rating', NEW.rating, 'project_id', NEW.project_id)
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_engineer_stats_after_review ON project_reviews;
CREATE TRIGGER trigger_update_engineer_stats_after_review
  AFTER INSERT ON project_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_engineer_stats_after_review();

-- Function to prompt for review when project completes
CREATE OR REPLACE FUNCTION prompt_project_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' 
     AND (OLD.status IS NULL OR OLD.status != 'completed') 
     AND NEW.engineer_id IS NOT NULL THEN
    -- Notify artist to leave review
    PERFORM create_notification(
      NEW.client_id,
      'review_prompt',
      'Rate Your Engineer',
      'Your project is complete! Please rate your experience with the engineer.',
      '/artist-crm?review=' || NEW.id::text,
      NEW.id,
      'review_prompt',
      jsonb_build_object('engineer_id', NEW.engineer_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prompt_project_review ON projects;
CREATE TRIGGER trigger_prompt_project_review
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION prompt_project_review();