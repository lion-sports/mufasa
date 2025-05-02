import vine from '@vinejs/vine';
import { ROLES } from '#app/Models/Teammate';

export const updatePlayerValidator = vine.compile(
  vine.object({
    aliases: vine.array(vine.string().maxLength(255)).optional(),
    shirtId: vine.number().optional(),
    role: vine.enum(Object.values(ROLES)).optional(),
    shirtNumber: vine.number().optional(),
    shirtPrimaryColor: vine.string().optional(),
    shirtSecondaryColor: vine.string().optional(),
    isOpponent: vine.boolean().optional(),
  })
);
