package service

import (
	"errors"
	"net/url"
	"os"
	"strings"
)

// ErrBlockedDomain is returned when the destination host is on the blocklist.
var ErrBlockedDomain = errors.New("URL domain is blocked")

// Blocklist holds destination domains that may not be shortened or redirected to.
// A domain also matches all of its subdomains.
type Blocklist struct {
	domains []string
}

// NewBlocklistFromEnv reads TINY_BLOCKED_DOMAINS (comma or newline separated).
func NewBlocklistFromEnv() *Blocklist {
	return NewBlocklist(os.Getenv("TINY_BLOCKED_DOMAINS"))
}

func NewBlocklist(raw string) *Blocklist {
	b := &Blocklist{}
	for _, d := range strings.FieldsFunc(raw, func(r rune) bool { return r == ',' || r == '\n' || r == ' ' }) {
		d = strings.Trim(strings.ToLower(d), ".")
		if d != "" {
			b.domains = append(b.domains, d)
		}
	}
	return b
}

// Blocked reports whether rawURL points at a blocked domain or one of its subdomains.
func (b *Blocklist) Blocked(rawURL string) bool {
	u, err := url.Parse(rawURL)
	if err != nil {
		return false
	}
	host := strings.Trim(strings.ToLower(u.Hostname()), ".")
	for _, d := range b.domains {
		if host == d || strings.HasSuffix(host, "."+d) {
			return true
		}
	}
	return false
}
