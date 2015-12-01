package controllers

import "github.com/revel/revel"
import "net/http"
import "fmt"
import "io/ioutil"
import "encoding/json"

type App struct {
	*revel.Controller
}

func (c App) Index() revel.Result {
	return c.Render()
}

type Repo struct {
	Go              int `json:"Go"`
	Makefile        int `json:"Makefile"`
	Protocol_Buffer int `json:"Protocol Buffer"`
	Shell           int `json:"Shell"`
}

func (c App) Languages() revel.Result {
	res, _ := http.Get("https://api.github.com/repos/sourcegraph/srclib/languages")
	body, _ := ioutil.ReadAll(res.Body)
	var r Repo
	err := json.Unmarshal(body, &r)
	if err != nil {
        fmt.Println(err)
    }
	return c.Render(r)
}