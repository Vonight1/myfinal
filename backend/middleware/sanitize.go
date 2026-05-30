package middleware

import (
	"html"
	"regexp"
	"strings"
)

// scriptTagRegex - ກວດສອບ <script>...</script>
var scriptTagRegex = regexp.MustCompile(`(?is)<script.*?>.*?</script>`)

// htmlTagRegex - ກວດສອບ HTML tags ທັງໝົດ
var htmlTagRegex = regexp.MustCompile(`<[^>]+>`)

// eventHandlerRegex - ກວດສອບ onClick, onError, ແລະອື່ນໆ
var eventHandlerRegex = regexp.MustCompile(`(?i)on\w+\s*=\s*["']?[^"'>]*["']?`)

// SanitizeText - ລ້າງ XSS ສຳລັບ plain text (ບໍ່ມີ HTML)
// ໃຊ້ສຳລັບ: title, name, comment, message
func SanitizeText(input string) string {
	if input == "" {
		return ""
	}
	// 1. ລົບ <script> tags
	input = scriptTagRegex.ReplaceAllString(input, "")
	// 2. ລົບ event handlers (onclick, onerror, etc.)
	input = eventHandlerRegex.ReplaceAllString(input, "")
	// 3. ລົບ HTML tags ທັງໝົດ
	input = htmlTagRegex.ReplaceAllString(input, "")
	// 4. Escape HTML entities (&, <, >, ", ')
	input = html.EscapeString(input)
	// 5. ຕັດຊ່ອງຫວ່າງເກີນ
	return strings.TrimSpace(input)
}

// SanitizeRichText - ລ້າງ XSS ສຳລັບ rich text (ອະນຸຍາດ basic HTML)
// ໃຊ້ສຳລັບ: description (ມີ \n, *, ແລະ format ງ່າຍໆ)
// ໝາຍເຫດ: project ນີ້ບໍ່ໄດ້ໃຊ້ rich editor ສະນັ້ນໃຊ້ SanitizeText ໄດ້
func SanitizeRichText(input string) string {
	if input == "" {
		return ""
	}
	// ລົບ script ແລະ event handlers
	input = scriptTagRegex.ReplaceAllString(input, "")
	input = eventHandlerRegex.ReplaceAllString(input, "")
	// Escape HTML
	input = html.EscapeString(input)
	return strings.TrimSpace(input)
}
