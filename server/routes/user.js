import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const router = Router();

function supabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

// GET /api/user/me — get or create user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const db = supabase();
    let { data: user } = await db
      .from('users')
      .select('*')
      .eq('clerk_id', req.userId)
      .single();

    if (!user) {
      const { data: newUser } = await db
        .from('users')
        .insert({ clerk_id: req.userId, email: req.body.email || '' })
        .select()
        .single();
      user = newUser;
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/register — create user after Clerk signup
router.post('/register', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const db = supabase();

    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('clerk_id', req.userId)
      .single();

    if (existing) return res.json({ already_exists: true });

    const { data: user } = await db
      .from('users')
      .insert({ clerk_id: req.userId, email })
      .select()
      .single();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/preferences
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const db = supabase();
    const { data: user } = await db
      .from('users')
      .select('id')
      .eq('clerk_id', req.userId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: prefs } = await db
      .from('preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    res.json(prefs || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/preferences
router.post('/preferences', requireAuth, async (req, res) => {
  try {
    const db = supabase();
    const { data: user } = await db
      .from('users')
      .select('id')
      .eq('clerk_id', req.userId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { servings, picky_eaters, keep_mild, meat_free, gluten_free, dairy_free, thirty_min_max } = req.body;

    const { data: existing } = await db
      .from('preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const prefsData = { user_id: user.id, servings, picky_eaters, keep_mild, meat_free, gluten_free, dairy_free, thirty_min_max };

    let result;
    if (existing) {
      result = await db.from('preferences').update(prefsData).eq('user_id', user.id).select().single();
    } else {
      result = await db.from('preferences').insert(prefsData).select().single();
    }

    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/plans — list all plans for user
router.get('/plans', requireAuth, async (req, res) => {
  try {
    const db = supabase();
    const { data: user } = await db
      .from('users')
      .select('id')
      .eq('clerk_id', req.userId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: plans } = await db
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    res.json(plans || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
