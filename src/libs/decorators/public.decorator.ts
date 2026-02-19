/** biome-ignore-all lint/style/useNamingConvention: Bypass naming convention for decorator */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IS_PUBLIC_KEY, true);
