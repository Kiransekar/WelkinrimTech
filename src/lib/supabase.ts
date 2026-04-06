import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://axjomaehmyohlnbyekjr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4am9tYWVobXlvaGxuYnlla2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Nzk5MjEsImV4cCI6MjA5MTA1NTkyMX0.yFtHyBVvj2GzI4bLR5ajkmFT8-wh8Vu9WN3-XzZwE04';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchProducts() {
  try {
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
      return {
        id: row.id,
        series: row.series?.toLowerCase() || productData.series?.toLowerCase() || 'haemng',
        seriesLabel: row.series || productData.series || 'Unknown',
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
