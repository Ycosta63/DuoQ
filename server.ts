import './instrument';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './src/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Authentication (mock)
  // Usually this would be session/cookie based. We'll use a simple header.
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = req.headers['x-user-id'];
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
  };

  // --- API Routes ---
  
  // Login
  app.post('/api/auth/login', async (req, res) => {
    const db = await getDb();
    const { username, password } = req.body;
    
    // Accept password check OR if not provided, just login (for ease during demo, but we will require it now)
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!user || (user.password && user.password !== password)) {
       return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    res.json(user);
  });

  // Register
  app.post('/api/auth/register', async (req, res) => {
    const db = await getDb();
    const { username, password, bio, games, playstyle, relation_mode } = req.body;
    
    const existing = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existing) {
       return res.status(400).json({ error: 'Ce pseudo est déjà pris' });
    }
    
    const id = uuidv4();
    await db.run(
      'INSERT INTO users (id, username, password, bio, games, playstyle, relation_mode) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username, password, bio || '', games || '', playstyle || '', relation_mode || 'Casual']
    );
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    res.json(user);
  });

  // Get current user profile
  app.get('/api/me', authMiddleware, async (req, res) => {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // Get discoverable profiles
  app.get('/api/discover', authMiddleware, async (req, res) => {
    const db = await getDb();
    const userId = req.userId;
    // Get users that I haven't swiped on yet, and exclude myself
    const profiles = await db.all(`
      SELECT * FROM users 
      WHERE id != ? 
      AND id NOT IN (SELECT target_id FROM swipes WHERE swiper_id = ?)
      ORDER BY RANDOM() LIMIT 20
    `, [userId, userId]);
    res.json(profiles);
  });

  // Swipe on a profile
  app.post('/api/swipe', authMiddleware, async (req, res) => {
    const db = await getDb();
    const swiper_id = req.userId;
    const { target_id, type } = req.body; // 'GG', 'FF', 'GOAT'

    if (!['GG', 'FF', 'GOAT'].includes(type)) {
      return res.status(400).json({ error: 'Invalid swipe type' });
    }
    
    try {
      await db.run(
        'INSERT INTO swipes (swiper_id, target_id, type) VALUES (?, ?, ?)',
        [swiper_id, target_id, type]
      );
    } catch(e) {
      // already swiped
    }

    let isMatch = false;
    let match = null;

    if (type === 'GG' || type === 'GOAT') {
      // check if target already liked swiper
      const mutual = await db.get(
        'SELECT * FROM swipes WHERE swiper_id = ? AND target_id = ? AND type IN ("GG", "GOAT")',
        [target_id, swiper_id]
      );
      if (mutual) {
        isMatch = true;
        const matchId = uuidv4();
        // insert match (ordered IDs to prevent duplicates)
        const user1 = swiper_id < target_id ? swiper_id : target_id;
        const user2 = swiper_id < target_id ? target_id : swiper_id;
        await db.run(
          'INSERT OR IGNORE INTO matches (id, user1_id, user2_id) VALUES (?, ?, ?)',
          [matchId, user1, user2]
        );
        match = await db.get('SELECT * FROM matches WHERE user1_id = ? AND user2_id = ?', [user1, user2]);
      }
    }

    res.json({ success: true, isMatch, match });
  });

  // Get matches
  app.get('/api/matches', authMiddleware, async (req, res) => {
    const db = await getDb();
    const userId = req.userId;
    const matches = await db.all(`
      SELECT m.id as match_id, u.* 
      FROM matches m
      JOIN users u ON (m.user1_id = u.id OR m.user2_id = u.id)
      WHERE (m.user1_id = ? OR m.user2_id = ?) AND u.id != ?
    `, [userId, userId, userId]);
    res.json(matches);
  });

  // Get messages for a match
  app.get('/api/matches/:matchId/messages', authMiddleware, async (req, res) => {
    const db = await getDb();
    const messages = await db.all(
      'SELECT * FROM messages WHERE match_id = ? ORDER BY created_at ASC',
      [req.params.matchId]
    );
    res.json(messages);
  });

  // Send a message
  app.post('/api/matches/:matchId/messages', authMiddleware, async (req, res) => {
    const db = await getDb();
    const msgId = uuidv4();
    const { content } = req.body;
    await db.run(
      'INSERT INTO messages (id, match_id, sender_id, content) VALUES (?, ?, ?, ?)',
      [msgId, req.params.matchId, req.userId, content]
    );
    const msg = await db.get('SELECT * FROM messages WHERE id = ?', [msgId]);
    res.json(msg);
  });


  // --- Global Discord OAuth Routes ---
  app.get('/api/auth/discord/url', (req, res) => {
    const redirectUri = req.query.redirectUri as string;
    
    if (!process.env.DISCORD_CLIENT_ID) {
      return res.status(500).json({ error: 'Discord credentials missing' });
    }

    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify',
      state: redirectUri // pass it back to know where to redirect for token
    });

    res.json({ url: `https://discord.com/api/oauth2/authorize?${params}` });
  });

  app.get('/auth/callback', async (req, res) => {
    const { code, state: redirectUri } = req.query;
    if (!code || !redirectUri) return res.send('Missing parameters');

    try {
      const body = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || '',
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri as string
      });

      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        throw new Error(tokenData.error_description || 'Failed to get token');
      }

      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userData = await userRes.json();
      
      const discordUsername = userData.discriminator && userData.discriminator !== '0' 
        ? `${userData.username}#${userData.discriminator}` 
        : userData.username;

      res.send(`
        <html><body><script>
          if (window.opener) {
            window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', discord_username: '${discordUsername}' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script><p>Succès ! Vous pouvez fermer cette fenêtre.</p></body></html>
      `);
    } catch (e) {
      console.error(e);
      res.send('Erreur lors de la connexion à Discord.');
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Extend express request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

startServer().catch(console.error);
