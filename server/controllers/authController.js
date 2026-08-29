import { dbGetUsers, dbGetUserByEmail, dbGetUserByPersona, dbSaveUser } from '../db/database.js';

export function login(req, res) {
  try {
    const { email, password, persona } = req.body;

    let user = null;

    // 1. If email is provided, prioritize it
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      user = dbGetUserByEmail(cleanEmail);

      // If user doesn't exist, create a new persistent profile for this email
      if (!user) {
        const username = cleanEmail.split('@')[0];
        const formattedName = username
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        const newUser = {
          id: `usr-custom-${Date.now().toString(36)}`,
          email: cleanEmail,
          name: formattedName || 'Enterprise Operator',
          role: 'Custom Station Operator',
          persona: 'custom',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
          quote: "Autonomous operations authorized. Live connection established with NEXUS Command.",
          clearance: "Tier-1 Command",
          heroImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop&q=80"
        };

        try {
          user = dbSaveUser(newUser);
        } catch {
          user = newUser;
        }
      }
    } else if (persona) {
      user = dbGetUserByPersona(persona);
    }

    if (!user) {
      const users = dbGetUsers();
      user = users[0];
    }

    return res.json({
      success: true,
      data: {
        user,
        token: `mock-jwt-token-${user.id}-${Date.now()}`
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getUsers(req, res) {
  try {
    const users = dbGetUsers();
    return res.json({
      success: true,
      data: users
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function updateProfile(req, res) {
  try {
    const { id, email, name, role, avatar, quote, clearance, heroImage } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const existing = dbGetUserByEmail(email) || {};
    const updatedUser = {
      id: id || existing.id || `usr-${Date.now().toString(36)}`,
      email: email.trim().toLowerCase(),
      name: name || existing.name || 'Enterprise Operator',
      role: role || existing.role || 'Authorized Operator',
      persona: existing.persona || 'custom',
      avatar: avatar || existing.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      quote: quote || existing.quote || 'Authorized user connected to NEXUS Network.',
      clearance: clearance || existing.clearance || 'Tier-1 Command',
      heroImage: heroImage || existing.hero_image || existing.heroImage || null
    };

    const saved = dbSaveUser(updatedUser);

    return res.json({
      success: true,
      data: saved || updatedUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}


