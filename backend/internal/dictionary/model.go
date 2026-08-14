package dictionary

type SearchResult struct {
	ID           string `json:"id"`
	LanguageCode string `json:"language_code"`
	Word         string `json:"word"`
	Slug         string `json:"slug"`
	IPA          string `json:"ipa"`
	PartOfSpeech string `json:"part_of_speech"`
	CEFR         string `json:"cefr"`
	Frequency    int    `json:"frequency"`
	Definition   string `json:"definition"`
	Translation  string `json:"translation"`
}

type Meaning struct {
	ID           string   `json:"id"`
	Order        int      `json:"order"`
	Definition   string   `json:"definition"`
	Translations []string `json:"translations"`
	Examples     []Example `json:"examples"`
}

type Example struct {
	ID         string `json:"id"`
	Sentence   string `json:"sentence"`
	Translation string `json:"translation"`
}

type Pronunciation struct {
	Accent string `json:"accent"`
	IPA    string `json:"ipa"`
	Audio  string `json:"audio_url"`
}

type Entry struct {
	ID             string         `json:"id"`
	LanguageCode   string         `json:"language_code"`
	LanguageName   string         `json:"language_name"`
	Word           string         `json:"word"`
	Slug           string         `json:"slug"`
	Lemma          string         `json:"lemma"`
	IPA            string         `json:"ipa"`
	PartOfSpeech   string         `json:"part_of_speech"`
	CEFR           string         `json:"cefr"`
	AcademicLevel  string         `json:"academic_level"`
	Frequency      int            `json:"frequency"`
	Domain         string         `json:"domain"`
	Formality      string         `json:"formality"`
	Meanings       []Meaning      `json:"meanings"`
	Pronunciations []Pronunciation `json:"pronunciations"`
}
