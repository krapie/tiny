package db

import (
	"net/url"
	"strings"
	"testing"
)

func TestWithTimeoutsURL(t *testing.T) {
	got := withTimeouts("postgres://u:p@host:5432/app?sslmode=disable")
	u, err := url.Parse(got)
	if err != nil {
		t.Fatal(err)
	}
	q := u.Query()
	if q.Get("connect_timeout") != "5" || q.Get("statement_timeout") != "10000" || q.Get("sslmode") != "disable" {
		t.Fatalf("got %q", got)
	}
}

func TestWithTimeoutsKeepsExplicitValues(t *testing.T) {
	got := withTimeouts("postgres://u:p@host/app?statement_timeout=500")
	if !strings.Contains(got, "statement_timeout=500") || strings.Contains(got, "statement_timeout=10000") {
		t.Fatalf("explicit statement_timeout overridden: %q", got)
	}
	kv := withTimeouts("host=db user=u connect_timeout=2")
	if strings.Count(kv, "connect_timeout=") != 1 || !strings.Contains(kv, "statement_timeout=10000") {
		t.Fatalf("key=value form: %q", kv)
	}
}
