/*
  # PPM Tool Finder Schema

  1. New Tables
    - `criteria` - Stores evaluation criteria
      - `id` (uuid, primary key)
      - `name` (text)
      - `active_on` (timestamptz)
      - `created_on` (timestamptz)

    - `tag_type` - Types of tags (e.g., Functional, Methodology)
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_on` (timestamptz)

    - `tags` - Tool tags/categories
      - `id` (uuid, primary key)
      - `name` (text)
      - `tag_type_id` (uuid, foreign key)
      - `created_on` (timestamptz)

    - `tools` - PPM tools (both application and user tools)
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text, enum: 'application', 'user')
      - `created_by` (uuid, foreign key to auth.users)
      - `created_on` (timestamptz)

    - `criteria_tools` - Ratings for application tools
      - `id` (uuid, primary key)
      - `tool_id` (uuid, foreign key)
      - `criteria_id` (uuid, foreign key)
      - `ranking` (integer)
      - `description` (text)

    - `tag_tools` - Many-to-many relationship between tools and tags
      - `id` (uuid, primary key)
      - `tool_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)

    - `user_tool_criteria` - User tool ratings
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `tool_id` (uuid, foreign key)
      - `criteria_id` (uuid, foreign key)
      - `ranking` (integer)
      - `description` (text)

    - `user_criteria` - User criteria preferences
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `criteria_id` (uuid, foreign key)
      - `ranking` (integer)
      - `deleted_at` (timestamptz)

  2. Views
    - `tools_view` - Aggregated view of tools with criteria and tags

  3. Security
    - RLS enabled on all tables
    - Policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE tool_type AS ENUM ('application', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create criteria table
CREATE TABLE IF NOT EXISTS criteria (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    active_on timestamptz NOT NULL DEFAULT now(),
    created_on timestamptz NOT NULL DEFAULT now()
);

-- Create tag_type table
CREATE TABLE IF NOT EXISTS tag_type (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_on timestamptz NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    tag_type_id uuid REFERENCES tag_type(id) ON DELETE CASCADE,
    created_on timestamptz NOT NULL DEFAULT now()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    type tool_type NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_on timestamptz NOT NULL DEFAULT now()
);

-- Create criteria_tools table
CREATE TABLE IF NOT EXISTS criteria_tools (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
    criteria_id uuid REFERENCES criteria(id) ON DELETE CASCADE,
    ranking integer NOT NULL CHECK (ranking >= 1 AND ranking <= 5),
    description text,
    UNIQUE(tool_id, criteria_id)
);

-- Create tag_tools table
CREATE TABLE IF NOT EXISTS tag_tools (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(tool_id, tag_id)
);

-- Create user_tool_criteria table
CREATE TABLE IF NOT EXISTS user_tool_criteria (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
    criteria_id uuid REFERENCES criteria(id) ON DELETE CASCADE,
    ranking integer NOT NULL CHECK (ranking >= 1 AND ranking <= 5),
    description text,
    UNIQUE(user_id, tool_id, criteria_id)
);

-- Create user_criteria table
CREATE TABLE IF NOT EXISTS user_criteria (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    criteria_id uuid REFERENCES criteria(id) ON DELETE CASCADE,
    ranking integer NOT NULL CHECK (ranking >= 1 AND ranking <= 5),
    deleted_at timestamptz,
    UNIQUE(user_id, criteria_id)
);

-- Create tools_view
CREATE OR REPLACE VIEW tools_view AS
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
        ) AS criteria
    FROM tools t
    LEFT JOIN criteria_tools ct ON t.id = ct.tool_id
    LEFT JOIN criteria c ON ct.criteria_id = c.id
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
    FROM tools t
    LEFT JOIN tag_tools tgt ON t.id = tgt.tool_id
    LEFT JOIN tags tg ON tgt.tag_id = tg.id
    LEFT JOIN tag_type tt ON tg.tag_type_id = tt.id
    GROUP BY t.id
)
SELECT 
    t.id,
    t.name,
    t.type,
    t.created_by,
    COALESCE(ca.criteria, '[]'::jsonb) AS criteria,
    COALESCE(ta.tags, '[]'::jsonb) AS tags,
    t.created_on
FROM tools t
LEFT JOIN criteria_array ca ON t.id = ca.tool_id
LEFT JOIN tags_array ta ON t.id = ta.tool_id;

-- Enable Row Level Security
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tool_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_criteria ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Criteria policies
CREATE POLICY "Anyone can read active criteria" ON criteria
    FOR SELECT USING (active_on <= now());

-- Tag type policies
CREATE POLICY "Anyone can read tag types" ON tag_type
    FOR SELECT TO authenticated USING (true);

-- Tags policies
CREATE POLICY "Anyone can read tags" ON tags
    FOR SELECT TO authenticated USING (true);

-- Tools policies
CREATE POLICY "Anyone can read application tools" ON tools
    FOR SELECT TO authenticated 
    USING (type = 'application'::tool_type);

CREATE POLICY "Users can manage their own tools" ON tools
    FOR ALL TO authenticated
    USING (
        type = 'user'::tool_type AND 
        auth.uid() = created_by
    );

-- Criteria tools policies
CREATE POLICY "Anyone can read application tool criteria" ON criteria_tools
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tools 
            WHERE tools.id = criteria_tools.tool_id 
            AND tools.type = 'application'::tool_type
        )
    );

-- Tag tools policies
CREATE POLICY "Anyone can read application tool tags" ON tag_tools
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tools 
            WHERE tools.id = tag_tools.tool_id 
            AND tools.type = 'application'::tool_type
        )
    );

-- User tool criteria policies
CREATE POLICY "Users can manage their own tool criteria" ON user_tool_criteria
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User criteria policies
CREATE POLICY "Users can manage their own criteria preferences" ON user_criteria
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_criteria_active ON criteria(active_on);
CREATE INDEX IF NOT EXISTS idx_tools_type ON tools(type);
CREATE INDEX IF NOT EXISTS idx_tools_created_by ON tools(created_by);
CREATE INDEX IF NOT EXISTS idx_criteria_tools_tool ON criteria_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_criteria_tools_criteria ON criteria_tools(criteria_id);
CREATE INDEX IF NOT EXISTS idx_tag_tools_tool ON tag_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_tag_tools_tag ON tag_tools(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_criteria_user ON user_tool_criteria(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_criteria_tool ON user_tool_criteria(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_criteria_user ON user_criteria(user_id);
CREATE INDEX IF NOT EXISTS idx_user_criteria_deleted ON user_criteria(deleted_at);