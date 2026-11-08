/*
# Add 'land' to property_type CHECK constraint

## Changes
- Modifies the `properties` table to allow 'land' as a valid `property_type` value.
- This enables listing vacant land for sale or rent alongside houses, apartments, condos, townhouses, villas, and lofts.

## Security
- No security changes. Only a constraint relaxation.
- Existing RLS policies and grants remain unchanged.

## Important Notes
- The constraint is dropped and recreated with the expanded value list.
- No data is modified or lost — existing rows all satisfy the new constraint.
*/

ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_property_type_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_property_type_check
  CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'villa', 'loft', 'land'));
