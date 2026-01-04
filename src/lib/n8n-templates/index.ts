// n8n Workflow Templates for MixClub
// These can be imported into n8n to automate platform events

export const sessionEventsWorkflow = {
  name: "MixClub - Session Events",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "session-events",
        options: {}
      },
      id: "webhook-trigger",
      name: "Session Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300]
    },
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: "={{ $json.event }}",
              operation: "equals",
              value2: "session.booked"
            }
          ]
        }
      },
      id: "if-booked",
      name: "Is Booked?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [450, 200]
    },
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: "={{ $json.event }}",
              operation: "equals",
              value2: "session.completed"
            }
          ]
        }
      },
      id: "if-completed",
      name: "Is Completed?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [450, 400]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: "Content-Type", value: "application/json" },
            { name: "x-webhook-timestamp", value: "={{ Date.now() }}" },
            { name: "x-webhook-signature", value: "={{ /* Calculate HMAC */ }}" }
          ]
        },
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "send_notification" },
            { name: "userId", value: "={{ $json.data.artist_id }}" },
            { name: "data", value: '={{ { "title": "Session Booked!", "message": "Your session has been confirmed", "type": "session" } }}' }
          ]
        }
      },
      id: "notify-booked",
      name: "Notify Session Booked",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [700, 200]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "award_xp" },
            { name: "userId", value: "={{ $json.data.artist_id }}" },
            { name: "data", value: '={{ { "points": 100, "action_type": "session_completed", "description": "Completed a session" } }}' }
          ]
        }
      },
      id: "award-xp-completed",
      name: "Award Completion XP",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [700, 400]
    }
  ],
  connections: {
    "Session Webhook": { main: [[{ node: "Is Booked?", type: "main", index: 0 }, { node: "Is Completed?", type: "main", index: 0 }]] },
    "Is Booked?": { main: [[{ node: "Notify Session Booked", type: "main", index: 0 }], []] },
    "Is Completed?": { main: [[{ node: "Award Completion XP", type: "main", index: 0 }], []] }
  }
};

export const projectEventsWorkflow = {
  name: "MixClub - Project Events",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "project-events",
        options: {}
      },
      id: "webhook-trigger",
      name: "Project Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300]
    },
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: "={{ $json.event }}",
              operation: "equals",
              value2: "project.created"
            }
          ]
        }
      },
      id: "if-created",
      name: "Is Created?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [450, 200]
    },
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: "={{ $json.event }}",
              operation: "equals",
              value2: "project.completed"
            }
          ]
        }
      },
      id: "if-completed",
      name: "Is Completed?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [450, 400]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "award_xp" },
            { name: "userId", value: "={{ $json.data.user_id }}" },
            { name: "data", value: '={{ { "points": 50, "action_type": "project_created", "description": "Created a new project" } }}' }
          ]
        }
      },
      id: "award-xp-created",
      name: "Award Creation XP",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [700, 200]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "unlock_achievement" },
            { name: "userId", value: "={{ $json.data.user_id }}" },
            { name: "data", value: '={{ { "achievement_type": "first_project", "title": "First Mix Complete!", "description": "Completed your first project", "icon": "check-circle", "badge_name": "Debut Drop" } }}' }
          ]
        }
      },
      id: "unlock-achievement",
      name: "Unlock Achievement",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [700, 400]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "trigger_email_sequence" },
            { name: "userId", value: "={{ $json.data.user_id }}" },
            { name: "data", value: '={{ { "sequenceId": "project_completed_followup", "skipIfEnrolled": true } }}' }
          ]
        }
      },
      id: "trigger-sequence",
      name: "Trigger Review Sequence",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [900, 400]
    }
  ],
  connections: {
    "Project Webhook": { main: [[{ node: "Is Created?", type: "main", index: 0 }, { node: "Is Completed?", type: "main", index: 0 }]] },
    "Is Created?": { main: [[{ node: "Award Creation XP", type: "main", index: 0 }], []] },
    "Is Completed?": { main: [[{ node: "Unlock Achievement", type: "main", index: 0 }], []] },
    "Unlock Achievement": { main: [[{ node: "Trigger Review Sequence", type: "main", index: 0 }]] }
  }
};

export const reviewEventsWorkflow = {
  name: "MixClub - Review Events",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "review-events",
        options: {}
      },
      id: "webhook-trigger",
      name: "Review Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300]
    },
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: "={{ $json.event }}",
              operation: "equals",
              value2: "review.submitted"
            }
          ]
        }
      },
      id: "if-submitted",
      name: "Is Submitted?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [450, 300]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "award_xp" },
            { name: "userId", value: "={{ $json.data.reviewer_id }}" },
            { name: "data", value: '={{ { "points": 25, "action_type": "review_given", "description": "Left a review" } }}' }
          ]
        }
      },
      id: "award-reviewer-xp",
      name: "Award Reviewer XP",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [700, 200]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "send_notification" },
            { name: "userId", value: "={{ $json.data.reviewed_id }}" },
            { name: "data", value: '={{ { "title": "New Review Received!", "message": "You received a " + $json.data.rating + "-star review", "type": "review" } }}' }
          ]
        }
      },
      id: "notify-reviewed",
      name: "Notify Reviewed User",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [700, 400]
    },
    {
      parameters: {
        conditions: {
          number: [
            {
              value1: "={{ $json.data.rating }}",
              operation: "equal",
              value2: 5
            }
          ]
        }
      },
      id: "is-five-star",
      name: "Is 5 Star?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [900, 400]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "award_xp" },
            { name: "userId", value: "={{ $json.data.reviewed_id }}" },
            { name: "data", value: '={{ { "points": 100, "action_type": "five_star_received", "description": "Received a 5-star review!" } }}' }
          ]
        }
      },
      id: "award-five-star-xp",
      name: "Award 5-Star XP",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [1100, 300]
    }
  ],
  connections: {
    "Review Webhook": { main: [[{ node: "Is Submitted?", type: "main", index: 0 }]] },
    "Is Submitted?": { main: [[{ node: "Award Reviewer XP", type: "main", index: 0 }, { node: "Notify Reviewed User", type: "main", index: 0 }], []] },
    "Notify Reviewed User": { main: [[{ node: "Is 5 Star?", type: "main", index: 0 }]] },
    "Is 5 Star?": { main: [[{ node: "Award 5-Star XP", type: "main", index: 0 }], []] }
  }
};

export const referralEventsWorkflow = {
  name: "MixClub - Referral Events",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "referral-events",
        options: {}
      },
      id: "webhook-trigger",
      name: "Referral Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300]
    },
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: "={{ $json.event }}",
              operation: "equals",
              value2: "referral.signup"
            }
          ]
        }
      },
      id: "if-signup",
      name: "Is Signup?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [450, 200]
    },
    {
      parameters: {
        conditions: {
          string: [
            {
              value1: "={{ $json.event }}",
              operation: "equals",
              value2: "referral.converted"
            }
          ]
        }
      },
      id: "if-converted",
      name: "Is Converted?",
      type: "n8n-nodes-base.if",
      typeVersion: 1,
      position: [450, 400]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "award_xp" },
            { name: "userId", value: "={{ $json.data.referrer_id }}" },
            { name: "data", value: '={{ { "points": 50, "action_type": "referral_signup", "description": "Referral signed up" } }}' }
          ]
        }
      },
      id: "award-signup-xp",
      name: "Award Signup XP",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [700, 200]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "award_xp" },
            { name: "userId", value: "={{ $json.data.referrer_id }}" },
            { name: "data", value: '={{ { "points": 200, "action_type": "referral_converted", "description": "Referral made first purchase" } }}' }
          ]
        }
      },
      id: "award-conversion-xp",
      name: "Award Conversion XP",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [700, 350]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "unlock_achievement" },
            { name: "userId", value: "={{ $json.data.referrer_id }}" },
            { name: "data", value: '={{ { "achievement_type": "first_referral", "title": "Talent Scout", "description": "Your first referral converted!", "icon": "users", "badge_name": "Networker", "badge_type": "milestone" } }}' }
          ]
        }
      },
      id: "unlock-referral-achievement",
      name: "Unlock Referral Achievement",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [700, 500]
    },
    {
      parameters: {
        method: "POST",
        url: "https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler",
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: "action", value: "send_push_notification" },
            { name: "userId", value: "={{ $json.data.referrer_id }}" },
            { name: "data", value: '={{ { "title": "🎉 Referral Bonus!", "body": "Your referral just converted! You earned 200 XP!", "type": "celebration" } }}' }
          ]
        }
      },
      id: "send-celebration",
      name: "Send Celebration",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 3,
      position: [900, 400]
    }
  ],
  connections: {
    "Referral Webhook": { main: [[{ node: "Is Signup?", type: "main", index: 0 }, { node: "Is Converted?", type: "main", index: 0 }]] },
    "Is Signup?": { main: [[{ node: "Award Signup XP", type: "main", index: 0 }], []] },
    "Is Converted?": { main: [[{ node: "Award Conversion XP", type: "main", index: 0 }, { node: "Unlock Referral Achievement", type: "main", index: 0 }], []] },
    "Unlock Referral Achievement": { main: [[{ node: "Send Celebration", type: "main", index: 0 }]] }
  }
};

export const allWorkflows = {
  sessionEvents: sessionEventsWorkflow,
  projectEvents: projectEventsWorkflow,
  reviewEvents: reviewEventsWorkflow,
  referralEvents: referralEventsWorkflow
};
