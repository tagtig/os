import { supabase } from './server';

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  password_hash: string | null;
  invite_token: string | null;
  invite_expires_at: string | null;
  invited_by: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Öffentliche Sicht — kein password_hash, aber invite_token für Admins sichtbar. */
export type AppUserPublic = Omit<AppUser, 'password_hash'>;

const TABLE = 'app_users';

function demoMode() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// ---------- Demo-Store ----------
type DemoState = { users: AppUser[] };
function demoState(): DemoState {
  const g = globalThis as { __tagtigAppUsers?: DemoState };
  if (!g.__tagtigAppUsers) {
    const now = new Date().toISOString();
    g.__tagtigAppUsers = {
      users: [
        {
          id: 'demo-admin',
          email: 'ben@tagtig.com',
          name: 'Ben',
          role: 'admin',
          is_active: true,
          password_hash: null, // demo-admin nutzt APP_PASSWORD
          invite_token: null,
          invite_expires_at: null,
          invited_by: null,
          last_login_at: null,
          created_at: now,
          updated_at: now,
        },
      ],
    };
  }
  return g.__tagtigAppUsers!;
}

function strip({ password_hash: _ph, ...rest }: AppUser): AppUserPublic {
  return rest;
}

// ---------- Queries ----------

export async function listUsers(): Promise<AppUserPublic[]> {
  if (demoMode()) return demoState().users.map(strip);
  const { data, error } = await supabase()
    .from(TABLE)
    .select(
      'id, email, name, role, is_active, invite_token, invite_expires_at, invited_by, last_login_at, created_at, updated_at',
    )
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as AppUserPublic[];
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  if (demoMode()) {
    return demoState().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }
  const { data, error } = await supabase()
    .from(TABLE)
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data as AppUser | null;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  if (demoMode()) return demoState().users.find((u) => u.id === id) ?? null;
  const { data, error } = await supabase().from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as AppUser | null;
}

export async function getUserByInviteToken(token: string): Promise<AppUser | null> {
  if (demoMode()) return demoState().users.find((u) => u.invite_token === token) ?? null;
  const { data, error } = await supabase()
    .from(TABLE)
    .select('*')
    .eq('invite_token', token)
    .maybeSingle();
  if (error) throw error;
  return data as AppUser | null;
}

export async function createUserWithInvite(
  email: string,
  name: string,
  role: 'admin' | 'user',
  invitedById: string | null,
): Promise<AppUser> {
  const inviteToken = crypto.randomUUID();
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 Tage

  if (demoMode()) {
    const now = new Date().toISOString();
    const user: AppUser = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      role,
      is_active: true,
      password_hash: null,
      invite_token: inviteToken,
      invite_expires_at: inviteExpiresAt,
      invited_by: invitedById,
      last_login_at: null,
      created_at: now,
      updated_at: now,
    };
    demoState().users.push(user);
    return user;
  }

  const { data, error } = await supabase()
    .from(TABLE)
    .insert({
      email: email.toLowerCase(),
      name,
      role,
      invite_token: inviteToken,
      invite_expires_at: inviteExpiresAt,
      invited_by: invitedById,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as AppUser;
}

export async function acceptInvite(
  token: string,
  name: string,
  passwordHash: string,
): Promise<AppUser | null> {
  if (demoMode()) {
    const s = demoState();
    const idx = s.users.findIndex((u) => u.invite_token === token);
    if (idx === -1) return null;
    s.users[idx] = {
      ...s.users[idx],
      name,
      password_hash: passwordHash,
      invite_token: null,
      invite_expires_at: null,
      updated_at: new Date().toISOString(),
    };
    return s.users[idx];
  }
  const { data, error } = await supabase()
    .from(TABLE)
    .update({
      name,
      password_hash: passwordHash,
      invite_token: null,
      invite_expires_at: null,
    })
    .eq('invite_token', token)
    .select('*')
    .single();
  if (error) throw error;
  return data as AppUser;
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<AppUser, 'name' | 'role' | 'is_active'>>,
): Promise<AppUser | null> {
  if (demoMode()) {
    const s = demoState();
    const idx = s.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    s.users[idx] = { ...s.users[idx], ...patch, updated_at: new Date().toISOString() };
    return s.users[idx];
  }
  const { data, error } = await supabase()
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as AppUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (demoMode()) {
    const s = demoState();
    const idx = s.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    s.users.splice(idx, 1);
    return true;
  }
  const { error } = await supabase().from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function updateLastLogin(id: string): Promise<void> {
  if (demoMode()) {
    const u = demoState().users.find((u) => u.id === id);
    if (u) u.last_login_at = new Date().toISOString();
    return;
  }
  await supabase()
    .from(TABLE)
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', id);
}

export async function regenerateInviteToken(id: string): Promise<string | null> {
  const inviteToken = crypto.randomUUID();
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  if (demoMode()) {
    const u = demoState().users.find((u) => u.id === id);
    if (!u) return null;
    u.invite_token = inviteToken;
    u.invite_expires_at = inviteExpiresAt;
    return inviteToken;
  }
  const { error } = await supabase()
    .from(TABLE)
    .update({ invite_token: inviteToken, invite_expires_at: inviteExpiresAt })
    .eq('id', id);
  if (error) throw error;
  return inviteToken;
}
