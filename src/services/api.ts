// API client for connecting fengshui-shifu-ui to fengshui-shifu-api

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  rails_version?: string;
  ruby_version?: string;
}

export interface BaziCalculationResult {
  birth_date: string;
  gender: string;
  day_master: {
    name: string;
    chinese: string;
    element: string;
    polarity: string;
  };
  day_branch: {
    name: string;
    chinese: string;
    animal: string;
  };
  kua_number: number;
  kua_profile: {
    group: string;
    sheng_qi: string;
    tian_yi: string;
    yan_nian: string;
    fu_wei: string;
  };
  today_luck_teaser: string;
}

export async function checkApiHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('API connection check failed, using fallback:', err);
    return null;
  }
}

export async function calculateBazi(birthDate: string, gender: string = 'male'): Promise<BaziCalculationResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/bazi/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birth_date: birthDate, gender }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn('API error, using client-side fallback calculation:', err);
  }

  // Client-side fallback calculation if API is offline
  return clientSideBaziFallback(birthDate, gender);
}

function clientSideBaziFallback(birthDate: string, gender: string): BaziCalculationResult {
  const date = new Date(birthDate);
  const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const dayMasters = [
    { name: 'Ren Water', chinese: '壬水', element: 'Water', polarity: 'Yang' },
    { name: 'Gui Water', chinese: '癸水', element: 'Water', polarity: 'Yin' },
    { name: 'Jia Wood', chinese: '甲木', element: 'Wood', polarity: 'Yang' },
    { name: 'Yi Wood', chinese: '乙木', element: 'Wood', polarity: 'Yin' },
    { name: 'Bing Fire', chinese: '丙火', element: 'Fire', polarity: 'Yang' }
  ];

  const idx = Math.abs(date.getFullYear() + date.getMonth() + date.getDate()) % dayMasters.length;
  const dm = dayMasters[idx];

  return {
    birth_date: birthDate,
    gender,
    day_master: dm,
    day_branch: { name: 'Zi Rat', chinese: '子鼠', animal: 'Rat' },
    kua_number: 7,
    kua_profile: { group: 'West', sheng_qi: 'NW', tian_yi: 'SW', yan_nian: 'NE', fu_wei: 'W' },
    today_luck_teaser: `Today's Energy Rating for ${dm.element} Day Masters: 91% High Potential. Strategic alignment activated.`
  };
}
