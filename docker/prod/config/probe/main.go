// Healthcheck of the distroless images that ship neither a shell nor an HTTP client (nginx, s3):
// exits 0 when a GET of its one argument answers 2xx, 1 otherwise. Built static, stdlib only.
//
//	probe http://127.0.0.1:9000/health
package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: probe <url>")
		os.Exit(2)
	}
	client := http.Client{Timeout: 3 * time.Second}
	response, err := client.Get(os.Args[1])
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode > 299 {
		fmt.Fprintf(os.Stderr, "%s answered %d\n", os.Args[1], response.StatusCode)
		os.Exit(1)
	}
}
