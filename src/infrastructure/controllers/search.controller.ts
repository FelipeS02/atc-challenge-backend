import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { isValid, toDate } from 'date-fns';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import {
  ClubWithAvailability,
  GetAvailabilityQuery,
} from '../../domain/commands/get-availaiblity.query';

const GetAvailabilitySchema = z.object({
  placeId: z.string(),
  date: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/)
    .refine((date) => isValid(date))
    .transform((date) => toDate(date)),
});

class GetAvailabilityDTO extends createZodDto(GetAvailabilitySchema) {}

@Controller('search')
export class SearchController {
  constructor(private queryBus: QueryBus) {}

  @Get()
  @UsePipes(ZodValidationPipe)
  searchAvailability(
    @Query() query: GetAvailabilityDTO,
  ): Promise<ClubWithAvailability[]> {
    return this.queryBus.execute(
      new GetAvailabilityQuery(query.placeId, query.date),
    );
  }
}
