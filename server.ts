import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { sqlRouter } from './src/server/sqlRoutes.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Relational SQL Database API (SQLite)
  app.use('/api/sql', sqlRouter);

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'BloomVerse Spiritual AI Server',
      timestamp: new Date().toISOString(),
    });
  });

  // API: AI Spiritual Progression Coach & Mentor
  app.post('/api/ai/coach', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY non configurée dans les variables d\'environnement.',
        });
      }

      const { prompt, userContext } = req.body;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `Tu es l'Agent IA & Mentor Spirituel de l'application chrétienne de sanctification, prière et discipline spirituelle.
Ta mission absolue est d'aider l'utilisateur à se FOCALISER entièrement sur sa progression spirituelle quotidienne, à vaincre la tiédeur, à approfondir sa vie de prière et sa méditation de la Sainte Bible.

Profil et état actuel de l'utilisateur :
- Nom / Pseudo : ${userContext?.name || 'Disciple'}
- Rang spirituel : ${userContext?.hunterRank || 'Rang E'}
- Titre : ${userContext?.spiritualTitle || 'Novice de la Grâce'}
- Niveau actuel : ${userContext?.level || 1} (${userContext?.currentXp || 0} XP)
- Prière effectuée aujourd'hui : ${userContext?.prayerMinutesToday || 0} minute(s)
- Chapitres bibliques médités aujourd'hui : ${userContext?.bibleChaptersToday || 0}
- Série de sanctification / résistance aux vices : ${userContext?.generalViceStreak || 0} jour(s)
- Quêtes restantes à accomplir : ${userContext?.uncompletedQuestsCount || 0}

Directives de ton accompagnement :
1. Sois encourageant, précis, biblique, bienveillant et solennel.
2. Structure tes réponses avec clarté : diagnostic, verset d'appui, et 2 à 3 étapes concrètes immédiates.
3. Rappelle toujours la grâce de Dieu et l'importance de la régularité dans la prière secrète.
4. Réponds toujours en français de manière fluide, bien rythmée et sans jargon technique.
5. Si l'utilisateur demande comment bloquer les autres applications du téléphone pour mieux se concentrer sans distraction, explique-lui que BloomVerse intègre le Bouclier Anti-Distraction IA : mode plein écran immersif (Kiosque), maintien de l'écran allumé (WakeLock), détecteur d'évasion (si l'utilisateur tente de basculer vers WhatsApp, TikTok, Instagram ou YouTube, l'Agent déclenche l'alarme d'interception et le rappelle au sanctuaire), ainsi que la configuration guidée du Mode Sans distraction (Bien-être numérique Android) et Mode Concentration (iOS) pour verrouiller totalement l'accès aux réseaux sociaux.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt || 'Donne-moi une analyse de ma progression aujourd\'hui et dis-moi sur quoi me concentrer en priorité.',
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        reply: response.text || 'Que la grâce et la paix du Seigneur reposent sur votre chemin de sanctification.',
      });
    } catch (error: any) {
      console.error('Gemini coach error:', error);
      return res.status(500).json({
        error: error.message || 'Erreur lors de la communication avec l\'agent IA.',
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`BloomVerse Server listening on port ${PORT}`);
  });
}

startServer();
