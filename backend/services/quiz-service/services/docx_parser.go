package services

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
)

func ParseDocxQuestionsFromURL(fileURL string) ([]QuestionItem, error) {
	req, err := http.NewRequest("GET", fileURL, nil)
	if err != nil {
		return nil, fmt.Errorf("URL file không hợp lệ: %v", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("không thể tải file từ URL: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("máy chủ lưu trữ trả về lỗi (HTTP %d): %s", resp.StatusCode, string(body))
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("lỗi đọc nội dung file: %v", err)
	}

	if len(data) == 0 {
		return nil, fmt.Errorf("file tải về bị rỗng (0 bytes)")
	}

	zipReader, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil {
		return nil, fmt.Errorf("tệp không đúng định dạng .docx chuẩn (OpenXML zip): %v", err)
	}

	var documentXMLFile *zip.File
	for _, f := range zipReader.File {
		name := strings.ToLower(f.Name)
		if name == "word/document.xml" || strings.HasSuffix(name, "document.xml") {
			documentXMLFile = f
			break
		}
	}

	if documentXMLFile == nil {
		return nil, fmt.Errorf("không tìm thấy file word/document.xml bên trong cấu trúc docx")
	}

	rc, err := documentXMLFile.Open()
	if err != nil {
		return nil, fmt.Errorf("không thể mở document.xml: %v", err)
	}
	defer rc.Close()

	xmlBytes, err := io.ReadAll(rc)
	if err != nil {
		return nil, fmt.Errorf("lỗi đọc dữ liệu XML: %v", err)
	}

	xmlContent := string(xmlBytes)
	xmlContent = strings.ReplaceAll(xmlContent, "</w:p>", "\n")
	xmlContent = strings.ReplaceAll(xmlContent, "</w:tr>", "\n")
	xmlContent = strings.ReplaceAll(xmlContent, "<w:br/>", "\n")
	xmlContent = strings.ReplaceAll(xmlContent, "<w:cr/>", "\n")

	reTag := regexp.MustCompile(`<[^>]*>`)
	plainText := reTag.ReplaceAllString(xmlContent, "")

	plainText = strings.ReplaceAll(plainText, "&lt;", "<")
	plainText = strings.ReplaceAll(plainText, "&gt;", ">")
	plainText = strings.ReplaceAll(plainText, "&amp;", "&")
	plainText = strings.ReplaceAll(plainText, "&quot;", "\"")
	plainText = strings.ReplaceAll(plainText, "&apos;", "'")
	plainText = strings.ReplaceAll(plainText, "&#160;", " ")
	plainText = strings.ReplaceAll(plainText, "&nbsp;", " ")

	return extractQuestionsFromText(plainText), nil
}

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
					optLetter := strings.ToUpper(m[1])
					rawText := strings.TrimSpace(m[2])

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