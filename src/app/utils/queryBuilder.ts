/* eslint-disable @typescript-eslint/no-explicit-any */
export type TPagination = {
  page: number;
  limit: number;
  skip: number;
  nextPage: null | number;
  prevPage: null | number;
};
const pagination = (query: Record<string, string | undefined>): TPagination => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const skip = (page - 1) * limit;
  const nextPage = page + 1;
  const prevPage = page === 1 ? null : page - 1;

  return { page, limit, skip, nextPage, prevPage };
};

const countPages = (total: number, limit: number): number => {
  const value = Math.ceil(total / limit);
  return value;
};

export type TSorting = { [key: string]: string };
const sorting = (query: Record<string, string | undefined>): TSorting => {
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  return { [sortBy]: sortOrder };
};

// field parser start
type PrismaSelectValue = true | { select: PrismaSelect };

type PrismaSelect = Record<string, PrismaSelectValue>;

export type TFields = PrismaSelect | null;

export const parseFields = (fields?: string): TFields => {
  if (!fields) return null;

  const selects = fields
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean)
    .map((field): PrismaSelect => {
      if (field.includes(".")) {
        const parts = field.split(".");

        return parts.reduceRight<PrismaSelect>((acc, part, index) => {
          if (index === parts.length - 1) {
            return { [part]: true };
          }

          return {
            [part]: {
              select: acc,
            },
          };
        }, {});
      }

      return { [field]: true };
    });

  return selects.reduce<PrismaSelect>((acc, curr) => {
    return deepMerge(acc, curr);
  }, {});
};

function deepMerge(target: PrismaSelect, source: PrismaSelect): PrismaSelect {
  const output: PrismaSelect = { ...target };

  for (const key of Object.keys(source)) {
    const targetVal = output[key];
    const sourceVal = source[key];

    const targetIsSelect =
      typeof targetVal === "object" &&
      targetVal !== null &&
      "select" in targetVal;

    const sourceIsSelect =
      typeof sourceVal === "object" &&
      sourceVal !== null &&
      "select" in sourceVal;

    if (targetIsSelect && sourceIsSelect) {
      output[key] = {
        select: deepMerge(targetVal.select, sourceVal.select),
      };
    } else {
      (output[key] as PrismaSelectValue | undefined) = sourceVal;
    }
  }

  return output;
}
// field parser end

export const queryBuilder = { pagination, countPages, sorting, parseFields };
