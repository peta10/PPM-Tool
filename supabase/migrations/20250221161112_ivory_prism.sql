/*
  # Fix Tool Submission Visibility

  1. Updates
    - Modifies the combined_tools_view to properly handle tool submissions
    - Ensures proper joining of criteria and tags
    - Fixes submission status handling

  2. Security
    - Maintains existing security settings
    - Ensures proper access control
*/

-- Drop and recreate the view with proper submission handling
CREATE OR REPLACE VIEW public.combined_tools_view WITH (security_barrier) AS
WITH criteria_array AS (
    SELECT 
        t.id AS tool_id,
        jsonb_agg(
            jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'ranking', COALESCE(ct.ranking, tsc.ranking),
                'description', COALESCE(ct.description, tsc.description)
            )
        ) AS criteria
    FROM (
        SELECT id, name, type FROM tools
        UNION ALL
        SELECT id, name, type FROM tool_submissions 
        WHERE status = 'submitted' OR status = 'approved'
    ) t
    LEFT JOIN criteria_tools ct ON t.id = ct.tool_id
    LEFT JOIN tool_submission_criteria tsc ON t.id = tsc.submission_id
    LEFT JOIN criteria c ON ct.criteria_id = c.id OR tsc.criteria_id = c.id
    GROUP BY t.id
),
tags_array AS (
    SELECT 
        t.id AS tool_id,
        jsonb_agg(
            jsonb_build_object(
                'id', tg.id,
                'name', tg.name,
                'type', tt.name
            )
        ) AS tags
    FROM (
        SELECT id, name, type FROM tools
        UNION ALL
        SELECT id, name, type FROM tool_submissions 
        WHERE status = 'submitted' OR status = 'approved'
    ) t
    LEFT JOIN (
        SELECT tool_id, tag_id FROM tag_tools
        UNION ALL
        SELECT submission_id, tag_id FROM tool_submission_tags
    ) combined_tags ON t.id = combined_tags.tool_id
    LEFT JOIN tags tg ON combined_tags.tag_id = tg.id
    LEFT JOIN tag_type tt ON tg.tag_type_id = tt.id
    GROUP BY t.id
)
SELECT 
    t.id,
    t.name,
    t.type,
    CASE 
        WHEN ts.user_id IS NOT NULL THEN ts.user_id
        ELSE t.created_by
    END as created_by,
    COALESCE(ca.criteria, '[]'::jsonb) AS criteria,
    COALESCE(ta.tags, '[]'::jsonb) AS tags,
    CASE 
        WHEN ts.created_at IS NOT NULL THEN ts.created_at
        ELSE t.created_on
    END as created_on
FROM (
    SELECT id, name, type, created_by, created_on FROM tools
    UNION ALL
    SELECT id, name, type, user_id as created_by, created_at as created_on 
    FROM tool_submissions 
    WHERE status = 'submitted' OR status = 'approved'
) t
LEFT JOIN tool_submissions ts ON t.id = ts.id
LEFT JOIN criteria_array ca ON t.id = ca.tool_id
LEFT JOIN tags_array ta ON t.id = ta.tool_id;

-- Ensure public access to the view
GRANT SELECT ON combined_tools_view TO PUBLIC;