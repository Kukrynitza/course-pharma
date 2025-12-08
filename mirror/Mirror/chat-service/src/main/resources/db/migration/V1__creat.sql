CREATE TABLE if not exists chats
(
    id
    BIGSERIAL
    PRIMARY
    KEY,
    user_id
    BIGINT
    NOT
    NULL,
    title
    VARCHAR
(
    255
) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE if not exists llm_request_history
(
    id
    BIGSERIAL
    PRIMARY
    KEY,
    request_time
    TIMESTAMP
    NOT
    NULL
    DEFAULT
    CURRENT_TIMESTAMP,
    response
    TEXT
    NOT
    NULL,
    prompt
    TEXT
    NOT
    NULL,
    image_url
    VARCHAR
(
    255
),
    chat_id BIGINT NOT NULL,
    CONSTRAINT fk_chat FOREIGN KEY
(
    chat_id
) REFERENCES chats
(
    id
) ON DELETE CASCADE
    );

CREATE TABLE if not exists medical_cards
(
    userid
    integer
    NOT
    NULL,
    id
    SERIAL
    PRIMARY
    KEY,
    date_of_diagnosis
    TIMESTAMP
    NOT
    NULL
    DEFAULT
    CURRENT_TIMESTAMP,
    diseas
    TEXT,
    description
    TEXT,
    possibility
    integer
    check
(
    possibility>
    0
)

    );
CREATE INDEX idx_medical_cards_user_id ON medical_cards (userId);