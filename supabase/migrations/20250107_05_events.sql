-- Events 테이블 생성 (캘린더 이벤트)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,

  -- 일정
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'Asia/Seoul',

  -- 이벤트 타입
  type TEXT DEFAULT 'event'
    CHECK (type IN ('event', 'meeting', 'task', 'milestone', 'reminder', 'holiday')),

  -- 상태
  status TEXT DEFAULT 'confirmed'
    CHECK (status IN ('tentative', 'confirmed', 'cancelled')),

  -- 색상 및 스타일
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,

  -- 반복 설정 (RRULE 형식 또는 커스텀 JSON)
  recurrence JSONB,
  recurrence_end DATE,
  recurrence_exceptions DATE[],

  -- 알림 설정
  reminders JSONB DEFAULT '[]',

  -- 참석자
  attendees JSONB DEFAULT '[]',

  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  is_private BOOLEAN DEFAULT false,
  is_busy BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 시간 중복 방지 (같은 사용자의 동일 시간 이벤트 방지)
  CONSTRAINT no_overlapping_events EXCLUDE USING gist (
    user_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status != 'cancelled')
);

-- RLS 활성화
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 이벤트만 관리 가능
CREATE POLICY "Users can manage own events"
  ON events FOR ALL
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 복합 인덱스: 캘린더 뷰 최적화
CREATE INDEX IF NOT EXISTS idx_events_calendar_view
  ON events(user_id, start_time, end_time)
  WHERE status != 'cancelled';

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 이벤트 시간 유효성 검증
CREATE OR REPLACE FUNCTION validate_event_times()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'Event end time must be after start time';
  END IF;

  IF NEW.all_day = true THEN
    -- 종일 이벤트는 시작과 끝을 자정으로 설정
    NEW.start_time = date_trunc('day', NEW.start_time);
    NEW.end_time = date_trunc('day', NEW.end_time) + interval '1 day' - interval '1 second';
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_event_times_before_insert_update
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION validate_event_times();