package controller

import (
	"encoding/json"
	"fmt"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Province struct {
	ID     int    `json:"id"`
	NameTH string `json:"name_th"`
}

type Amphure struct {
	ID         int    `json:"id"`
	ProvinceID int    `json:"province_id"`
	NameTH     string `json:"name_th"`
}

type Tambon struct {
	ID       int    `json:"id"`
	AmphureID int   `json:"amphure_id"`
	NameTH   string `json:"name_th"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Location struct {
	gorm.Model
	Name       string
	Type       string
	City       string
	District   string
	Subdistrict string
	Latitude   float64
	Longitude  float64
}

func main() {
	// Connect DB
	dsn := "root:@tcp(127.0.0.1:3306)/thailand?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	// migrate Location
	db.AutoMigrate(&Location{})

	// load provinces
	var provinces []Province
	loadJSON("thailand_provinces.json", &provinces)

	var amphures []Amphure
	loadJSON("thailand_amphures.json", &amphures)

	var tambons []Tambon
	loadJSON("thailand_tambons.json", &tambons)

	// map provinces & amphures for lookup
	provinceMap := make(map[int]string)
	for _, p := range provinces {
		provinceMap[p.ID] = p.NameTH
	}
	amphureMap := make(map[int]struct {
		Name   string
		ProvID int
	})
	for _, a := range amphures {
		amphureMap[a.ID] = struct {
			Name   string
			ProvID int
		}{a.NameTH, a.ProvinceID}
	}

	// flatten tambons -> Location
	for _, t := range tambons {
		a := amphureMap[t.AmphureID]
		provinceName := provinceMap[a.ProvID]

		loc := Location{
			Name:        fmt.Sprintf("%s, %s, %s", t.NameTH, a.Name, provinceName),
			Type:        "Tambon",
			City:        provinceName,
			District:    a.Name,
			Subdistrict: t.NameTH,
			Latitude:    t.Latitude,
			Longitude:   t.Longitude,
		}
		db.Create(&loc)
	}
}

func loadJSON(filename string, v interface{}) {
	file, err := os.Open(filename)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	if err := json.NewDecoder(file).Decode(v); err != nil {
		panic(err)
	}
}
