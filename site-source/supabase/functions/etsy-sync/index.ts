
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EtsyListing {
  listing_id: number;
  url: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  state: string;
  title: string;
  quantity: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { productId } = await req.json()

    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get product with Etsy listing ID
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product?.etsy_listing_id) {
      return new Response(
        JSON.stringify({ error: 'Product not found or no Etsy listing ID' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Etsy API credentials from environment
    const etsyApiKey = Deno.env.get('ETSY_API_KEY')
    
    if (!etsyApiKey) {
      console.error('Etsy API key not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Etsy API configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    try {
      // Fetch listing data from Etsy API
      const etsyResponse = await fetch(
        `https://openapi.etsy.com/v3/application/listings/${product.etsy_listing_id}`,
        {
          headers: {
            'x-api-key': etsyApiKey,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!etsyResponse.ok) {
        const errorText = await etsyResponse.text()
        console.error('Etsy API error:', etsyResponse.status, errorText)
        
        // If API call fails, return current product data
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              listing_id: parseInt(product.etsy_listing_id),
              url: product.etsy_url || '',
              price: product.etsy_price?.toString() || product.price.toString(),
              state: product.etsy_status || 'unknown',
              title: product.name
            },
            message: 'Using cached data - Etsy API unavailable' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const etsyListing: EtsyListing = await etsyResponse.json()
      
      // Calculate actual price from Etsy's format
      const actualPrice = etsyListing.price.amount / etsyListing.price.divisor
      
      // Map Etsy states to our internal states
      const statusMapping: { [key: string]: string } = {
        'active': 'active',
        'inactive': 'inactive',
        'draft': 'draft',
        'expired': 'expired',
        'sold_out': 'sold_out'
      }
      
      const mappedStatus = statusMapping[etsyListing.state] || 'inactive'

      // Update product with latest Etsy data
      const { error: updateError } = await supabaseClient
        .from('products')
        .update({
          etsy_price: actualPrice,
          etsy_status: mappedStatus,
          etsy_last_sync: new Date().toISOString()
        })
        .eq('id', productId)

      if (updateError) {
        console.error('Error updating product:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update product' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            listing_id: etsyListing.listing_id,
            url: `https://www.etsy.com/listing/${etsyListing.listing_id}`,
            price: actualPrice.toString(),
            state: mappedStatus,
            title: etsyListing.title,
            quantity: etsyListing.quantity
          },
          message: 'Product synced with Etsy successfully' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (etsyError) {
      console.error('Error calling Etsy API:', etsyError)
      
      // Return current product data as fallback
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            listing_id: parseInt(product.etsy_listing_id),
            url: product.etsy_url || '',
            price: product.etsy_price?.toString() || product.price.toString(),
            state: product.etsy_status || 'unknown',
            title: product.name
          },
          message: 'Using cached data - Etsy sync failed' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in etsy-sync function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
