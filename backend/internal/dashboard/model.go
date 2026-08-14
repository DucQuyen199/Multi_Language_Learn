package dashboard

type Summary struct {
	Greeting       string  `json:"greeting"`
	TargetLanguage string  `json:"target_language"`
	DailyXP        int     `json:"daily_xp"`
	DailyGoal      int     `json:"daily_goal"`
	StreakDays     int     `json:"streak_days"`
	StudyMinutes   int     `json:"study_minutes"`
	WordsLearned   int     `json:"words_learned"`
	DueReviews     int     `json:"due_reviews"`
	CurrentLevel   string  `json:"current_level"`
	LevelProgress  int     `json:"level_progress"`
	Skills         Skills  `json:"skills"`
}

type Skills struct {
	Listening int `json:"listening"`
	Speaking  int `json:"speaking"`
	Reading   int `json:"reading"`
	Writing   int `json:"writing"`
}
