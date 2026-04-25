package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/krapi/tiny-api/internal/model"
	"github.com/krapi/tiny-api/internal/service"
)

type URLHandler struct {
	svc *service.URLService
}

func NewURLHandler(svc *service.URLService) *URLHandler {
	return &URLHandler{svc: svc}
}

func (h *URLHandler) Shorten(w http.ResponseWriter, r *http.Request) {
	var req model.ShortenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	req.URL = strings.TrimSpace(req.URL)
	if req.URL == "" {
		http.Error(w, "url is required", http.StatusBadRequest)
		return
	}

	u, err := h.svc.Shorten(req.URL, strings.TrimSpace(req.Code))
	if err != nil {
		if err.Error() == "code already taken" || err.Error() == "invalid URL" || strings.HasPrefix(err.Error(), "URL must") {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	baseURL := os.Getenv("BASE_URL")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"code":         u.Code,
		"short_url":    baseURL + "/" + u.Code,
		"original_url": u.Original,
		"clicks":       u.Clicks,
		"created_at":   u.CreatedAt,
	})
}

func (h *URLHandler) GetInfo(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	u, err := h.svc.GetInfoByCode(code)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if u == nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	baseURL := os.Getenv("BASE_URL")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"code":         u.Code,
		"short_url":    baseURL + "/" + u.Code,
		"original_url": u.Original,
		"clicks":       u.Clicks,
		"created_at":   u.CreatedAt,
	})
}

func (h *URLHandler) Redirect(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	u, err := h.svc.GetByCode(code)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if u == nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	http.Redirect(w, r, u.Original, http.StatusFound)
}

// RedirectInfo increments click count and returns the original URL as JSON.
// Used by the Next.js frontend to perform server-side redirects.
func (h *URLHandler) RedirectInfo(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	u, err := h.svc.GetByCode(code)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if u == nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"original_url": u.Original})
}
