/*
  # Fix tools view to include all criteria

  1. Changes
    - Remove NULL filter from criteria aggregation
    - Ensure all criteria are included regardless of ranking status
    - Keep only application tools in the view
*/

-- Drop and recreate the view with all criteria included
CREATE OR REPLACE VIEW public.tools_view WITH (security_barrier) AS
WITH criteria_array AS (
    SELECT 
        t.id AS tool_id,
        jsonb_agg(
            jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'ranking', ct.ranking,
                'description', ct.description
            )
            ORDER BY c.name
        ) FILTER (WHERE c.id IS NOT NULL) AS criteria
    FROM tools t
    CROSS JOIN criteria c
    LEFT JOIN criteria_tools ct ON t.id = ct.tool_id AND ct.criteria_id = c.id
    WHERE t.type = 'application'
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
            ORDER BY tg.name
        ) FILTER (WHERE tg.id IS NOT NULL) AS tags
    FROM tools t
    LEFT JOIN tag_tools tt_link ON t.id = tt_link.tool_id
    LEFT JOIN tags tg ON tt_link.tag_id = tg.id
    LEFT JOIN tag_type tt ON tg.tag_type_id = tt.id
    WHERE t.type = 'application'
    GROUP BY t.id
)
SELECT 
    t.id,
    t.name,
    t.type,
    t.created_by,
    COALESCE(ca.criteria, '[]'::jsonb) AS criteria,
    COALESCE(ta.tags, '[]'::jsonb) AS tags,
    t.created_on,
    t.submission_status
FROM tools t
LEFT JOIN criteria_array ca ON t.id = ca.tool_id
LEFT JOIN tags_array ta ON t.id = ta.tool_id
WHERE t.type = 'application';

-- Ensure public access to the view
GRANT SELECT ON tools_view TO PUBLIC;