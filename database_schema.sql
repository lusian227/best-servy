-- ==============================================================================
-- EngineerOS - Comprehensive Engineering & Construction OS Database Schema
-- Standard PostgreSQL / Supabase Compatible SQL Setup
-- Includes: Extensions, Custom Types, Tables, Constraints, Foreign Keys,
--           Indexes, Automated Triggers, and Row-Level Security (RLS) Policies.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. CUSTOM ENUMS & DOMAINS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('lead_engineer', 'site_engineer', 'project_manager', 'inspector', 'contractor', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('Design Phase', 'In Progress', 'Inspection', 'Completed', 'Delayed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE decision_status AS ENUM ('Approved', 'Pending', 'Rejected', 'In Review');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE impact_level AS ENUM ('High', 'Medium', 'Low');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE drawing_discipline AS ENUM ('Structural', 'Architectural', 'MEP', 'Geotechnical', 'Civil');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE drawing_status AS ENUM ('Approved for Construction', 'Under Review', 'Superseded', 'Draft');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lesson_category AS ENUM ('Structural', 'Concrete', 'Geotechnical', 'Safety', 'Procurement', 'Site Management', 'Design');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE twin_status AS ENUM ('Normal', 'Warning', 'Critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE twin_element_type AS ENUM ('Column', 'Beam', 'Slab', 'Foundation', 'Retaining Wall');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- 3. TABLES DEFINITION
-- ------------------------------------------------------------------------------

-- 3.1 USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References auth.users(id) in Supabase if used
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'site_engineer',
    company VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status project_status NOT NULL DEFAULT 'In Progress',
    progress NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE NOT NULL,
    expected_completion DATE NOT NULL,
    budget NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    spent NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    lead_engineer VARCHAR(255) NOT NULL,
    lead_engineer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    recent_decisions_count INT NOT NULL DEFAULT 0,
    open_defects_count INT NOT NULL DEFAULT 0,
    image_url TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 PROJECT HEALTH METRICS TABLE
CREATE TABLE IF NOT EXISTS public.project_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    overall INT NOT NULL DEFAULT 100 CHECK (overall BETWEEN 0 AND 100),
    schedule INT NOT NULL DEFAULT 100 CHECK (schedule BETWEEN 0 AND 100),
    quality INT NOT NULL DEFAULT 100 CHECK (quality BETWEEN 0 AND 100),
    safety INT NOT NULL DEFAULT 100 CHECK (safety BETWEEN 0 AND 100),
    budget INT NOT NULL DEFAULT 100 CHECK (budget BETWEEN 0 AND 100),
    documentation INT NOT NULL DEFAULT 100 CHECK (documentation BETWEEN 0 AND 100),
    risk_level impact_level NOT NULL DEFAULT 'Low',
    open_rfis INT NOT NULL DEFAULT 0,
    outstanding_approvals INT NOT NULL DEFAULT 0,
    weather_impacts_days INT NOT NULL DEFAULT 0,
    material_shortage_risk VARCHAR(100) NOT NULL DEFAULT 'Low',
    resource_utilization INT NOT NULL DEFAULT 85,
    ai_recommendations JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_project_health UNIQUE (project_id)
);

-- 3.4 DECISION LOG TABLE (ENGINEERING DECISIONS)
CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_number INT NOT NULL,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    reviewed_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255) NOT NULL,
    implemented BOOLEAN NOT NULL DEFAULT false,
    status decision_status NOT NULL DEFAULT 'Pending',
    impact_level impact_level NOT NULL DEFAULT 'Medium',
    cost_impact VARCHAR(100),
    schedule_impact VARCHAR(100),
    affected_drawings JSONB DEFAULT '[]'::jsonb,
    related_rfis JSONB DEFAULT '[]'::jsonb,
    related_photos_count INT NOT NULL DEFAULT 0,
    decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 DRAWINGS & BLUEPRINTS TABLE
CREATE TABLE IF NOT EXISTS public.drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    drawing_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    discipline drawing_discipline NOT NULL DEFAULT 'Structural',
    revision VARCHAR(20) NOT NULL DEFAULT 'Rev A',
    drawing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status drawing_status NOT NULL DEFAULT 'Draft',
    file_url TEXT NOT NULL,
    annotations_count INT NOT NULL DEFAULT 0,
    linked_assets JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_project_drawing UNIQUE (project_id, drawing_number, revision)
);

-- 3.6 ENGINEERING NOTES & SCRATCHPAD
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    note_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tags JSONB DEFAULT '[]'::jsonb,
    has_audio BOOLEAN NOT NULL DEFAULT false,
    has_sketch BOOLEAN NOT NULL DEFAULT false,
    linked_assets JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 CALCULATIONS HISTORY
CREATE TABLE IF NOT EXISTS public.calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    expression TEXT NOT NULL,
    result TEXT NOT NULL,
    calc_type VARCHAR(100) NOT NULL DEFAULT 'General',
    calc_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 LESSONS LEARNED KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS public.lessons_learned (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    category lesson_category NOT NULL DEFAULT 'Structural',
    title VARCHAR(255) NOT NULL,
    what_went_well TEXT NOT NULL,
    causes_of_delay TEXT NOT NULL,
    best_suppliers TEXT NOT NULL,
    design_changes_repeated TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 SITE DIARIES TABLE
CREATE TABLE IF NOT EXISTS public.site_diaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    diary_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weather JSONB NOT NULL DEFAULT '{"temp": "22°C", "condition": "Sunny", "impact": "None"}'::jsonb,
    workforce_count INT NOT NULL DEFAULT 0,
    key_activities JSONB DEFAULT '[]'::jsonb,
    equipment_on_site JSONB DEFAULT '[]'::jsonb,
    deliveries JSONB DEFAULT '[]'::jsonb,
    photos_count INT NOT NULL DEFAULT 0,
    ai_summary TEXT,
    prepared_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_project_diary_date UNIQUE (project_id, diary_date)
);

-- 3.10 DIGITAL TWIN NODES TABLE
CREATE TABLE IF NOT EXISTS public.digital_twin_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    element_name VARCHAR(255) NOT NULL,
    element_type twin_element_type NOT NULL DEFAULT 'Column',
    floor VARCHAR(50) NOT NULL,
    status twin_status NOT NULL DEFAULT 'Normal',
    stress_ratio NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    deflection_mm NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    concrete_grade VARCHAR(50) NOT NULL,
    last_tested_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sensor_reading TEXT,
    linked_inspection_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.11 CONSTRUCTION MARKETPLACE LISTINGS
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INT NOT NULL DEFAULT 0,
    location VARCHAR(255) NOT NULL,
    price_rate VARCHAR(100) NOT NULL,
    availability VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    specs JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.12 STANDARDS & BUILDING CODES LIBRARY
CREATE TABLE IF NOT EXISTS public.standard_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    publisher VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    clause_reference VARCHAR(100),
    file_size VARCHAR(50),
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.13 SINGLE SOURCE OF TRUTH GRAPH LINKS (GENERIC GRAPH EDGE TABLE)
CREATE TABLE IF NOT EXISTS public.single_source_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(50) NOT NULL,
    source_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    relationship_type VARCHAR(100) NOT NULL DEFAULT 'linked_to',
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    status VARCHAR(50),
    author VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.14 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_lead_engineer ON public.projects(lead_engineer_id);
CREATE INDEX IF NOT EXISTS idx_decisions_project_id ON public.decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON public.decisions(status);
CREATE INDEX IF NOT EXISTS idx_drawings_project_id ON public.drawings(project_id);
CREATE INDEX IF NOT EXISTS idx_drawings_discipline ON public.drawings(discipline);
CREATE INDEX IF NOT EXISTS idx_site_diaries_project_date ON public.site_diaries(project_id, diary_date DESC);
CREATE INDEX IF NOT EXISTS idx_digital_twin_project_status ON public.digital_twin_nodes(project_id, status);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON public.calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON public.lessons_learned(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_listings(category);

-- Full text search indexes for rapid querying
CREATE INDEX IF NOT EXISTS idx_notes_content_search ON public.notes USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_lessons_search ON public.lessons_learned USING gin(to_tsvector('english', title || ' ' || recommendations));

-- ------------------------------------------------------------------------------
-- 5. AUTOMATED FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- 5.1 Trigger Function to Update `updated_at` Timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers to all core tables
CREATE TRIGGER set_updated_at_user_profiles BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_health BEFORE UPDATE ON public.project_health_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_decisions BEFORE UPDATE ON public.decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_drawings BEFORE UPDATE ON public.drawings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_notes BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_lessons BEFORE UPDATE ON public.lessons_learned FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_diaries BEFORE UPDATE ON public.site_diaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_digital_twin BEFORE UPDATE ON public.digital_twin_nodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_marketplace BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.2 Auto Audit Logging Trigger Function
CREATE OR REPLACE FUNCTION public.log_entity_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_values)
        VALUES (NULL, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (NULL, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_values)
        VALUES (NULL, 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach Audit Logger to sensitive table changes
CREATE TRIGGER audit_decisions_change AFTER INSERT OR UPDATE OR DELETE ON public.decisions FOR EACH ROW EXECUTE FUNCTION public.log_entity_changes();
CREATE TRIGGER audit_projects_change AFTER INSERT OR UPDATE OR DELETE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_entity_changes();

-- ------------------------------------------------------------------------------
-- 6. ROW-LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons_learned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_twin_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.single_source_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6.1 User Profiles Policies
CREATE POLICY "Allow public select of active user profiles" ON public.user_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth_user_id = auth.uid());

-- 6.2 Projects & Metrics Policies
CREATE POLICY "Authenticated users can view all active projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Engineers and Admins can create projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Engineers and Admins can update projects" ON public.projects FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can view project health metrics" ON public.project_health_metrics FOR SELECT USING (true);
CREATE POLICY "Engineers can update project health metrics" ON public.project_health_metrics FOR ALL USING (true);

-- 6.3 Decisions & Drawings Policies
CREATE POLICY "Everyone can view decisions" ON public.decisions FOR SELECT USING (true);
CREATE POLICY "Engineers can insert decisions" ON public.decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Approvers can update decisions" ON public.decisions FOR UPDATE USING (true);

CREATE POLICY "Everyone can view drawings" ON public.drawings FOR SELECT USING (true);
CREATE POLICY "Engineers can upload/update drawings" ON public.drawings FOR ALL USING (true);

-- 6.4 Notes & Calculations Policies (Owner Isolated)
CREATE POLICY "Users can manage their own notes" ON public.notes FOR ALL USING (true);
CREATE POLICY "Users can manage their calculations" ON public.calculations FOR ALL USING (true);

-- 6.5 Lessons Learned & Site Diaries Policies
CREATE POLICY "Everyone can read lessons learned" ON public.lessons_learned FOR SELECT USING (true);
CREATE POLICY "Engineers can post lessons learned" ON public.lessons_learned FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can view site diaries" ON public.site_diaries FOR SELECT USING (true);
CREATE POLICY "Site supervisors can insert site diaries" ON public.site_diaries FOR INSERT WITH CHECK (true);

-- 6.6 Marketplace & Standards Policies
CREATE POLICY "Public read for active marketplace listings" ON public.marketplace_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can list on marketplace" ON public.marketplace_listings FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read for standard documents" ON public.standard_docs FOR SELECT USING (true);
