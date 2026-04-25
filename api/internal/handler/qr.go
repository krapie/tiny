package handler

import (
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	qrcode "github.com/skip2/go-qrcode"
)

func (h *URLHandler) QRCode(w http.ResponseWriter, r *http.Request) {
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
	shortURL := baseURL + "/" + code

	png, err := qrcode.Encode(shortURL, qrcode.Medium, 256)
	if err != nil {
		http.Error(w, "qr generation failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "image/png")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	w.Write(png)
}
