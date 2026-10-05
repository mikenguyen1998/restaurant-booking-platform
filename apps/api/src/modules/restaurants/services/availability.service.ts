import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateSlots } from '@restaurant-platform/shared';
import {
  formatDbTime,
  getDayOfWeek,
  toZonedDateTime,
} from '../../../common/utils/date.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { GetRestaurantAvailabilityDto } from '../dto/availability.dto.js';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getRestaurantAvailability(
    id: string,
    { date, slot, partySize }: GetRestaurantAvailabilityDto,
  ) {
    const [restaurant, settings] = await Promise.all([
      this.prisma.restaurant.findUnique({ where: { id } }),
      this.prisma.restaurantBookingSetting.findUnique({
        where: { restaurantId: id },
      }),
    ]);

    if (!settings || !restaurant || restaurant.status !== 'APPROVED') {
      throw new NotFoundException('Restaurant not found');
    }

    const dayOfWeek = getDayOfWeek(date, restaurant.timezone);

    const openingHour = await this.prisma.openingHour.findUnique({
      where: {
        restaurantId_dayOfWeek: { restaurantId: id, dayOfWeek },
      },
    });
    if (!openingHour) {
      return { date, partySize, slots: [] };
    }

    const { openTime, closeTime } = openingHour;
    const slots = generateSlots(
      formatDbTime(openTime),
      formatDbTime(closeTime),
      settings.slotIntervalMinutes,
      settings.bookingDurationMinutes,
    );
    if (!slot) {
      return { date, partySize, slots };
    }
    if (!slots.includes(slot)) {
      throw new BadRequestException('Invalid slot');
    }

    const startsAt = toZonedDateTime(date, slot, restaurant.timezone);
    const endsAt = startsAt.plus({ minutes: settings.bookingDurationMinutes });
    const allocatedUntilAt = endsAt.plus({ minutes: settings.bufferMinutes });

    const [tables, busy] = await Promise.all([
      this.prisma.restaurantResource.findMany({
        where: {
          restaurantId: id,
          status: 'ACTIVE',
          capacity: { gte: partySize },
        },
        orderBy: [{ capacity: 'asc' }, { priority: 'desc' }], // best-fit: bàn nhỏ nhất đủ chỗ
      }),
      this.prisma.bookingResource.findMany({
        where: {
          resource: { restaurantId: id },
          isActive: true,
          allocatedFromAt: { lt: allocatedUntilAt.toJSDate() }, // cũ bắt đầu trước khi mới kết thúc
          allocatedUntilAt: { gt: startsAt.toJSDate() }, // cũ kết thúc sau khi mới bắt đầu
        },
        select: { resourceId: true },
      }),
    ]);

    const busyTableIds = new Set(busy.map((b) => b.resourceId));
    const freeTables = tables.filter((table) => !busyTableIds.has(table.id));
    return { date, partySize, slot, available: freeTables.length > 0 };
  }
}
