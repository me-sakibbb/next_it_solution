-- Set default currency to BDT for shops table
ALTER TABLE public.shops ALTER COLUMN currency SET DEFAULT 'BDT';

-- Update existing shops to use BDT if they are currently USD or null
UPDATE public.shops SET currency = 'BDT' WHERE currency = 'USD' OR currency IS NULL;

-- If there are other tables with currency column that need updating, add them here
-- For example, if 'users' or 'profiles' had a currency preference.
-- Based on search results, 'shops' seems to be the main place where currency is defined.
