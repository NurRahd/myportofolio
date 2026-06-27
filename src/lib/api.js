import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// ─── Image URL helper ──────────────────────────────────────────────────────────

/**
 * Returns the full public URL for an uploaded file in Supabase Storage.
 * Falls back to the local asset path for legacy filenames.
 */
export function imageUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('http') || filename.startsWith('/')) return filename;
  const uuidPattern = /^[0-9a-f-]{36}\./i;
  if (uuidPattern.test(filename)) {
    const { data } = supabase.storage.from('uploads').getPublicUrl(filename);
    return data.publicUrl;
  }
  return `/src/assets/${filename}`;
}

// ─── Storage helper ────────────────────────────────────────────────────────────

async function uploadFile(file) {
  const ext = file.name.split('.').pop();
  const filename = `${uuidv4()}.${ext}`;
  const { error } = await supabase.storage.from('uploads').upload(filename, file);
  if (error) throw new Error(error.message);
  return filename;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Convert snake_case DB row to camelCase for frontend compatibility */
function toCamel(row) {
  if (!row) return row;
  const map = {
    icon_type: 'iconType',
    icon_name: 'iconName',
    icon_image: 'iconImage',
    skill_group_id: 'skillGroupId',
    logo_image: 'logoImage',
    certificate_id: 'certificateId',
    image_pos: 'imagePos',
    image_fit: 'imageFit',
    image_zoom: 'imageZoom',
    long_desc: 'longDesc',
    activity_id: 'activityId',
    project_id: 'projectId',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
  };
  const result = {};
  for (const [k, v] of Object.entries(row)) {
    result[map[k] || k] = v;
  }
  return result;
}

/** Convert camelCase frontend data to snake_case for DB insert/update */
function toSnake(obj) {
  const map = {
    iconType: 'icon_type',
    iconName: 'icon_name',
    iconImage: 'icon_image',
    skillGroupId: 'skill_group_id',
    logoImage: 'logo_image',
    certificateId: 'certificate_id',
    imagePos: 'image_pos',
    imageFit: 'image_fit',
    imageZoom: 'image_zoom',
    longDesc: 'long_desc',
    activityId: 'activity_id',
    projectId: 'project_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  };
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[map[k] || k] = v;
  }
  return result;
}

function throwIfError(result) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

// ─── API object ────────────────────────────────────────────────────────────────

export const api = {
  // ── Auth (Supabase Auth) ──────────────────────────────────────────────────
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { token: data.session.access_token, username: data.user.email };
  },

  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    return { username: user.email };
  },

  changePassword: async (_currentPassword, newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
    return { message: 'Password updated successfully' };
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  getProfile: async () => {
    const { data, error } = await supabase.from('profile').select('*');
    if (error) throw new Error(error.message);
    const profile = {};
    for (const item of data) profile[item.key] = item.value;
    return profile;
  },

  updateProfile: async (profileData) => {
    for (const [key, value] of Object.entries(profileData)) {
      const { error } = await supabase
        .from('profile')
        .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw new Error(error.message);
    }
    return api.getProfile();
  },

  // ── Social Links ──────────────────────────────────────────────────────────
  getSocialLinks: async () => {
    const data = throwIfError(await supabase.from('social_links').select('*').order('order'));
    return data.map(toCamel);
  },

  createSocialLink: async (linkData) => {
    const row = toSnake(linkData);
    delete row.id;
    const data = throwIfError(await supabase.from('social_links').insert(row).select().single());
    return toCamel(data);
  },

  updateSocialLink: async (id, linkData) => {
    const row = toSnake(linkData);
    delete row.id;
    delete row.created_at;
    row.updated_at = new Date().toISOString();
    const data = throwIfError(await supabase.from('social_links').update(row).eq('id', id).select().single());
    return toCamel(data);
  },

  deleteSocialLink: async (id) => {
    throwIfError(await supabase.from('social_links').delete().eq('id', id));
  },

  // ── Skills ────────────────────────────────────────────────────────────────
  getSkills: async () => {
    const groups = throwIfError(await supabase.from('skill_groups').select('*').order('order'));
    const skills = throwIfError(await supabase.from('skills').select('*').order('order'));
    return groups.map((g) => ({
      ...toCamel(g),
      skills: skills.filter((s) => s.skill_group_id === g.id).map(toCamel),
    }));
  },

  createSkillGroup: async (data) => {
    const row = toSnake(data);
    delete row.id;
    return toCamel(throwIfError(await supabase.from('skill_groups').insert(row).select().single()));
  },

  updateSkillGroup: async (id, data) => {
    const row = toSnake(data);
    delete row.id;
    return toCamel(throwIfError(await supabase.from('skill_groups').update(row).eq('id', id).select().single()));
  },

  deleteSkillGroup: async (id) => {
    throwIfError(await supabase.from('skill_groups').delete().eq('id', id));
  },

  createSkill: async (formData) => {
    const row = {};
    row.name = formData.get('name');
    row.icon_type = formData.get('iconType') || 'lucide';
    row.icon_name = formData.get('iconName') || null;
    row.order = Number(formData.get('order')) || 0;
    row.skill_group_id = Number(formData.get('skillGroupId'));
    const iconFile = formData.get('iconImage');
    if (iconFile && iconFile instanceof File && iconFile.size > 0) {
      row.icon_image = await uploadFile(iconFile);
    }
    return toCamel(throwIfError(await supabase.from('skills').insert(row).select().single()));
  },

  updateSkill: async (id, formData) => {
    const row = {};
    row.name = formData.get('name');
    row.icon_type = formData.get('iconType') || 'lucide';
    row.icon_name = formData.get('iconName') || null;
    row.order = Number(formData.get('order')) || 0;
    const iconFile = formData.get('iconImage');
    if (iconFile && iconFile instanceof File && iconFile.size > 0) {
      row.icon_image = await uploadFile(iconFile);
    }
    return toCamel(throwIfError(await supabase.from('skills').update(row).eq('id', id).select().single()));
  },

  deleteSkill: async (id) => {
    throwIfError(await supabase.from('skills').delete().eq('id', id));
  },

  // ── Experiences ───────────────────────────────────────────────────────────
  getExperiences: async () => {
    const data = throwIfError(await supabase.from('experiences').select('*').order('order'));
    return data.map(toCamel);
  },

  createExperience: async (formData) => {
    const row = {};
    for (const key of ['period', 'duration', 'title', 'institution']) row[key] = formData.get(key) || '';
    row.order = Number(formData.get('order')) || 0;
    row.bullets = JSON.parse(formData.get('bullets') || '[]');
    row.skills = JSON.parse(formData.get('skills') || '[]');
    const logoFile = formData.get('logo');
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      row.logo_image = await uploadFile(logoFile);
    }
    return toCamel(throwIfError(await supabase.from('experiences').insert(row).select().single()));
  },

  updateExperience: async (id, formData) => {
    const row = {};
    for (const key of ['period', 'duration', 'title', 'institution']) row[key] = formData.get(key) || '';
    row.order = Number(formData.get('order')) || 0;
    row.bullets = JSON.parse(formData.get('bullets') || '[]');
    row.skills = JSON.parse(formData.get('skills') || '[]');
    row.updated_at = new Date().toISOString();
    const logoFile = formData.get('logo');
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      row.logo_image = await uploadFile(logoFile);
    }
    return toCamel(throwIfError(await supabase.from('experiences').update(row).eq('id', id).select().single()));
  },

  deleteExperience: async (id) => {
    throwIfError(await supabase.from('experiences').delete().eq('id', id));
  },

  // ── Education ─────────────────────────────────────────────────────────────
  getEducation: async () => {
    const data = throwIfError(await supabase.from('education').select('*').order('order'));
    return data.map(toCamel);
  },

  createEducation: async (formData) => {
    const row = {};
    for (const key of ['school', 'degree', 'period', 'score']) row[key] = formData.get(key) || '';
    row.order = Number(formData.get('order')) || 0;
    const logoFile = formData.get('logo');
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      row.logo_image = await uploadFile(logoFile);
    }
    return toCamel(throwIfError(await supabase.from('education').insert(row).select().single()));
  },

  updateEducation: async (id, formData) => {
    const row = {};
    for (const key of ['school', 'degree', 'period', 'score']) row[key] = formData.get(key) || '';
    row.order = Number(formData.get('order')) || 0;
    row.updated_at = new Date().toISOString();
    const logoFile = formData.get('logo');
    if (logoFile && logoFile instanceof File && logoFile.size > 0) {
      row.logo_image = await uploadFile(logoFile);
    }
    return toCamel(throwIfError(await supabase.from('education').update(row).eq('id', id).select().single()));
  },

  deleteEducation: async (id) => {
    throwIfError(await supabase.from('education').delete().eq('id', id));
  },

  // ── Certificates ──────────────────────────────────────────────────────────
  getCertificates: async () => {
    const data = throwIfError(await supabase.from('certificates').select('*').order('order'));
    return data.map(toCamel);
  },

  createCertificate: async (formData) => {
    const row = {};
    for (const key of ['name', 'issuer', 'certificateId', 'issued', 'expires', 'file', 'imagePos', 'imageFit', 'imageZoom', 'order']) {
      row[key] = formData.get(key) ?? '';
    }
    row.order = Number(row.order) || 0;
    row.imageZoom = Number(row.imageZoom) || 1;
    const imgFile = formData.get('image');
    if (imgFile && imgFile instanceof File && imgFile.size > 0) {
      row.image = await uploadFile(imgFile);
    }
    const snaked = toSnake(row);
    delete snaked.id;
    return toCamel(throwIfError(await supabase.from('certificates').insert(snaked).select().single()));
  },

  updateCertificate: async (id, formData) => {
    const row = {};
    for (const key of ['name', 'issuer', 'certificateId', 'issued', 'expires', 'file', 'imagePos', 'imageFit', 'imageZoom', 'order']) {
      row[key] = formData.get(key) ?? '';
    }
    row.order = Number(row.order) || 0;
    row.imageZoom = Number(row.imageZoom) || 1;
    const imgFile = formData.get('image');
    if (imgFile && imgFile instanceof File && imgFile.size > 0) {
      row.image = await uploadFile(imgFile);
    }
    const snaked = toSnake(row);
    delete snaked.id;
    snaked.updated_at = new Date().toISOString();
    return toCamel(throwIfError(await supabase.from('certificates').update(snaked).eq('id', id).select().single()));
  },

  deleteCertificate: async (id) => {
    throwIfError(await supabase.from('certificates').delete().eq('id', id));
  },

  // ── Activities ────────────────────────────────────────────────────────────
  getActivities: async () => {
    const activitiesRaw = throwIfError(await supabase.from('activities').select('*').order('order'));
    const imagesRaw = throwIfError(await supabase.from('activity_images').select('*').order('order'));
    return activitiesRaw.map((a) => ({
      ...toCamel(a),
      images: imagesRaw.filter((img) => img.activity_id === a.id).map(toCamel),
    }));
  },

  createActivity: async (formData) => {
    const row = {};
    for (const key of ['title', 'date', 'description']) row[key] = formData.get(key) || '';
    row.long_desc = formData.get('longDesc') || '';
    row.order = Number(formData.get('order')) || 0;
    row.details = JSON.parse(formData.get('details') || '[]');
    row.tags = JSON.parse(formData.get('tags') || '[]');

    const activity = throwIfError(await supabase.from('activities').insert(row).select().single());

    // Upload images
    const imageFiles = formData.getAll('images');
    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        const filename = await uploadFile(file);
        await supabase.from('activity_images').insert({ src: filename, activity_id: activity.id });
      }
    }

    // Return with images
    const images = throwIfError(await supabase.from('activity_images').select('*').eq('activity_id', activity.id).order('order'));
    return { ...toCamel(activity), images: images.map(toCamel) };
  },

  updateActivity: async (id, formData) => {
    const row = {};
    for (const key of ['title', 'date', 'description']) row[key] = formData.get(key) || '';
    row.long_desc = formData.get('longDesc') || '';
    row.order = Number(formData.get('order')) || 0;
    row.details = JSON.parse(formData.get('details') || '[]');
    row.tags = JSON.parse(formData.get('tags') || '[]');
    row.updated_at = new Date().toISOString();

    const activity = throwIfError(await supabase.from('activities').update(row).eq('id', id).select().single());

    // Handle kept images — delete removed ones
    const keepIds = JSON.parse(formData.get('keepImages') || '[]');
    if (keepIds.length > 0) {
      // Delete images NOT in keepIds
      const existingImages = throwIfError(await supabase.from('activity_images').select('id').eq('activity_id', id));
      const toDelete = existingImages.filter((img) => !keepIds.includes(img.id)).map((img) => img.id);
      if (toDelete.length > 0) {
        await supabase.from('activity_images').delete().in('id', toDelete);
      }
    } else {
      // If keepImages is empty array, delete all existing images
      await supabase.from('activity_images').delete().eq('activity_id', id);
    }

    // Upload new images
    const imageFiles = formData.getAll('images');
    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        const filename = await uploadFile(file);
        await supabase.from('activity_images').insert({ src: filename, activity_id: id });
      }
    }

    const images = throwIfError(await supabase.from('activity_images').select('*').eq('activity_id', id).order('order'));
    return { ...toCamel(activity), images: images.map(toCamel) };
  },

  deleteActivity: async (id) => {
    throwIfError(await supabase.from('activities').delete().eq('id', id));
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  getProjects: async (featured) => {
    let query = supabase.from('projects').select('*').order('order');
    if (featured) query = query.eq('featured', true);
    const projectsRaw = throwIfError(await query);
    const imagesRaw = throwIfError(await supabase.from('project_images').select('*').order('order'));
    return projectsRaw.map((p) => ({
      ...toCamel(p),
      images: imagesRaw.filter((img) => img.project_id === p.id).map(toCamel),
    }));
  },

  createProject: async (formData) => {
    const row = {};
    for (const key of ['title', 'cat', 'pos', 'github', 'demo']) row[key] = formData.get(key) || '';
    row.desc = formData.get('desc') || '';
    row.long_desc = formData.get('longDesc') || '';
    row.order = Number(formData.get('order')) || 0;
    row.features = JSON.parse(formData.get('features') || '[]');
    row.tags = JSON.parse(formData.get('tags') || '[]');
    row.featured = formData.get('featured') === 'true';

    const project = throwIfError(await supabase.from('projects').insert(row).select().single());

    const imageFiles = formData.getAll('images');
    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        const filename = await uploadFile(file);
        await supabase.from('project_images').insert({ src: filename, project_id: project.id });
      }
    }

    const images = throwIfError(await supabase.from('project_images').select('*').eq('project_id', project.id).order('order'));
    return { ...toCamel(project), images: images.map(toCamel) };
  },

  updateProject: async (id, formData) => {
    const row = {};
    for (const key of ['title', 'cat', 'pos', 'github', 'demo']) row[key] = formData.get(key) || '';
    row.desc = formData.get('desc') || '';
    row.long_desc = formData.get('longDesc') || '';
    row.order = Number(formData.get('order')) || 0;
    row.features = JSON.parse(formData.get('features') || '[]');
    row.tags = JSON.parse(formData.get('tags') || '[]');
    row.featured = formData.get('featured') === 'true';
    row.updated_at = new Date().toISOString();

    const project = throwIfError(await supabase.from('projects').update(row).eq('id', id).select().single());

    // Handle kept images
    const keepIds = JSON.parse(formData.get('keepImages') || '[]');
    if (keepIds.length > 0) {
      const existingImages = throwIfError(await supabase.from('project_images').select('id').eq('project_id', id));
      const toDelete = existingImages.filter((img) => !keepIds.includes(img.id)).map((img) => img.id);
      if (toDelete.length > 0) {
        await supabase.from('project_images').delete().in('id', toDelete);
      }
    } else {
      await supabase.from('project_images').delete().eq('project_id', id);
    }

    const imageFiles = formData.getAll('images');
    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        const filename = await uploadFile(file);
        await supabase.from('project_images').insert({ src: filename, project_id: id });
      }
    }

    const images = throwIfError(await supabase.from('project_images').select('*').eq('project_id', id).order('order'));
    return { ...toCamel(project), images: images.map(toCamel) };
  },

  deleteProject: async (id) => {
    throwIfError(await supabase.from('projects').delete().eq('id', id));
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  sendMessage: async (data) => {
    return toCamel(throwIfError(await supabase.from('messages').insert(data).select().single()));
  },

  getMessages: async () => {
    const data = throwIfError(await supabase.from('messages').select('*').order('created_at', { ascending: false }));
    return data.map(toCamel);
  },

  markMessageRead: async (id) => {
    return toCamel(throwIfError(await supabase.from('messages').update({ read: true }).eq('id', id).select().single()));
  },

  deleteMessage: async (id) => {
    throwIfError(await supabase.from('messages').delete().eq('id', id));
  },
};
