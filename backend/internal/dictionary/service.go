package dictionary

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/quyen/multi-language/backend/internal/platform"
)

var ErrNotFound = errors.New("dictionary entry not found")

type Service struct {
	repo       *Repository
	cache      *platform.Cache
	cacheTTL   time.Duration
}

func NewService(repo *Repository, cache *platform.Cache, cacheTTL time.Duration) *Service {
	return &Service{repo: repo, cache: cache, cacheTTL: cacheTTL}
}

func (s *Service) Search(ctx context.Context, language, query string) ([]SearchResult, error) {
	language = normalizeLanguage(language)
	query = normalizeQuery(query)
	if query == "" {
		return []SearchResult{}, nil
	}
	key := fmt.Sprintf("dict:v2:%s:%s", language, url.QueryEscape(query))
	var cached []SearchResult
	if err := s.cache.GetJSON(ctx, key, &cached); err == nil {
		return cached, nil
	}
	items, err := s.repo.Search(ctx, language, query, 12)
	if err != nil {
		return nil, err
	}
	_ = s.cache.SetJSON(ctx, key, items, s.cacheTTL)
	return items, nil
}

func (s *Service) Find(ctx context.Context, language, slug string) (Entry, error) {
	language = normalizeLanguage(language)
	slug = strings.Trim(strings.ToLower(slug), "/ ")
	key := fmt.Sprintf("dict-entry:v2:%s:%s", language, slug)
	var cached Entry
	if err := s.cache.GetJSON(ctx, key, &cached); err == nil {
		return cached, nil
	}
	entry, err := s.repo.FindBySlug(ctx, language, slug)
	if err != nil {
		return Entry{}, err
	}
	_ = s.cache.SetJSON(ctx, key, entry, s.cacheTTL*2)
	return entry, nil
}

func normalizeLanguage(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "" {
		return "en"
	}
	return value
}

func normalizeQuery(value string) string {
	return strings.Join(strings.Fields(strings.TrimSpace(value)), " ")
}
