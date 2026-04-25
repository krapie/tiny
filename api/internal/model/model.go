package model

import "time"

type URL struct {
	ID        string    `json:"id"`
	Code      string    `json:"code"`
	Original  string    `json:"original_url"`
	Clicks    int64     `json:"clicks"`
	CreatedAt time.Time `json:"created_at"`
}

type ShortenRequest struct {
	URL  string `json:"url"`
	Code string `json:"code,omitempty"`
}
