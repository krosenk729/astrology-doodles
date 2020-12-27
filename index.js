const express = require("express");
const app = express();
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cors = require("cors");
const path = require("path");

// Express Middleware (Body Parse, Static Files, View Engines)
// ===========================================================

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// app.engine("ejs", require("ejs").__express);

app.use(cors());

// Scraping Fns
// ===========================================================

const astroDotCom = async function () {
	const url = "https://www.astrology.com/horoscope/daily/cancer.html";
	const res = await fetch(url).then((res) => res.text());
	const $ = cheerio.load(res);
	const title = "Astrology Dot Com";
	const body = $(".horoscope-main.grid > main > p");
	return { title, body: body.text() };
};

const truthStar = async function () {
	const url = "https://www.truthstar.com/daily-horoscope/cancer-daily-horoscope/";
	const res = await fetch(url).then((res) => res.text());
	const $ = cheerio.load(res);
	const title = "Truth Star";
	const body = $(".entry-content h3:nth-of-type(2) ~ p");
	return { title, body: body.text() };
};

const tarot = async function () {
	const url = "https://www.tarot.com/daily-horoscope/cancer";
	const res = await fetch(url).then((res) => res.text());
	const title = "Tarot";
	let i = res.indexOf("scope_txt");
	let body = res.substring(i + "scope_txt".length + 3);
	i = body.indexOf("\"");
	body = body.substring(0, i);
	return { title, body };
};

// Routes
// ===========================================================

app.get("/", async function (req, res) {
	const horoscopes = await Promise.all([astroDotCom(), truthStar(), tarot() ]);

	res.render("template", { horoscopes });
});

// Server
// ===========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
	console.log("App listening on PORT " + PORT);
});
