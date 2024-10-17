import { z } from "zod";

const DnD5eAbilities = z.enum(["str", "dex", "con", "int", "wis", "cha"]);
const DnD5eSkills = z.enum([
  "acr",
  "ani",
  "arc",
  "ath",
  "dec",
  "his",
  "ins",
  "inv",
  "itm",
  "med",
  "nat",
  "per",
  "prc",
  "prf",
  "rel",
  "slt",
  "ste",
  "sur",
]);

export const DnD5ECharacterGameDataSchema = z.object({
  skills: z.record(DnD5eSkills, z.object({ ability: DnD5eAbilities, is_proficient: z.boolean().nullable() })).optional(),
  currency: z.object({
    cp: z.number(),
    sp: z.number(),
    ep: z.number(),
    gp: z.number(),
    pp: z.number(),
  }),
  items: z
    .object({
      class: z.object({ id: z.string(), title: z.string() }).optional(),
    })
    .optional(),
  abilities: z.record(DnD5eAbilities, z.object({ value: z.number().nullable(), is_proficient: z.boolean() })).optional(),
});
