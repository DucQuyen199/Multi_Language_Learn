package vocabulary

type Item struct {
	ID           string `json:"id"`
	EntryID      string `json:"entry_id"`
	Word         string `json:"word"`
	IPA          string `json:"ipa"`
	PartOfSpeech string `json:"part_of_speech"`
	CEFR         string `json:"cefr"`
	Translation  string `json:"translation"`
	Note         string `json:"note"`
	Mastery      float64 `json:"mastery"`
	NextReviewAt string `json:"next_review_at"`
	CreatedAt    string `json:"created_at"`
}

type SaveInput struct {
	UserID  string `json:"user_id"`
	EntryID string `json:"entry_id"`
	Note    string `json:"note"`
}
