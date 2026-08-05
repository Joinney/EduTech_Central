package main

import (
"fmt"
"net/http"
)

func main() {
http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
fmt.Fprintf(w, "Submission Gateway is running!")
})
fmt.Println("Submission Gateway (Golang) started on port 8081...")
http.ListenAndServe(":8081", nil)
}
