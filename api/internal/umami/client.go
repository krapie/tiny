package umami

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"
)

func Send(event string) {
	baseURL := os.Getenv("UMAMI_URL")
	websiteID := os.Getenv("UMAMI_WEBSITE_ID")
	if baseURL == "" || websiteID == "" {
		return
	}
	payload := map[string]any{
		"type": "event",
		"payload": map[string]any{
			"website":  websiteID,
			"hostname": "kevinprk.com",
			"language": "en",
			"url":      "/events",
			"name":     event,
		},
	}
	body, _ := json.Marshal(payload)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/api/send", bytes.NewReader(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	http.DefaultClient.Do(req) //nolint:errcheck
}
