import { api } from './src/api';

export async function generateInspirationalQuote(name: string, category: string, finishTime: string, lang: 'zh' | 'en') {
  try {
    const res = await api.generateQuote(name, category, finishTime, lang);
    return res.quote;
  } catch {
    return `${lang === 'zh' ? '亲爱的' : 'Dear '}${name}${lang === 'zh' ? '：' : ': '}坚持到底就是胜利。`;
  }
}

export async function generateBatchInspirationalQuotes(runners: {name: string, category: string, finishTime: string}[], lang: 'zh' | 'en') {
  try {
    return await api.generateBatchQuotes(runners, lang);
  } catch {
    return runners.map(r => ({
      name: r.name,
      quote: `${lang === 'zh' ? '亲爱的' : 'Dear '}${r.name}${lang === 'zh' ? '：' : ': '}每一步都是对自我的超越。`
    }));
  }
}

export async function generateCustomBadge(theme: string) {
  try {
    const res = await api.generateBadge(theme);
    return res.imageUrl;
  } catch {
    return null;
  }
}
