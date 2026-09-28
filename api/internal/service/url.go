package service

import (
	"database/sql"
	"fmt"
	"math/rand/v2"
	"net/url"

	"github.com/krapi/tiny-api/internal/model"
	"github.com/krapi/tiny-api/internal/umami"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

type URLService struct {
	db        *sql.DB
	blocklist *Blocklist
}

func NewURLService(db *sql.DB, blocklist *Blocklist) *URLService {
	return &URLService{db: db, blocklist: blocklist}
}

func (s *URLService) Shorten(originalURL, customCode string) (*model.URL, error) {
	if err := validateURL(originalURL); err != nil {
		return nil, err
	}
	if s.blocklist.Blocked(originalURL) {
		return nil, ErrBlockedDomain
	}

	code := customCode
	if code == "" {
		var err error
		code, err = s.generateUniqueCode()
		if err != nil {
			return nil, err
		}
	} else {
		exists, err := s.codeExists(code)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, fmt.Errorf("code already taken")
		}
	}

	var u model.URL
	err := s.db.QueryRow(
		`INSERT INTO urls (code, original) VALUES ($1, $2)
		 RETURNING id, code, original, clicks, created_at`,
		code, originalURL,
	).Scan(&u.ID, &u.Code, &u.Original, &u.Clicks, &u.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert url: %w", err)
	}
	go umami.Send("url_shortened")
	return &u, nil
}

// GetByCode resolves a code for redirection and counts the click. Links whose
// destination was blocklisted after creation return ErrBlockedDomain uncounted.
func (s *URLService) GetByCode(code string) (*model.URL, error) {
	info, err := s.GetInfoByCode(code)
	if err != nil || info == nil {
		return info, err
	}
	if s.blocklist.Blocked(info.Original) {
		return nil, ErrBlockedDomain
	}

	var u model.URL
	err = s.db.QueryRow(
		`UPDATE urls SET clicks = clicks + 1 WHERE code = $1
		 RETURNING id, code, original, clicks, created_at`,
		code,
	).Scan(&u.ID, &u.Code, &u.Original, &u.Clicks, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get url: %w", err)
	}
	go umami.Send("link_clicked")
	return &u, nil
}

func (s *URLService) GetInfoByCode(code string) (*model.URL, error) {
	var u model.URL
	err := s.db.QueryRow(
		`SELECT id, code, original, clicks, created_at FROM urls WHERE code = $1`,
		code,
	).Scan(&u.ID, &u.Code, &u.Original, &u.Clicks, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get url info: %w", err)
	}
	return &u, nil
}

func (s *URLService) generateUniqueCode() (string, error) {
	for range 10 {
		code := randomCode(6)
		exists, err := s.codeExists(code)
		if err != nil {
			return "", err
		}
		if !exists {
			return code, nil
		}
	}
	return "", fmt.Errorf("failed to generate unique code")
}

func (s *URLService) codeExists(code string) (bool, error) {
	var n int
	err := s.db.QueryRow(`SELECT COUNT(1) FROM urls WHERE code = $1`, code).Scan(&n)
	return n > 0, err
}

func randomCode(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = charset[rand.IntN(len(charset))]
	}
	return string(b)
}

func validateURL(raw string) error {
	u, err := url.ParseRequestURI(raw)
	if err != nil {
		return fmt.Errorf("invalid URL")
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return fmt.Errorf("URL must start with http or https")
	}
	return nil
}
