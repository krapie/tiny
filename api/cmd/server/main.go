package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	appdb "github.com/krapi/tiny-api/internal/db"
	"github.com/krapi/tiny-api/internal/handler"
	"github.com/krapi/tiny-api/internal/service"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	_ = godotenv.Load()

	db, err := appdb.Connect()
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer db.Close()

	prometheus.MustRegister(prometheus.NewGaugeFunc(
		prometheus.GaugeOpts{
			Name: "tiny_urls_total",
			Help: "Total number of shortened URLs created",
		},
		func() float64 {
			var n float64
			db.QueryRow("SELECT COUNT(*) FROM urls").Scan(&n)
			return n
		},
	))

	urlSvc := service.NewURLService(db)
	urlH := handler.NewURLHandler(urlSvc)

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(corsMiddleware)

	r.Handle("/metrics", promhttp.Handler())

	r.Post("/api/shorten", urlH.Shorten)
	r.Get("/api/urls/{code}", urlH.GetInfo)
	r.Get("/api/redirect/{code}", urlH.RedirectInfo)
	r.Get("/api/qr/{code}", urlH.QRCode)
	r.Get("/{code}", urlH.Redirect)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("tiny-api listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "http://localhost:3000"
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
