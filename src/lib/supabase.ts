import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://axjomaehmyohlnbyekjr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4am9tYWVobXlvaGxuYnlla2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Nzk5MjEsImV4cCI6MjA5MTA1NTkyMX0.yFtHyBVvj2GzI4bLR5ajkmFT8-wh8Vu9WN3-XzZwE04';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchProducts() {
  try {
    // First fetch series labels
    const { data: seriesData, error: seriesError } = await supabase
      .from('series')
      .select('id, label')
      .eq('is_deleted', false);

    if (seriesError) {
      console.error('Supabase series error:', seriesError);
    }

    // Create a map of series id -> label
    const seriesLabels: Record<string, string> = {};
    if (seriesData) {
      seriesData.forEach((s: any) => {
        seriesLabels[s.id.toLowerCase()] = s.label;
      });
    }

    // Fallback labels matching database
    const fallbackLabels: Record<string, string> = {
      haemng: 'Haemng Series',
      maelard: 'Maelard Series',
      esc: 'ESCs',
      fc: 'Flight Controller',
      ips: 'Integrated Power Systems',
      other: 'Other Systems & Custom Solutions',
    };

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    // Transform Supabase format to client format
    return (data || []).map((row: any) => {
      const productData = row.data || {};
      const seriesKey = row.series?.toLowerCase() || productData.series?.toLowerCase() || 'haemng';
      const seriesLabel = seriesLabels[seriesKey] || fallbackLabels[seriesKey] || row.series || 'Unknown';

      return {
        id: row.id,
        series: seriesKey,
        seriesLabel: seriesLabel,
        model: row.model || productData.model || 'Unknown Model',
        name: productData.name || row.model || 'Unknown',
        tag: productData.tag || row.series || 'Product',
        application: productData.application || 'UAV / eVTOL',
        keySpecs: productData.keySpecs || [],
        allSpecs: productData.allSpecs || [],
        perf: productData.perf || productData.performance || [],
        thumbnailUrl: productData.thumbnailUrl || null,
        iconUrl: productData.iconUrl || null,
        thumbnailBgColor: productData.thumbnailBgColor || null,
      };
    });
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return null;
  }
}
