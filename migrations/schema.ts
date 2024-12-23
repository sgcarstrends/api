import { sql } from "drizzle-orm";
import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const cars = pgTable(
  "cars",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    month: text(),
    make: text(),
    importerType: text("importer_type"),
    fuelType: text("fuel_type"),
    vehicleType: text("vehicle_type"),
    number: integer(),
  },
  (table) => [
    index("fuel_type_idx").using(
      "btree",
      table.fuelType.asc().nullsLast().op("text_ops"),
    ),
    index("make_fuel_type_idx").using(
      "btree",
      table.make.asc().nullsLast().op("text_ops"),
      table.fuelType.asc().nullsLast().op("text_ops"),
    ),
    index("make_idx").using(
      "btree",
      table.make.asc().nullsLast().op("text_ops"),
    ),
    index("month_idx").using(
      "btree",
      table.month.asc().nullsLast().op("text_ops"),
    ),
    index("month_make_idx").using(
      "btree",
      table.month.asc().nullsLast().op("text_ops"),
      table.make.asc().nullsLast().op("text_ops"),
    ),
    index("number_idx").using(
      "btree",
      table.number.asc().nullsLast().op("int4_ops"),
    ),
  ],
);

export const coe = pgTable(
  "coe",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    month: text(),
    biddingNo: integer("bidding_no"),
    vehicleClass: text("vehicle_class"),
    quota: integer(),
    bidsSuccess: integer("bids_success"),
    bidsReceived: integer("bids_received"),
    premium: integer(),
  },
  (table) => [
    index("bids_idx").using(
      "btree",
      table.bidsSuccess.asc().nullsLast().op("int4_ops"),
      table.bidsReceived.asc().nullsLast().op("int4_ops"),
    ),
    index("month_bidding_no_idx").using(
      "btree",
      table.month.asc().nullsLast().op("text_ops"),
      table.biddingNo.asc().nullsLast().op("int4_ops"),
    ),
    index("month_bidding_no_vehicle_class_idx").using(
      "btree",
      table.month.desc().nullsLast().op("int4_ops"),
      table.biddingNo.desc().nullsLast().op("int4_ops"),
      table.vehicleClass.asc().nullsLast().op("text_ops"),
    ),
    index("month_vehicle_idx").using(
      "btree",
      table.month.asc().nullsLast().op("text_ops"),
      table.vehicleClass.asc().nullsLast().op("text_ops"),
    ),
    index("premium_idx").using(
      "btree",
      table.premium.asc().nullsLast().op("int4_ops"),
    ),
    index("vehicle_class_idx").using(
      "btree",
      table.vehicleClass.asc().nullsLast().op("text_ops"),
    ),
  ],
);
