package service

import "testing"

func TestBlocklist(t *testing.T) {
	b := NewBlocklist("multiserviciosrl.cl, PaiHousingDev.com.\nexample.org")
	cases := map[string]bool{
		"https://www.multiserviciosrl.cl/gopl/pl/let/": true,
		"https://multiserviciosrl.cl":                  true,
		"http://paihousingdev.com/artifacts/a/let/":    true,
		"https://a.b.example.org:8443/x":               true,
		"https://notmultiserviciosrl.cl/":              false,
		"https://example.org.evil.com/":                false,
		"https://naver.com":                            false,
		"not a url":                                    false,
	}
	for in, want := range cases {
		if got := b.Blocked(in); got != want {
			t.Errorf("Blocked(%q) = %v, want %v", in, got, want)
		}
	}
	if NewBlocklist("").Blocked("https://anything.com") {
		t.Error("empty blocklist must not block")
	}
}
