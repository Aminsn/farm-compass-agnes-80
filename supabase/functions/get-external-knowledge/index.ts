
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // URL of the external knowledge base
    const knowledgeBaseUrl = "https://raw.githubusercontent.com/Aminsn/hackathon_docs/refs/heads/main/knowledge_base.txt"
    
    // Fetch the knowledge base content
    const response = await fetch(knowledgeBaseUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch external knowledge base: ${response.status} ${response.statusText}`)
    }
    
    // Get the content as text
    const knowledgeBaseContent = await response.text()
    
    return new Response(
      JSON.stringify({ 
        knowledgeBaseContent,
        message: 'External knowledge base retrieved successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve external knowledge base' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
