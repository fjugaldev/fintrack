ALTER TABLE "transactions" ADD COLUMN "to_amount" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "exchange_rate" numeric(18, 8);