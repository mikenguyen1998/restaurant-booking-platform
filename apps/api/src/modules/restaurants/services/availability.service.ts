import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service.js";
import { GetRestaurantAvailabilityDto } from "../dto/availability.dto.js";

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}


  async getRestaurantAvailability(
    id: string,
    { date, slot, partySize, preference }: GetRestaurantAvailabilityDto,
  ) {
    const availabilityData = await this.prisma.restaurant.findMany({
      where: {
        id: id,
        date,
        slot,
        partySize,
        preference,
      },
    });

    const totalItems = await this.prisma.restaurant.count({
      where: {
        id: id,
        date,
        slot,
        partySize,
        preference,
      },
    });

    return {
      data: availabilityData,
      meta: {
        totalItems,
        itemCount: availabilityData.length,
      },
    };
  }
}