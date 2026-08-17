package main

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"time"
)

type VNPayHelper struct {
	TmnCode    string
	HashSecret string
	BaseURL    string
	ReturnURL  string
}

func NewVNPayHelper(tmnCode, hashSecret, baseURL, returnURL string) *VNPayHelper {
	return &VNPayHelper{
		TmnCode:    strings.TrimSpace(tmnCode),
		HashSecret: strings.TrimSpace(hashSecret),
		BaseURL:    strings.TrimSpace(baseURL),
		ReturnURL:  strings.TrimSpace(returnURL),
	}
}

// Chuyển tiếng Việt có dấu thành không dấu cho VNPay
func removeAccents(str string) string {
	accents := map[string]*regexp.Regexp{
		"a": regexp.MustCompile(`[àáạảãâầấậẩẫăằắặẳẵ]`),
		"e": regexp.MustCompile(`[èéẹẻẽêềếệểễ]`),
		"i": regexp.MustCompile(`[ìíịỉĩ]`),
		"o": regexp.MustCompile(`[òóọỏõôồốộổỗơờớợởỡ]`),
		"u": regexp.MustCompile(`[ùúụủũưừứựửữ]`),
		"y": regexp.MustCompile(`[ỳýỵỷỹ]`),
		"d": regexp.MustCompile(`[đ]`),
		"A": regexp.MustCompile(`[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]`),
		"E": regexp.MustCompile(`[ÈÉẸẺẼÊỀẾỆỂỄ]`),
		"I": regexp.MustCompile(`[ÌÍỊỈĨ]`),
		"O": regexp.MustCompile(`[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]`),
		"U": regexp.MustCompile(`[ÙÚỤỦŨƯỪỨỰỬỮ]`),
		"Y": regexp.MustCompile(`[ỲÝỴỶỸ]`),
		"D": regexp.MustCompile(`[Đ]`),
	}
	for replace, regex := range accents {
		str = regex.ReplaceAllString(str, replace)
	}
	// Bỏ ký tự đặc biệt, chỉ giữ chữ cái, số và khoảng trắng
	re := regexp.MustCompile(`[^a-zA-Z0-9\s]`)
	str = re.ReplaceAllString(str, "")
	return strings.TrimSpace(str)
}

// Tạo URL thanh toán VNPay Sandbox v2.1.0
func (v *VNPayHelper) CreatePaymentURL(txnRef string, amount float64, orderInfo, ipAddr string) string {
	ictZone := time.FixedZone("Asia/Ho_Chi_Minh", 7*60*60)
	createDate := time.Now().In(ictZone).Format("20060102150405")

	cleanOrderInfo := removeAccents(orderInfo)
	if cleanOrderInfo == "" {
		cleanOrderInfo = "Thanh toan khoa hoc EduTech"
	}

	cleanIP := ipAddr
	if cleanIP == "" || cleanIP == "::1" || cleanIP == "127.0.0.1" {
		cleanIP = "127.0.0.1"
	}

	params := url.Values{}
	params.Set("vnp_Version", "2.1.0")
	params.Set("vnp_Command", "pay")
	params.Set("vnp_TmnCode", v.TmnCode)
	params.Set("vnp_Amount", fmt.Sprintf("%d", int64(amount)*100))
	params.Set("vnp_CurrCode", "VND")
	params.Set("vnp_TxnRef", txnRef)
	params.Set("vnp_OrderInfo", cleanOrderInfo)
	params.Set("vnp_OrderType", "other")
	params.Set("vnp_Locale", "vn")
	params.Set("vnp_ReturnUrl", v.ReturnURL)
	params.Set("vnp_IpAddr", cleanIP)
	params.Set("vnp_CreateDate", createDate)

	var keys []string
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var queryParts []string
	var hashParts []string
	for _, k := range keys {
		val := params.Get(k)
		if val != "" {
			escapedVal := url.QueryEscape(val)
			queryParts = append(queryParts, fmt.Sprintf("%s=%s", k, escapedVal))
			hashParts = append(hashParts, fmt.Sprintf("%s=%s", k, escapedVal))
		}
	}

	queryString := strings.Join(queryParts, "&")
	hashData := strings.Join(hashParts, "&")

	h := hmac.New(sha512.New, []byte(v.HashSecret))
	h.Write([]byte(hashData))
	secureHash := hex.EncodeToString(h.Sum(nil))

	return fmt.Sprintf("%s?%s&vnp_SecureHash=%s", v.BaseURL, queryString, secureHash)
}

// Kiểm tra chữ ký khi VNPay chuyển hướng học sinh về
func (v *VNPayHelper) VerifyReturn(queryParams url.Values) bool {
	vnpSecureHash := queryParams.Get("vnp_SecureHash")
	if vnpSecureHash == "" {
		return false
	}

	var keys []string
	for k := range queryParams {
		if k != "vnp_SecureHash" && k != "vnp_SecureHashType" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	var hashParts []string
	for _, k := range keys {
		val := queryParams.Get(k)
		if val != "" {
			hashParts = append(hashParts, fmt.Sprintf("%s=%s", k, url.QueryEscape(val)))
		}
	}

	hashData := strings.Join(hashParts, "&")
	h := hmac.New(sha512.New, []byte(v.HashSecret))
	h.Write([]byte(hashData))
	calculatedHash := hex.EncodeToString(h.Sum(nil))

	return strings.EqualFold(vnpSecureHash, calculatedHash)
}