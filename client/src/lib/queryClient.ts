import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// API base URL - Production'da backend URL'i kullanılacak
// Netlify'da environment variable olarak VITE_API_URL ayarlayın
// Örnek: https://your-backend-app.onrender.com
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Debug: API URL'i console'da göster (sadece production'da)
if (import.meta.env.PROD) {
  console.log('🌐 API Base URL:', API_BASE_URL || 'NOT SET - API requests will fail!');
  if (!API_BASE_URL) {
    console.error('❌ VITE_API_URL environment variable is not set!');
    console.error('Please set VITE_API_URL in Netlify Dashboard → Site settings → Environment variables');
  }
}

// Helper function to build full URL - Export edildi, diğer dosyalarda da kullanılabilir
export function buildApiUrl(url: string): string {
  // Eğer URL zaten tam URL ise (http:// veya https:// ile başlıyorsa) olduğu gibi kullan
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Eğer API_BASE_URL varsa, ona ekle
  if (API_BASE_URL) {
    // API_BASE_URL'in sonunda / varsa kaldır, url'in başında / yoksa ekle
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const apiUrl = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${baseUrl}${apiUrl}`;
    
    // Debug log (sadece development'ta)
    if (import.meta.env.DEV) {
      console.log(`🔗 API Request: ${url} → ${fullUrl}`);
    }
    
    return fullUrl;
  }
  
  // API_BASE_URL yoksa, relative URL kullan (development veya aynı domain'de backend)
  // Production'da bu çalışmaz çünkü backend farklı bir domain'de
  if (import.meta.env.PROD) {
    console.warn(`⚠️ API_BASE_URL not set, using relative URL: ${url}`);
    console.warn('This will likely fail in production. Please set VITE_API_URL environment variable.');
  }
  
  return url;
}

// JWT token'ı localStorage'dan al
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = buildApiUrl(url);
  const token = getAuthToken();
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const fullUrl = buildApiUrl(url);
    const token = getAuthToken();
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      // Token geçersizse localStorage'dan temizle
      if (token) {
        localStorage.removeItem('auth_token');
      }
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Changed from Infinity to 0 - allows refetch after login
      retry: false,
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        // Silently handle 401 errors - they're expected when not logged in
        if (error?.message?.includes('401')) {
          return;
        }
      },
    },
  },
});
