-- Add bonus token balance (purchased packs, never reset by weekly/monthly cycle)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bonusTokens" INTEGER NOT NULL DEFAULT 0;

-- Flag indicating the user has ever purchased a token pack (grants logo access)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenPackPurchased" BOOLEAN NOT NULL DEFAULT false;
