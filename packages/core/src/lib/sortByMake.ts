import type { CarType } from "../types";

export const sortByMake = (
  a: Pick<CarType, "make">,
  b: Pick<CarType, "make">,
) => a.make.localeCompare(b.make);
