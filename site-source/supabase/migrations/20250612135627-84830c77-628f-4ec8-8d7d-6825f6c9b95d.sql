
-- Add Etsy-related columns to the products table
ALTER TABLE public.products 
ADD COLUMN etsy_listing_id TEXT,
ADD COLUMN etsy_url TEXT,
ADD COLUMN etsy_price NUMERIC,
ADD COLUMN etsy_status TEXT DEFAULT 'draft' CHECK (etsy_status IN ('active', 'inactive', 'draft', 'expired', 'sold_out')),
ADD COLUMN etsy_last_sync TIMESTAMP WITH TIME ZONE;

-- Add index for better performance when querying by Etsy listing ID
CREATE INDEX idx_products_etsy_listing_id ON public.products(etsy_listing_id);

-- Add comment for documentation
COMMENT ON COLUMN public.products.etsy_listing_id IS 'Etsy listing ID for API integration';
COMMENT ON COLUMN public.products.etsy_url IS 'Direct link to the Etsy listing';
COMMENT ON COLUMN public.products.etsy_price IS 'Current price on Etsy (may differ from base price)';
COMMENT ON COLUMN public.products.etsy_status IS 'Current status of the listing on Etsy';
COMMENT ON COLUMN public.products.etsy_last_sync IS 'Last time Etsy data was synchronized';
