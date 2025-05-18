CREATE TYPE mood_enum AS ENUM ('awesome', 'good', 'okay', 'bad', 'terrible');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'others');

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    fullname VARCHAR,
    telegram_id BIGINT UNIQUE,
    interest VARCHAR,
    gender gender_enum,
    birthday DATE,
    user_image_url TEXT, 
    last_login TIMESTAMP,
    logged_in_today BOOLEAN DEFAULT FALSE,
    streak_counter INT DEFAULT 0
);

CREATE TABLE daily_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME WITH TIME ZONE DEFAULT (CURRENT_TIME AT TIME ZONE 'Asia/Jakarta'),
    day_description TEXT NOT NULL,
    mood mood_enum
);

CREATE TABLE llm_responses (
    response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID REFERENCES daily_logs(log_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    insight TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE telegram_logs (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    timestamp_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rewards (
    reward_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    image_url TEXT NOT NULL,
    required_streak INT NOT NULL CHECK (required_streak >= 0)
);


CREATE OR REPLACE FUNCTION update_streak_on_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_login::date = CURRENT_DATE THEN
        RETURN NEW;
    END IF;

    IF OLD.last_login::date = CURRENT_DATE - INTERVAL '1 day' THEN
        NEW.streak_counter := OLD.streak_counter + 1;
    ELSE
        NEW.streak_counter := 1;
    END IF;

    NEW.logged_in_today := TRUE;
    NEW.last_login := CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_update_streak
BEFORE UPDATE OF last_login ON users
FOR EACH ROW
WHEN (NEW.last_login IS DISTINCT FROM OLD.last_login)
EXECUTE FUNCTION update_streak_on_login();

CREATE OR REPLACE FUNCTION get_users_with_birthday_today()
RETURNS TABLE(user_id UUID, fullname VARCHAR, telegram_id BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT u.user_id, u.fullname, u.telegram_id
    FROM users u
    WHERE
        u.birthday IS NOT NULL AND
        u.telegram_id IS NOT NULL AND
        EXTRACT(MONTH FROM u.birthday) = EXTRACT(MONTH FROM CURRENT_DATE) AND
        EXTRACT(DAY FROM u.birthday) = EXTRACT(DAY FROM CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;
