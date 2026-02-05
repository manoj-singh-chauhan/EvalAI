import { Activity } from './activity.model';
import { io } from '../../server'; 
import logger from "../../config/logger";

export class ActivityService {
  static async log(userId: string, data: {
    type: 'SUBMISSION' | 'EVALUATION' | 'PAYMENT' | 'SYSTEM',
    status: 'success' | 'failed' | 'processing' | 'info',
    title: string,
    description: string,
    linkId?: string
  }) {
    try {
      const log = await Activity.create({ userId, ...data });
      io.emit(`activity-update-${userId}`, log);
      return log;
    } catch (err) {
    logger.error({ err, userId }, "Activity log error");
    }
  }

  // static async getAll(userId: string) {
  //   return await Activity.findAll({
  //     where: { userId },
  //     order: [['createdAt', 'DESC']],
  //     limit: 50
  //   });
  // }

  static async getAll(userId: string, page: number = 1, limit: number = 5) {
  const offset = (page - 1) * limit;
  const { count, rows } = await Activity.findAndCountAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: limit,
    offset: offset
  });

  return {
    activities: rows,
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  };
}
}