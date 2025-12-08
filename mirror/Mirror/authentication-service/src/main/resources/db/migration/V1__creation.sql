CREATE  TABLE if not exists authentication_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO authentication_users (username, password, active, created_at, updated_at)
VALUES (
    'testuser',
    '$2a$10$XURPShZkgW/0fWv5tOKbH.5Qeb1bJ6lrz4uO7N./8rA8b3WqS3z.S', -- BCrypt-хеш для 'testpass'
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);