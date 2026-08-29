import { DEMO_USERS } from '../../src/data/usersData.js';

export function login(req, res) {
  try {
    const { email, password, persona } = req.body;

    let user;
    if (persona) {
      user = DEMO_USERS.find(u => u.persona === persona);
    } else if (email) {
      user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      user = DEMO_USERS[0];
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
    return res.json({
      success: true,
      data: DEMO_USERS
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
