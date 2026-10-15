/** Worker ports only: no queue, cron, delivery or database write is implemented. */
export type JobName =
  | 'booking.complete-arrived'
  | 'booking.alert-owner'
  | 'notification.deliver'
  | 'search.index-restaurant';
export interface JobEnvelope<T = unknown> {
  id: string;
  name: JobName;
  payload: T;
  createdAt: string;
}
export abstract class JobHandler<T> {
  abstract execute(job: JobEnvelope<T>): Promise<void>;
}
export abstract class JobPublisher {
  abstract publish<T>(job: JobEnvelope<T>): Promise<void>;
}
