package db

import (
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

// Client limits (docs/architecture/architecture.md, "Database clients"): a connection attempt gives up after 5 s and a
// statement after 10 s, so a stuck database fails the request instead of holding a pool slot for ever.
const (
	connectTimeoutSeconds = 5
	statementTimeoutMs    = 10000
)

// withTimeouts adds connect_timeout and statement_timeout to a URL or key=value DSN unless it already sets them.
func withTimeouts(dsn string) string {
	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		u, err := url.Parse(dsn)
		if err != nil {
			return dsn
		}
		q := u.Query()
		if q.Get("connect_timeout") == "" {
			q.Set("connect_timeout", fmt.Sprint(connectTimeoutSeconds))
		}
		if q.Get("statement_timeout") == "" {
			q.Set("statement_timeout", fmt.Sprint(statementTimeoutMs))
		}
		u.RawQuery = q.Encode()
		return u.String()
	}
	if !strings.Contains(dsn, "connect_timeout=") {
		dsn += fmt.Sprintf(" connect_timeout=%d", connectTimeoutSeconds)
	}
	if !strings.Contains(dsn, "statement_timeout=") {
		dsn += fmt.Sprintf(" statement_timeout=%d", statementTimeoutMs)
	}
	return dsn
}

func Connect() (*sql.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL not set")
	}
	db, err := sql.Open("postgres", withTimeouts(dsn))
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("db ping: %w", err)
	}
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)
	return db, nil
}
