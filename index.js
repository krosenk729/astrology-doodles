const express = require("express");
const app = express();
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cors = require("cors");
const path = require("path");

// Constants
// ===========================================================

const signs = {
	aries: "Aries",
	taurus: "Taurus",
	gemini: "Gemini",
	cancer: "Cancer",
	leo: "Leo",
	virgo: "Virgo",
	libra: "Libra",
	scorpio: "Scorpio",
	sagittarius: "Sagittarius",
	capricorn: "Capricorn",
	aquarius: "Aquarius",
	pisces: "Pisces",
};

// Express Middleware (Body Parse, Static Files, View Engines)
// ===========================================================

app.set("query parser", "extended");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// app.engine("ejs", require("ejs").__express);

app.use(cors());

// Scraping Fns
// ===========================================================

const astroDotCom = async function (sign, isTomorrow = false) {
	const url = isTomorrow
		? `https://www.astrology.com/horoscope/daily/tomorrow/${sign}.html`
		: `https://www.astrology.com/horoscope/daily/${sign}.html`;
	const res = await fetch(url).then((res) => res.text());
	const $ = cheerio.load(res);
	const title = "Astrology Dot Com";
	const body = $(".horoscope-main.grid > main > p:nth-of-type(1)");
	return { title, body: body.text() };
};

const truthStar = async function (sign, isTomorrow = false) {
	const url = `https://www.truthstar.com/daily-horoscope/${sign}-daily-horoscope/`;
	const res = await fetch(url).then((res) => res.text());
	const $ = cheerio.load(res);
	const title = "Truth Star";
	let body = isTomorrow
		? $(".entry-content h3:nth-of-type(3) ~ p")
		: $(".entry-content h3:nth-of-type(2) ~ p");
	body = body[0].children[0].data;
	return { title, body };
};

const _getTomorrowFormatted = () => {
	const dt = new Date();
	dt.setDate(dt.getDate() + 1);
	return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`;
}
const tarot = async function (sign, isTomorrow = false) {
	const url = isTomorrow
		? `https://www.tarot.com/daily-horoscope/${sign}/${_getTomorrowFormatted()}`
		: `https://www.tarot.com/daily-horoscope/${sign}`;
	const res = await fetch(url).then((res) => res.text());
	const title = "Tarot";
	let i = res.indexOf("scope_txt");
	let body = res.substring(i + "scope_txt".length + 3);
	i = body.indexOf("\"");
	body = body.substring(0, i);
	body = decodeURIComponent(body);
	return { title, body };
};

// Routes
// ===========================================================

app.get("/", async function (req, res) {
	res.redirect(`/${signs.cancer}`);
});

app.get("/:sign", async function (req, res) {
	const sign = req.params.sign.toLowerCase();
	const isTomorrow = !!req.query.tomorrow;
	if (!signs[sign]) return res.redirect(`/${signs.cancer}`);

	const horoscopes = await Promise.all([
		astroDotCom(sign, isTomorrow),
		truthStar(sign, isTomorrow),
		tarot(sign, isTomorrow),
	]);
	res.render("template", {
		horoscopes,
		sign: sign[0].toUpperCase() + sign.substring(1),
		signs: Object.values(signs),
	});
});

// Server
// ===========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
	console.log("App listening on PORT " + PORT);
});
