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
  birth_time?: string;
  hour_branch?: {
    name: string;
    chinese: string;
    animal: string;
  };
}

export interface BaziApiResponse {
  success: boolean;
  data?: BaziCalculationResult;
  error?: string;
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

export async function calculateBazi(
  birthDate: string,
  gender?: string,
  birthTime?: string
): Promise<BaziApiResponse> {
  try {
    const payload: Record<string, any> = { birth_date: birthDate };
    if (gender && gender !== 'unspecified') {
      payload.gender = gender;
    }
    if (birthTime) {
      payload.birth_time = birthTime;
    }

    const res = await fetch(`${API_BASE_URL}/bazi/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json && json.success && json.data) {
      return { success: true, data: json.data };
    }

    if (json && json.error) {
      return { success: false, error: json.error };
    }

    if (json && json.message) {
      return { success: false, error: json.message };
    }

    return { success: false, error: `Server returned status ${res.status}` };
  } catch (err) {
    console.warn('API connection error:', err);
    return { success: false, error: 'Unable to connect to the server. Please check your connection.' };
  }
}
