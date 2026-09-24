-- PROPOSED raw-SQL constraints: Phase 1 review artifact. Not applied anywhere.
--
-- Prisma cannot express these. In Phase 2 they will be appended to the first
-- migration (prisma migrate dev --create-only, then edited). IDs refer to
-- docs/domain/invariants.md.

CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS citext; -- only if T-26 chooses citext for emails

-- ---------------------------------------------------------------------------
-- Booking allocations (core concurrency guarantee)
-- ---------------------------------------------------------------------------

-- B-01: an active resource can never be double-booked.
ALTER TABLE booking_allocations
  ADD CONSTRAINT booking_allocations_no_overlap
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(starts_at, occupied_until, '[)') WITH &&
  ) WHERE (released_at IS NULL);

-- B-02
ALTER TABLE booking_allocations
  ADD CONSTRAINT booking_allocations_window_valid CHECK (starts_at < occupied_until);

-- B-04
CREATE UNIQUE INDEX booking_allocations_active_unique
  ON booking_allocations (booking_id, resource_id) WHERE released_at IS NULL;

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------

ALTER TABLE bookings
  ADD CONSTRAINT bookings_party_size_positive CHECK (party_size >= 1),                -- B-08
  ADD CONSTRAINT bookings_time_order CHECK (starts_at < ends_at),                      -- B-07
  ADD CONSTRAINT bookings_duration_matches
    CHECK (ends_at = starts_at + make_interval(mins => duration_minutes)),             -- B-07
  ADD CONSTRAINT bookings_buffer_non_negative CHECK (buffer_minutes >= 0),
  ADD CONSTRAINT bookings_pending_has_expiry
    CHECK (status <> 'PENDING' OR expires_at IS NOT NULL),                             -- B-18
  ADD CONSTRAINT bookings_fee_pair
    CHECK ((fee_minor IS NULL) = (fee_currency IS NULL));

-- ---------------------------------------------------------------------------
-- Restaurants and configuration
-- ---------------------------------------------------------------------------

ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_latitude_range CHECK (latitude BETWEEN -90 AND 90),     -- R-02
  ADD CONSTRAINT restaurants_longitude_range CHECK (longitude BETWEEN -180 AND 180); -- R-02

ALTER TABLE opening_periods
  ADD CONSTRAINT opening_periods_weekday CHECK (weekday BETWEEN 1 AND 7),
  ADD CONSTRAINT opening_periods_bounds
    CHECK (opens_at >= 0 AND opens_at < closes_at AND closes_at <= 1440),              -- R-03
  ADD CONSTRAINT opening_periods_no_overlap
    EXCLUDE USING gist (
      restaurant_id WITH =,
      weekday WITH =,
      int4range(opens_at, closes_at, '[)') WITH &&
    );                                                                                 -- R-04

ALTER TABLE blackouts
  ADD CONSTRAINT blackouts_time_order CHECK (starts_at < ends_at);                     -- R-05

ALTER TABLE booking_settings
  ADD CONSTRAINT booking_settings_positive CHECK (
    slot_interval_minutes > 0
    AND duration_minutes > 0
    AND buffer_minutes >= 0
    AND cancellation_deadline_minutes >= 0
  ),                                                                                   -- R-06
  ADD CONSTRAINT booking_settings_party_range CHECK (
    min_party_size IS NULL OR max_party_size IS NULL OR min_party_size <= max_party_size
  );

ALTER TABLE resources
  ADD CONSTRAINT resources_capacity_positive CHECK (capacity >= 1),                     -- R-07
  ADD CONSTRAINT resources_fee_pair CHECK ((fee_minor IS NULL) = (fee_currency IS NULL)),
  ADD CONSTRAINT resources_fee_non_negative CHECK (fee_minor IS NULL OR fee_minor >= 0);

ALTER TABLE resource_combinations
  ADD CONSTRAINT resource_combinations_capacity_positive CHECK (capacity >= 1);

ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_price_pair
    CHECK ((price_minor IS NULL) = (price_currency IS NULL)),
  ADD CONSTRAINT menu_items_price_non_negative CHECK (price_minor IS NULL OR price_minor >= 0);

-- R-10: one undecided submission per restaurant.
CREATE UNIQUE INDEX restaurant_submissions_one_open
  ON restaurant_submissions (restaurant_id) WHERE decision IS NULL;

-- R-11: one cover photo per restaurant.
CREATE UNIQUE INDEX restaurant_photos_one_cover
  ON restaurant_photos (restaurant_id) WHERE is_cover;

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------

-- V-05: scale 1..5 assumed pending Q-41.
ALTER TABLE reviews
  ADD CONSTRAINT reviews_rating_range CHECK (
    rating_overall BETWEEN 1 AND 5
    AND rating_food BETWEEN 1 AND 5
    AND rating_service BETWEEN 1 AND 5
    AND rating_atmosphere BETWEEN 1 AND 5
  );

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

-- Case-insensitive email uniqueness (alternative to citext, T-26).
CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));

-- ---------------------------------------------------------------------------
-- Audit log (A-02, optional per T-24): block UPDATE/DELETE at the database level.
-- ---------------------------------------------------------------------------

CREATE FUNCTION audit_logs_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$;

CREATE TRIGGER audit_logs_no_update_delete
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit_logs_immutable();
