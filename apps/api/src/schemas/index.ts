import { z } from "zod";

// Common schemas
export const MonthSchema = z.string().regex(/^\d{4}-\d{2}$/); // YYYY-MM format

// Makes routes
export const MakeParamSchema = z
  .object({
    make: z.string(),
  })
  .strict();

export const MakeQuerySchema = z
  .object({
    month: MonthSchema.optional(),
    fuel_type: z.string().optional(),
    vehicle_type: z.string().optional(),
  })
  .strict();

// Cars routes
export const CarQuerySchema = z
  .object({
    month: MonthSchema.optional(),
    make: z.string().optional(),
    fuel_type: z.string().optional(),
    vehicle_type: z.string().optional(),
  })
  .strict();

export const MonthsQuerySchema = z
  .object({
    grouped: z.string().optional(),
  })
  .strict();

// COE routes
export const COEQuerySchema = z
  .object({
    sort: z.string().optional(),
    orderBy: z.string().optional(),
    month: MonthSchema.optional(),
    from: MonthSchema.optional(),
    to: MonthSchema.optional(),
  })
  .strict();

// Months routes
export const LatestMonthQuerySchema = z
  .object({
    type: z.enum(["cars", "coe"]).optional(),
  })
  .strict();

// Response schemas
export const MakeArraySchema = z.array(z.string());

export const CarSchema = z.object({
  make: z.string(),
  model: z.string(),
  fuel_type: z.string(),
  vehicle_type: z.string(),
  month: z.string(),
  number: z.number(),
});

export const COESchema = z.object({
  month: z.string(),
  bidding_no: z.number(),
  vehicle_class: z.string(),
  quota: z.number(),
  bids_received: z.number(),
  premium: z.number(),
});

export const LatestMonthResponseSchema = z
  .object({
    cars: MonthSchema.optional(),
    coe: MonthSchema.optional(),
  })
  .strict();

export const MonthsByYearSchema = z.record(z.string(), z.array(z.string()));

export type MakeParams = z.infer<typeof MakeParamSchema>;
export type MakeQuery = z.infer<typeof MakeQuerySchema>;
export type CarQuery = z.infer<typeof CarQuerySchema>;
export type MonthsQuery = z.infer<typeof MonthsQuerySchema>;
export type COEQuery = z.infer<typeof COEQuerySchema>;
export type LatestMonthQuery = z.infer<typeof LatestMonthQuerySchema>;

export type Car = z.infer<typeof CarSchema>;
export type COE = z.infer<typeof COESchema>;
export type LatestMonthResponse = z.infer<typeof LatestMonthResponseSchema>;
export type MonthsByYear = z.infer<typeof MonthsByYearSchema>;
