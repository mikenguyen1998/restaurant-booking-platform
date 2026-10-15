import Link from 'next/link';
import { EmptyState, PageHeading, PendingNotice } from '@/components/shared/ui';

export function PendingWorkspace({
  title,
  description,
  columns,
  action,
  actionHref,
}: {
  title: string;
  description: string;
  columns: string[];
  action?: string;
  actionHref?: string;
}) {
  return (
    <>
      <PageHeading title={title} description={description}>
        {action &&
          (actionHref ? (
            <Link className="button" href={actionHref}>
              {action} ↗
            </Link>
          ) : (
            <button className="button" disabled>
              {action}
            </button>
          ))}
      </PageHeading>
      <PendingNotice />
      <section className="panel data-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    title="Chưa có dữ liệu để hiển thị"
                    description="Tính năng này đang được hoàn thiện. Không có thao tác nào được lưu hoặc gửi đi từ trang này."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
