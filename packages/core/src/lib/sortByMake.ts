import type { Car } from "../types";

export const sortByMake = (a: Pick<Car, "make">, b: Pick<Car, "make">) =>
  a.make.localeCompare(b.make);
