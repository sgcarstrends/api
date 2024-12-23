-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" text,
	"make" text,
	"importer_type" text,
	"fuel_type" text,
	"vehicle_type" text,
	"number" integer
);
--> statement-breakpoint
CREATE TABLE "coe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" text,
	"bidding_no" integer,
	"vehicle_class" text,
	"quota" integer,
	"bids_success" integer,
	"bids_received" integer,
	"premium" integer
);
--> statement-breakpoint
CREATE INDEX "fuel_type_idx" ON "cars" USING btree ("fuel_type" text_ops);--> statement-breakpoint
CREATE INDEX "make_fuel_type_idx" ON "cars" USING btree ("make" text_ops,"fuel_type" text_ops);--> statement-breakpoint
CREATE INDEX "make_idx" ON "cars" USING btree ("make" text_ops);--> statement-breakpoint
CREATE INDEX "month_idx" ON "cars" USING btree ("month" text_ops);--> statement-breakpoint
CREATE INDEX "month_make_idx" ON "cars" USING btree ("month" text_ops,"make" text_ops);--> statement-breakpoint
CREATE INDEX "number_idx" ON "cars" USING btree ("number" int4_ops);--> statement-breakpoint
CREATE INDEX "bids_idx" ON "coe" USING btree ("bids_success" int4_ops,"bids_received" int4_ops);--> statement-breakpoint
CREATE INDEX "month_bidding_no_idx" ON "coe" USING btree ("month" text_ops,"bidding_no" int4_ops);--> statement-breakpoint
CREATE INDEX "month_bidding_no_vehicle_class_idx" ON "coe" USING btree ("month" int4_ops,"bidding_no" int4_ops,"vehicle_class" text_ops);--> statement-breakpoint
CREATE INDEX "month_vehicle_idx" ON "coe" USING btree ("month" text_ops,"vehicle_class" text_ops);--> statement-breakpoint
CREATE INDEX "premium_idx" ON "coe" USING btree ("premium" int4_ops);--> statement-breakpoint
CREATE INDEX "vehicle_class_idx" ON "coe" USING btree ("vehicle_class" text_ops);
*/