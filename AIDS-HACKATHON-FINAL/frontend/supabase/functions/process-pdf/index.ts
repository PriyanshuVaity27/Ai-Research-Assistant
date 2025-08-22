
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { paperId } = await req.json();
    
    if (!paperId) {
      throw new Error('Paper ID is required');
    }
    
    // Get paper details from the database
    const { data: paper, error: paperError } = await supabase
      .from('papers')
      .select('*')
      .eq('id', paperId)
      .single();
      
    if (paperError) throw paperError;
    
    // Get file URL from storage
    const { data: fileData } = await supabase
      .storage
      .from('pdfs')
      .createSignedUrl(paper.file_path, 60);
      
    if (!fileData?.signedUrl) {
      throw new Error('Could not get signed URL for file');
    }
    
    // Simulate PDF processing (would implement actual processing here)
    // In a real implementation, this would extract text, generate embeddings, etc.
    
    // For demonstration purposes, we'll just update the paper as processed with a mock summary
    const mockSummary = `This paper presents a novel approach to natural language processing using transformer architecture.
    The authors demonstrate state-of-the-art performance on several benchmark tasks.
    Key findings include improved tokenization methods and attention mechanisms that better capture contextual relationships.`;
    
    // Update paper in database
    const { error: updateError } = await supabase
      .from('papers')
      .update({
        processed: true,
        summary: mockSummary
      })
      .eq('id', paperId);
      
    if (updateError) throw updateError;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Paper processed successfully',
        paperId: paper.id,
        summary: mockSummary
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in process-pdf function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
