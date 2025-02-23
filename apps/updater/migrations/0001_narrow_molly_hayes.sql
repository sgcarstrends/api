CREATE TABLE "coe_pqp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" text,
	"vehicle_class" text,
	"pqp" integer
);
--> statement-breakpoint
CREATE INDEX "pqp_month_vehicle_class_idx" ON "coe_pqp" USING btree ("month","vehicle_class");--> statement-breakpoint
CREATE INDEX "pqp_vehicle_class_idx" ON "coe_pqp" USING btree ("vehicle_class");--> statement-breakpoint
CREATE INDEX "pqp_idx" ON "coe_pqp" USING btree ("pqp");