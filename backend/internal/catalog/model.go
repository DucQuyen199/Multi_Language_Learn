package catalog

type GrammarTopic struct {
	ID       string `json:"id"`
	Slug     string `json:"slug"`
	Title    string `json:"title"`
	CEFR     string `json:"cefr"`
	Summary  string `json:"summary"`
}

type Course struct {
	ID              string `json:"id"`
	Slug            string `json:"slug"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	CEFR            string `json:"cefr"`
	LessonCount     int    `json:"lesson_count"`
	DurationMinutes int    `json:"duration_minutes"`
}
