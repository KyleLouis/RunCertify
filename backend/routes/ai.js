const router = require('express').Router();
const auth = require('./auth_middleware');

async function callGemini(prompt, config = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  return ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt, config });
}

router.post('/quote', auth, async (req, res) => {
  const { name, category, finishTime, lang } = req.body;
  try {
    const prompt = lang === 'zh'
      ? `作为一名资深的体育专栏作家，请为一位完成了 ${category}（成绩：${finishTime}）的跑者 ${name} 创作一句极具感染力的跑步名言。必须以 "亲爱的${name}：" 开头。字数40字以内。直接返回内容。`
      : `As a veteran sports writer, create a profound motto for runner ${name} who finished ${category} in ${finishTime}. Must start with "Dear ${name}: ". Under 30 words. Return only the text.`;
    const response = await callGemini(prompt, { temperature: 0.9 });
    res.json({ quote: response.text?.trim() || `亲爱的${name}：坚持到底就是胜利。` });
  } catch (err) {
    res.json({ quote: `${lang === 'zh' ? '亲爱的' : 'Dear '}${name}${lang === 'zh' ? '：' : ': '}坚持到底就是胜利。` });
  }
});

router.post('/quotes/batch', auth, async (req, res) => {
  const { runners, lang } = req.body;
  try {
    const runnerInfo = runners.map(r => `姓名:${r.name}, 项目:${r.category}, 成绩:${r.finishTime}`).join('\n');
    const prompt = lang === 'zh'
      ? `你是一位顶尖体育励志作家。请为以下选手分别创作一句优美的完赛格言。要求：1.每一句都必须以 "亲爱的[选手姓名]：" 开头。2.结合跑步精神，富有诗意和深度。3.每句格言字数在30-40字左右。\n选手列表：\n${runnerInfo}`
      : `You are a top sports motivational writer. Create a beautiful finisher motto for each runner below. Requirements: 1. Each must start with "Dear [Name]: ". 2. Deep and poetic. 3. Around 20 words per motto.\nRunner list:\n${runnerInfo}`;
    const { Type } = await import('@google/genai');
    const response = await callGemini(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: { quotes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, quote: { type: Type.STRING } }, required: ['name', 'quote'] } } },
        required: ['quotes']
      }
    });
    const result = JSON.parse(response.text || '{"quotes":[]}');
    res.json(result.quotes);
  } catch (err) {
    res.json(runners.map(r => ({ name: r.name, quote: `${lang === 'zh' ? '亲爱的' : 'Dear '}${r.name}${lang === 'zh' ? '：' : ': '}每一步都是对自我的超越。` })));
  }
});

router.post('/badge', auth, async (req, res) => {
  const { theme } = req.body;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.json({ imageUrl: null });
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `A professional, high-end circular finisher medal badge for a marathon achievement. Theme: ${theme}. Gold metallic finish, elegant 3D relief, sharp details, minimalist sports aesthetic, white background.` }] },
      config: { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return res.json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
    }
    res.json({ imageUrl: null });
  } catch (err) {
    res.json({ imageUrl: null });
  }
});

module.exports = router;
