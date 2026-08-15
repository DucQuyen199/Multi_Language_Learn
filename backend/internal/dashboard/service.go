package dashboard

import (
	"context"
	"fmt"
	"time"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/platform"
)

type Service struct {
	repo      *Repository
	cache     *platform.Cache
	cacheTTL  time.Duration
}

func NewService(repo *Repository, cache *platform.Cache, cacheTTL time.Duration) *Service {
	return &Service{repo: repo, cache: cache, cacheTTL: cacheTTL}
}

func (s *Service) Summary(ctx context.Context, userID, language string) (Summary, error) {
	key := fmt.Sprintf("dashboard:v2:%s:%s", userID, language)
	var cached Summary
	if err := s.cache.GetJSON(ctx, key, &cached); err == nil {
		return cached, nil
	}
	summary, err := s.repo.Summary(ctx, userID, language)
	if err != nil {
		return Summary{}, err
	}
	_ = s.cache.SetJSON(ctx, key, summary, s.cacheTTL)
	return summary, nil
}
