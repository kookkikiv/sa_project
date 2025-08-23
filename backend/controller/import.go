package controller

import (
    "encoding/json"
    "io/ioutil"
    "log"

    "gorm.io/gorm"
)

// ฟังก์ชัน generic import JSON → DB
func ImportJSON[T any](db *gorm.DB, filename string, out *[]T) {
    data, err := ioutil.ReadFile(filename)
    if err != nil {
        log.Fatal("Read error:", err)
    }

    if err := json.Unmarshal(data, out); err != nil {
        log.Fatal("Unmarshal error:", err)
    }

    if err := db.Create(out).Error; err != nil {
        log.Fatal("Insert error:", err)
    }

    log.Printf("✅ Imported %s (%d records)\n", filename, len(*out))
}
