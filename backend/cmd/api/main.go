package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/config"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/httpapi"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/platform"
)

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	db, err := platform.OpenDatabase(cfg.DatabaseURL)
	if err != nil {
		logger.Error("open database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	cache, err := platform.NewCache(cfg.RedisURL)
	if err != nil {
		logger.Error("open redis", "error", err)
		os.Exit(1)
	}
	defer cache.Close()

	server := &http.Server{
		Addr:              cfg.Addr,
		Handler:           httpapi.NewServer(cfg, db, cache, logger).Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      20 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		logger.Info("api_started", "addr", cfg.Addr, "environment", cfg.Environment)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("http server stopped", "error", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		logger.Error("shutdown api", "error", err)
	}
}
