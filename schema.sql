    -- Supabase Schema for Abstract Submission System

    -- 1. Create Enums
    DO $$ BEGIN
        CREATE TYPE title_type AS ENUM ('PROF', 'DR', 'MS', 'MR');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        CREATE TYPE designation_type AS ENUM ('STUDENT', 'RESEARCH_FELLOW', 'FACULTY', 'INDUSTRY');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        CREATE TYPE nationality_type AS ENUM ('INDIAN', 'FOREIGN');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        CREATE TYPE participation_enum AS ENUM ('PARTICIPATION_ONLY', 'POSTER_OR_ORAL', 'LECTURE');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        CREATE TYPE food_enum AS ENUM ('VEG', 'NON_VEG');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        CREATE TYPE presentation_enum AS ENUM ('POSTER', 'ORAL');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    -- 2. Create profiles table
    CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title title_type NOT NULL,
        full_name TEXT NOT NULL,
        designation designation_type NOT NULL,
        nationality nationality_type NOT NULL,
        organization_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        contact_number TEXT NOT NULL,
        participation_type participation_enum NOT NULL,
        accommodation_required BOOLEAN NOT NULL,
        food_preference food_enum NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- 3. Create presentations table
    CREATE TABLE IF NOT EXISTS presentations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title_of_abstract TEXT,
        abstract_link TEXT,
        presentation_type presentation_enum,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- 4. Create tickets table
    CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        qr_link TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- 5. Add Indexes
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    CREATE INDEX IF NOT EXISTS idx_presentations_profile_id ON presentations(profile_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_profile_id ON tickets(profile_id);

    -- 6. Data Integrity Trigger
    CREATE OR REPLACE FUNCTION check_presentation_requirements()
    RETURNS TRIGGER AS $$
    DECLARE
        p_type participation_enum;
    BEGIN
        SELECT participation_type INTO p_type FROM profiles WHERE id = NEW.profile_id;
        
        IF p_type = 'PARTICIPATION_ONLY' THEN
            IF NEW.title_of_abstract IS NOT NULL OR NEW.presentation_type IS NOT NULL THEN
                RAISE EXCEPTION 'Participants with participation_only type cannot have abstract titles or presentation types.';
            END IF;
        END IF;

        IF p_type = 'POSTER_OR_ORAL' THEN
            IF NEW.title_of_abstract IS NULL OR NEW.presentation_type IS NULL THEN
                RAISE EXCEPTION 'Poster or Oral participants must provide abstract title and presentation type.';
            END IF;
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_check_presentation_requirements ON presentations;
    CREATE TRIGGER trg_check_presentation_requirements
    BEFORE INSERT OR UPDATE ON presentations
    FOR EACH ROW EXECUTE FUNCTION check_presentation_requirements();

    -- 7. RLS disabled (as requested)
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE presentations DISABLE ROW LEVEL SECURITY;
    ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

    -- 8. Storage Policies (for 'tickets' bucket)
    -- Ensure the bucket is public and allows insertions
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('tickets', 'tickets', true)
    ON CONFLICT (id) DO UPDATE SET public = true;

    CREATE POLICY "Allow public insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tickets');
    CREATE POLICY "Allow public select" ON storage.objects FOR SELECT USING (bucket_id = 'tickets');
    CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE USING (bucket_id = 'tickets');
    CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'tickets');
