package vocabulary

import (
	"context"
	"fmt"

	"github.com/quyen/multi-language/backend/internal/platform"
)

type Service struct {
	repo  *Repository
	cache *platform.Cache
}

func NewService(repo *Repository, cache *platform.Cache) *Service {
	return &Service{repo: repo, cache: cache}
}

func (s *Service) List(ctx context.Context, userID string) ([]Item, error) {
	return s.repo.List(ctx, userID)
}

func (s *Service) Save(ctx context.Context, input SaveInput) (Item, error) {
	item, err := s.repo.Save(ctx, input)
	if err != nil {
		return Item{}, err
	}
	s.invalidateDashboard(ctx, input.UserID)
	return item, nil
}

func (s *Service) Delete(ctx context.Context, userID, entryID string) error {
	if err := s.repo.Delete(ctx, userID, entryID); err != nil {
		return err
	}
	s.invalidateDashboard(ctx, userID)
	return nil
}

func (s *Service) invalidateDashboard(ctx context.Context, userID string) {
	_ = s.cache.Delete(ctx, fmt.Sprintf("dashboard:v2:%s:en", userID), fmt.Sprintf("dashboard:v2:%s:vi", userID))
}
