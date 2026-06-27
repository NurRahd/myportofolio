-- ============================================================
-- Supabase SQL Schema for Portfolio
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Admin table
CREATE TABLE admin (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profile (key-value pairs)
CREATE TABLE profile (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Social Links
CREATE TABLE social_links (
  id SERIAL PRIMARY KEY,
  platform TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  href TEXT NOT NULL,
  icon_type TEXT DEFAULT 'image',
  icon_name TEXT,
  icon_image TEXT,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Skill Groups
CREATE TABLE skill_groups (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  "order" INT DEFAULT 0
);

-- 5. Skills
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon_type TEXT DEFAULT 'lucide',
  icon_name TEXT,
  icon_image TEXT,
  "order" INT DEFAULT 0,
  skill_group_id INT NOT NULL REFERENCES skill_groups(id) ON DELETE CASCADE
);

-- 6. Experiences
CREATE TABLE experiences (
  id SERIAL PRIMARY KEY,
  period TEXT NOT NULL,
  duration TEXT NOT NULL,
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  bullets TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  logo_image TEXT,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Education
CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  period TEXT NOT NULL,
  score TEXT NOT NULL,
  logo_image TEXT,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Certificates
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  certificate_id TEXT NOT NULL,
  issued TEXT NOT NULL,
  expires TEXT NOT NULL,
  file TEXT,
  image TEXT,
  image_pos TEXT DEFAULT '50% 50%',
  image_fit TEXT DEFAULT 'cover',
  image_zoom FLOAT DEFAULT 1,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Activities
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  long_desc TEXT NOT NULL,
  details TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Activity Images
CREATE TABLE activity_images (
  id SERIAL PRIMARY KEY,
  src TEXT NOT NULL,
  pos TEXT DEFAULT '50% 50%',
  "order" INT DEFAULT 0,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE
);

-- 11. Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  long_desc TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  cat TEXT NOT NULL,
  pos TEXT DEFAULT '50% 50%',
  github TEXT,
  demo TEXT,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Project Images
CREATE TABLE project_images (
  id SERIAL PRIMARY KEY,
  src TEXT NOT NULL,
  pos TEXT DEFAULT '50% 50%',
  "order" INT DEFAULT 0,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE
);

-- 13. Messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public read policies (pengunjung bisa lihat data portfolio)
CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Public read social_links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Public read skill_groups" ON skill_groups FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Public read education" ON education FOR SELECT USING (true);
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Public read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Public read activity_images" ON activity_images FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read project_images" ON project_images FOR SELECT USING (true);

-- Public insert messages (pengunjung bisa kirim pesan)
CREATE POLICY "Public insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Admin (authenticated) full access
CREATE POLICY "Admin full access admin" ON admin FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access profile" ON profile FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access social_links" ON social_links FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access skill_groups" ON skill_groups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access skills" ON skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access experiences" ON experiences FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access education" ON education FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access certificates" ON certificates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access activities" ON activities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access activity_images" ON activity_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access project_images" ON project_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access messages" ON messages FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Storage Bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

CREATE POLICY "Public read uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete uploads" ON storage.objects FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');
