import Link from 'next/link';
import { RestaurantList } from '@/features/restaurants/restaurant-list';

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot" /> Gặp nhau ở Hà Nội
            </p>
            <h1>
              Một bàn ăn.
              <br />
              Nhiều <em>câu chuyện.</em>
            </h1>
            <p className="hero-description">
              Từ bữa tối thân quen đến một dịp thật đặc biệt.
              <br />
              Tìm một nơi vừa ý, dành thời gian cho nhau.
            </p>
            <form action="/restaurants" className="hero-search">
              <label>
                <span className="small-label">Bạn muốn ăn gì?</span>
                <input
                  name="name"
                  placeholder="Tên nhà hàng, món ngon…"
                  aria-label="Tìm tên nhà hàng"
                />
              </label>
              <button className="button" type="submit">
                Khám phá <span aria-hidden="true">↗</span>
              </button>
            </form>
            <div className="hero-hints">
              <span>Hà Nội, Việt Nam</span>
              <span className="hint-divider" />
              <span>Bắt đầu một cuộc hẹn ngon</span>
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="Minh họa một bàn ăn được chuẩn bị cho cuộc hẹn"
          >
            <div className="visual-grid" />
            <span className="visual-caption">A PLACE AT THE TABLE</span>
            <div className="table-scene">
              <span className="chair chair-top" />
              <span className="chair chair-bottom" />
              <span className="chair chair-left" />
              <span className="chair chair-right" />
              <div className="dining-table">
                <div className="table-ring" />
                <div className="scene-plate plate-one" />
                <div className="scene-plate plate-two" />
                <div className="scene-plate plate-three" />
                <div className="scene-plate plate-four" />
                <div className="table-flower">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
            <div className="visual-note">
              <span className="note-symbol">✳</span>
              <div>
                <strong>
                  Mọi cuộc hẹn đều bắt đầu
                  <br />
                  từ một chiếc bàn.
                </strong>
                <span>Hà Nội · Một bữa thật vui</span>
              </div>
            </div>
            <span className="visual-index">01 / HANOI DINING</span>
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Một thành phố, nhiều hương vị</p>
            <h2>Hôm nay, ăn gì?</h2>
          </div>
          <Link className="text-link" href="/restaurants">
            Xem tất cả nhà hàng <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="cuisine-grid">
          {[
            {
              name: 'Hương vị Việt',
              slug: 'vietnamese',
              symbol: '◉',
              note: 'Thân quen mà luôn mới',
            },
            {
              name: 'Ẩm thực Nhật',
              slug: 'japanese',
              symbol: '◒',
              note: 'Tinh tế trong từng vị',
            },
            {
              name: 'Một bữa cùng nhau',
              slug: '',
              symbol: '✳',
              note: 'Một nơi cho mọi cuộc hẹn',
            },
          ].map((item) => (
            <Link
              className="cuisine-card"
              key={item.name}
              href={
                item.slug ? `/restaurants?cuisine=${item.slug}` : '/restaurants'
              }
            >
              <span className="cuisine-symbol" aria-hidden="true">
                {item.symbol}
              </span>
              <div>
                <h3>{item.name}</h3>
                <p>{item.note}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container section featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Những nơi để hẹn nhau</p>
            <h2>Khám phá nhà hàng</h2>
          </div>
          <span className="small-text">Một lựa chọn vừa ý cho mỗi dịp</span>
        </div>
        <RestaurantList limit={3} />
      </section>
      <section className="container">
        <div className="owner-callout">
          <div>
            <p className="eyebrow">Dành cho chủ nhà hàng</p>
            <h2>
              Chăm chút từng bàn ăn.
              <br />
              <em>Đón thêm những cuộc hẹn.</em>
            </h2>
          </div>
          <div>
            <p>
              Một không gian để quản lý nhà hàng,
              <br />
              lịch đặt chỗ và trải nghiệm thực khách.
            </p>
            <Link className="button light" href="/owner">
              Khám phá không gian nhà hàng <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
