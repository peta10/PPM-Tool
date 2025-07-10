/*
  # Insert Initial Tools Data

  1. New Data
    - Insert criteria definitions
    - Insert tag types (methodology, function)
    - Insert tags for methodologies and functions
    - Insert tools with ratings and tags
    
  2. Security
    - Uses existing RLS policies from previous migration
*/

-- Insert criteria
INSERT INTO criteria (id, name, active_on) VALUES
  (uuid_generate_v4(), 'Scalability', now()),
  (uuid_generate_v4(), 'Integrations & Extensibility', now()),
  (uuid_generate_v4(), 'Ease of Use', now()),
  (uuid_generate_v4(), 'Flexibility & Customization', now()),
  (uuid_generate_v4(), 'Project Portfolio Management', now()),
  (uuid_generate_v4(), 'Reporting & Analytics', now()),
  (uuid_generate_v4(), 'Security & Compliance', now())
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Insert tag types
INSERT INTO tag_type (id, name) VALUES
  (uuid_generate_v4(), 'Methodology'),
  (uuid_generate_v4(), 'Function')
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Get tag type IDs
WITH methodology_type AS (
  SELECT id FROM tag_type WHERE name = 'Methodology' LIMIT 1
),
function_type AS (
  SELECT id FROM tag_type WHERE name = 'Function' LIMIT 1
)
-- Insert tags
INSERT INTO tags (id, name, tag_type_id) 
SELECT 
  uuid_generate_v4(),
  tag_name,
  CASE 
    WHEN tag_type = 'methodology' THEN (SELECT id FROM methodology_type)
    ELSE (SELECT id FROM function_type)
  END
FROM (
  VALUES 
    ('Waterfall', 'methodology'),
    ('Agile', 'methodology'),
    ('Continuous Improvement', 'methodology'),
    ('Marketing', 'function'),
    ('Engineering', 'function'),
    ('Product & Design', 'function'),
    ('IT & Support', 'function'),
    ('Sales & Account Management', 'function'),
    ('Customer Service', 'function'),
    ('Manufacturing', 'function'),
    ('Operations', 'function'),
    ('Finance', 'function'),
    ('HR', 'function'),
    ('Legal', 'function')
) AS t(tag_name, tag_type)
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Insert tools
INSERT INTO tools (id, name, type) VALUES
  (uuid_generate_v4(), 'Smartsheet', 'application'),
  (uuid_generate_v4(), 'Airtable', 'application'),
  (uuid_generate_v4(), 'Monday.com', 'application'),
  (uuid_generate_v4(), 'ClickUp', 'application'),
  (uuid_generate_v4(), 'Asana', 'application'),
  (uuid_generate_v4(), 'MS Project', 'application'),
  (uuid_generate_v4(), 'Hive', 'application'),
  (uuid_generate_v4(), 'Adobe Workfront', 'application'),
  (uuid_generate_v4(), 'Azure DevOps', 'application'),
  (uuid_generate_v4(), 'Jira', 'application')
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Link tools with tags using CTEs to get IDs
WITH tool_ids AS (
  SELECT id, name FROM tools WHERE type = 'application'
),
tag_ids AS (
  SELECT t.id, t.name, tt.name as type
  FROM tags t
  JOIN tag_type tt ON t.tag_type_id = tt.id
)
INSERT INTO tag_tools (tool_id, tag_id)
SELECT t.id, tag.id
FROM tool_ids t
CROSS JOIN LATERAL (
  VALUES 
    ('Smartsheet', ARRAY['Waterfall', 'Continuous Improvement', 'Marketing', 'Product & Design', 'Engineering']),
    ('Airtable', ARRAY['Waterfall', 'Agile', 'Continuous Improvement', 'Marketing', 'Product & Design', 'Engineering', 'Sales & Account Management']),
    ('Monday.com', ARRAY['Waterfall', 'Continuous Improvement', 'Marketing', 'Sales & Account Management', 'Customer Service']),
    ('ClickUp', ARRAY['Waterfall', 'Engineering', 'Product & Design', 'IT & Support']),
    ('Asana', ARRAY['Waterfall', 'Marketing', 'Product & Design', 'Engineering']),
    ('MS Project', ARRAY['Waterfall', 'Engineering', 'Manufacturing', 'Operations']),
    ('Hive', ARRAY['Waterfall', 'Continuous Improvement', 'Marketing', 'Sales & Account Management']),
    ('Adobe Workfront', ARRAY['Waterfall', 'Continuous Improvement', 'Marketing', 'Product & Design', 'Engineering', 'IT & Support']),
    ('Azure DevOps', ARRAY['Agile', 'Engineering', 'IT & Support']),
    ('Jira', ARRAY['Agile', 'Engineering', 'Product & Design', 'IT & Support'])
) AS tool_tags(tool_name, tags)
JOIN tag_ids tag ON tag.name = ANY(tool_tags.tags)
WHERE t.name = tool_tags.tool_name
ON CONFLICT DO NOTHING;

-- Add tool criteria rankings using CTEs
WITH tool_ids AS (
  SELECT id, name FROM tools WHERE type = 'application'
),
criteria_ids AS (
  SELECT id, name FROM criteria
)
INSERT INTO criteria_tools (tool_id, criteria_id, ranking, description)
SELECT 
  t.id,
  c.id,
  ranking,
  description
FROM tool_ids t
CROSS JOIN LATERAL (
  VALUES 
    -- Smartsheet
    ('Smartsheet', 'Scalability', 4, 'Handles enterprise-level workloads with proven performance for 10,000+ users. Automatic load balancing and resource optimization.'),
    ('Smartsheet', 'Integrations & Extensibility', 4, 'Rich API ecosystem with 100+ pre-built integrations. Custom API access available for enterprise plans.'),
    ('Smartsheet', 'Ease of Use', 5, 'Intuitive grid interface familiar to spreadsheet users. Some advanced features require training.'),
    ('Smartsheet', 'Flexibility & Customization', 3, 'Highly customizable workflows with conditional logic and automation. Custom form building and process design.'),
    ('Smartsheet', 'Project Portfolio Management', 4, 'Comprehensive portfolio management with resource allocation, capacity planning, and program tracking.'),
    ('Smartsheet', 'Reporting & Analytics', 4, 'Advanced analytics with real-time dashboards, custom reports, and AI-powered insights.'),
    ('Smartsheet', 'Security & Compliance', 4, 'SOC 2 Type II, ISO 27001, and GDPR compliant. Enterprise-grade encryption and access controls.'),
    
    -- Airtable
    ('Airtable', 'Scalability', 5, 'Enterprise-grade scalability with proven performance for large organizations. Advanced caching and optimization for massive datasets.'),
    ('Airtable', 'Integrations & Extensibility', 5, 'Industry-leading integration capabilities with extensive API support, webhooks, and automation options. Large marketplace of pre-built connectors.'),
    ('Airtable', 'Ease of Use', 5, 'User-friendly interface with drag-and-drop functionality. Quick learning curve.'),
    ('Airtable', 'Flexibility & Customization', 5, 'Unmatched flexibility with fully customizable views, fields, relationships, and automation. Advanced workflow builder and scripting capabilities.'),
    ('Airtable', 'Project Portfolio Management', 5, 'Comprehensive portfolio management with advanced resource allocation, capacity planning, and program tracking features.'),
    ('Airtable', 'Reporting & Analytics', 5, 'Advanced analytics engine with AI-powered insights, custom dashboards, and real-time reporting capabilities.'),
    ('Airtable', 'Security & Compliance', 5, 'Enterprise-grade security with SOC 2 Type II, ISO 27001 compliance, advanced encryption, and comprehensive audit trails.'),
    
    -- Monday.com
    ('Monday.com', 'Scalability', 3, 'Strong performance with enterprise-ready infrastructure. Good handling of large datasets.'),
    ('Monday.com', 'Integrations & Extensibility', 4, 'Wide range of integrations with popular tools. Robust API and automation options.'),
    ('Monday.com', 'Ease of Use', 5, 'Highly intuitive visual interface. Minimal training required for basic features.'),
    ('Monday.com', 'Flexibility & Customization', 4, 'Customizable boards and workflows. Good automation capabilities.'),
    ('Monday.com', 'Project Portfolio Management', 3, 'Solid project management features with growing portfolio capabilities.'),
    ('Monday.com', 'Reporting & Analytics', 3, 'Strong reporting features with customizable dashboards and analytics.'),
    ('Monday.com', 'Security & Compliance', 4, 'Enterprise-grade security with SOC 2 compliance and advanced permissions.'),
    
    -- ClickUp
    ('ClickUp', 'Scalability', 3, 'Good performance for medium to large teams. Some limitations with very large organizations.'),
    ('ClickUp', 'Integrations & Extensibility', 4, 'Growing integration marketplace. Native integrations with popular tools.'),
    ('ClickUp', 'Ease of Use', 2, 'Feature-rich interface with moderate learning curve.'),
    ('ClickUp', 'Flexibility & Customization', 5, 'Highly customizable with multiple view options and custom fields.'),
    ('ClickUp', 'Project Portfolio Management', 3, 'Good project management features with basic portfolio capabilities.'),
    ('ClickUp', 'Reporting & Analytics', 4, 'Decent reporting options with customizable dashboards.'),
    ('ClickUp', 'Security & Compliance', 3, 'Standard security features with role-based access control.'),
    
    -- Asana
    ('Asana', 'Scalability', 3, 'Reliable performance for large organizations. Good handling of concurrent users.'),
    ('Asana', 'Integrations & Extensibility', 4, 'Strong integration ecosystem with major business tools. Good API support.'),
    ('Asana', 'Ease of Use', 5, 'Clean, intuitive interface. Easy onboarding for new users.'),
    ('Asana', 'Flexibility & Customization', 3, 'Good customization options but some limitations in complex workflows.'),
    ('Asana', 'Project Portfolio Management', 3, 'Strong task management but limited portfolio-level features.'),
    ('Asana', 'Reporting & Analytics', 2, 'Basic reporting with some advanced features in enterprise tier.'),
    ('Asana', 'Security & Compliance', 4, 'Enterprise-grade security with SSO and advanced admin controls.'),
    
    -- MS Project
    ('MS Project', 'Scalability', 4, 'Enterprise-ready with excellent performance for large organizations.'),
    ('MS Project', 'Integrations & Extensibility', 3, 'Strong Microsoft ecosystem integration. Limited third-party options.'),
    ('MS Project', 'Ease of Use', 2, 'Complex interface with steep learning curve. Professional training often needed.'),
    ('MS Project', 'Flexibility & Customization', 3, 'Good customization within Microsoft framework. Some workflow limitations.'),
    ('MS Project', 'Project Portfolio Management', 5, 'Comprehensive portfolio management with advanced resource planning.'),
    ('MS Project', 'Reporting & Analytics', 5, 'Strong reporting capabilities with Power BI integration.'),
    ('MS Project', 'Security & Compliance', 4, 'Enterprise-level security with full Microsoft security stack.'),
    
    -- Hive
    ('Hive', 'Scalability', 3, 'Good for small to medium teams. Some limitations for enterprise scale.'),
    ('Hive', 'Integrations & Extensibility', 4, 'Basic integration options with popular tools. Growing marketplace.'),
    ('Hive', 'Ease of Use', 4, 'Modern, intuitive interface. Quick adoption for most users.'),
    ('Hive', 'Flexibility & Customization', 3, 'Flexible project views and good customization options.'),
    ('Hive', 'Project Portfolio Management', 3, 'Solid project management with basic portfolio features.'),
    ('Hive', 'Reporting & Analytics', 2, 'Standard reporting capabilities with time tracking analytics.'),
    ('Hive', 'Security & Compliance', 4, 'Industry-standard security features with basic access controls.'),
    
    -- Adobe Workfront
    ('Adobe Workfront', 'Scalability', 4, 'Enterprise-grade platform handling thousands of users and projects. Cloud infrastructure with proven performance at scale.'),
    ('Adobe Workfront', 'Integrations & Extensibility', 4, 'Strong Adobe Creative Cloud integration. Extensive API and pre-built connectors for major enterprise tools.'),
    ('Adobe Workfront', 'Ease of Use', 3, 'Modern interface with some complexity due to extensive feature set. Training recommended for advanced features.'),
    ('Adobe Workfront', 'Flexibility & Customization', 4, 'Highly configurable workflows and processes. Custom forms, fields, and automation capabilities.'),
    ('Adobe Workfront', 'Project Portfolio Management', 4, 'Comprehensive portfolio management with resource planning, scenario modeling, and program tracking.'),
    ('Adobe Workfront', 'Reporting & Analytics', 4, 'Advanced reporting engine with custom dashboards, real-time analytics, and AI-powered insights.'),
    ('Adobe Workfront', 'Security & Compliance', 4, 'SOC 2 Type II, ISO 27001 certified. Enterprise-grade security with SSO and granular permissions.'),
    
    -- Azure DevOps
    ('Azure DevOps', 'Scalability', 4, 'Enterprise-grade platform with proven scalability for large organizations. Handles thousands of concurrent users and projects efficiently.'),
    ('Azure DevOps', 'Integrations & Extensibility', 4, 'Extensive integration capabilities with Microsoft ecosystem and third-party tools. Rich API support and marketplace.'),
    ('Azure DevOps', 'Ease of Use', 3, 'Feature-rich interface requires some learning. Good documentation but initial complexity for new users.'),
    ('Azure DevOps', 'Flexibility & Customization', 4, 'Highly customizable with process templates, custom fields, and automation. Supports various development methodologies.'),
    ('Azure DevOps', 'Project Portfolio Management', 4, 'Comprehensive portfolio management with advanced resource planning, capacity management, and program tracking.'),
    ('Azure DevOps', 'Reporting & Analytics', 4, 'Powerful analytics with Power BI integration, custom dashboards, and advanced reporting capabilities.'),
    ('Azure DevOps', 'Security & Compliance', 5, 'Enterprise-level security with Azure AD integration, compliance certifications, and granular access controls.'),
    
    -- Jira
    ('Jira', 'Scalability', 4, 'Enterprise-ready with proven performance at scale. Cloud and data center options for different deployment needs.'),
    ('Jira', 'Integrations & Extensibility', 5, 'Largest ecosystem of integrations in the market. Extensive API capabilities and Atlassian marketplace.'),
    ('Jira', 'Ease of Use', 3, 'Powerful but complex interface. Learning curve varies with configuration complexity.'),
    ('Jira', 'Flexibility & Customization', 4, 'Highly customizable workflows, fields, and screens. Supports multiple project methodologies.'),
    ('Jira', 'Project Portfolio Management', 4, 'Strong portfolio features with Advanced Roadmaps. Good resource management and program tracking.'),
    ('Jira', 'Reporting & Analytics', 4, 'Comprehensive reporting with custom dashboards, JQL queries, and eazyBI integration.'),
    ('Jira', 'Security & Compliance', 4, 'Enterprise-grade security with compliance certifications, SSO, and fine-grained permissions.')
) AS tool_criteria(tool_name, criteria_name, ranking, description)
JOIN criteria_ids c ON c.name = tool_criteria.criteria_name
WHERE t.name = tool_criteria.tool_name
ON CONFLICT DO NOTHING;