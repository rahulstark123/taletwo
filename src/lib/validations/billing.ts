import { z } from "zod";

export const checkoutSchema = z.object({
  plan: z.enum(["pro", "max"], { message: "Please choose Pro or Max." }),
  cycle: z.enum(["month", "year"], { message: "Please choose monthly or yearly." }),
});

export const confirmSchema = z.object({
  orderId: z.string().min(3).max(64),
  paymentId: z.string().min(3).max(64),
  signature: z.string().min(16).max(256),
});
