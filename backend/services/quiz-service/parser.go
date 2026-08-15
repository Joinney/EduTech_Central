package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/nguyenthenguyen/docx"
)

// Tải file docx từ Cloudinary về file tạm và bóc tách câu hỏi
func ParseDocxQuestionsFromURL(fileURL string) ([]QuestionItem, error) {
	resp, err := http.Get(fileURL)
	if err != nil {
		return nil, fmt.Errorf("không thể tải file từ Cloudinary: %v", err)
	}
	defer resp.Body.Close()

	tmpFile, err := os.CreateTemp("", "exam_*.docx")
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmpFile.Name())

	if _, err := io.Copy(tmpFile, resp.Body); err != nil {
		return nil, err
	}
	tmpFile.Close()

	r, err := docx.ReadDocxFile(tmpFile.Name())
	if err != nil {
		return nil, fmt.Errorf("không thể đọc cấu trúc docx: %v", err)
	}
	defer r.Close()

	// 1. Lấy nội dung XML từ file Word
	xmlContent := r.Editable().GetContent()

	// 2. Chuyển đổi thẻ đóng paragraph và table row thành ký tự xuống dòng
	xmlContent = strings.ReplaceAll(xmlContent, "</w:p>", "\n")
	xmlContent = strings.ReplaceAll(xmlContent, "</w:tr>", "\n")

	// 3. Xóa toàn bộ thẻ XML <...>
	reTag := regexp.MustCompile(`<[^>]*>`)
	plainText := reTag.ReplaceAllString(xmlContent, "")

	// 4. Giải mã các ký tự entity
	plainText = strings.ReplaceAll(plainText, "&lt;", "<")
	plainText = strings.ReplaceAll(plainText, "&gt;", ">")
	plainText = strings.ReplaceAll(plainText, "&amp;", "&")
	plainText = strings.ReplaceAll(plainText, "&quot;", "\"")
	plainText = strings.ReplaceAll(plainText, "&#160;", " ")

	return extractQuestionsFromText(plainText), nil
}

// Bóc tách text câu hỏi theo format:
// Câu 1: Nội dung...
// A. *Đáp án đúng  B. Đáp án 2  C. Đáp án 3  D. Đáp án 4
func extractQuestionsFromText(text string) []QuestionItem {
	lines := strings.Split(text, "\n")
	var questions []QuestionItem

	qRegex := regexp.MustCompile(`(?i)^(câu\s*\d+|bài\s*\d+)[\:\.]\s*(.+)`)
	optRegex := regexp.MustCompile(`(?i)([A-D])[\.\)]\s*([^\n\r]+)`)

	var currentQ *QuestionItem

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		if qRegex.MatchString(line) {
			if currentQ != nil && len(currentQ.Options) > 0 {
				questions = append(questions, *currentQ)
			}
			currentQ = &QuestionItem{
				QuestionID: len(questions) + 1,
				Question:   line,
				Options:    []string{},
				CorrectAns: 0,
				Points:     1.0,
			}
		} else if currentQ != nil {
			matches := optRegex.FindAllStringSubmatch(line, -1)
			if len(matches) > 0 {
				for _, m := range matches {
					optLetter := m[1]
					rawText := strings.TrimSpace(m[2])

					// Nhận diện đáp án đúng khi có dấu * hoặc [x]
					isCorrect := strings.Contains(rawText, "*") || strings.Contains(rawText, "[x]") || strings.Contains(rawText, "[X]")
					cleanText := strings.ReplaceAll(rawText, "*", "")
					cleanText = strings.ReplaceAll(cleanText, "[x]", "")
					cleanText = strings.ReplaceAll(cleanText, "[X]", "")
					cleanText = strings.TrimSpace(cleanText)

					if isCorrect {
						currentQ.CorrectAns = len(currentQ.Options)
					}
					currentQ.Options = append(currentQ.Options, optLetter+". "+cleanText)
				}
			} else if len(currentQ.Options) == 0 {
				currentQ.Question += " " + line
			}
		}
	}

	if currentQ != nil && len(currentQ.Options) > 0 {
		questions = append(questions, *currentQ)
	}

	return questions
}