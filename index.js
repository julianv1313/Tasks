const express = require('express');
const app = express();

const logger = (req, res, next) => {
    console.log("Nueva petición http");
    next();
};

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(logger);

app.get('/', (req, res) => {
    const name = req.query.name;
    const age = req.query.age;

    //res.send(`<h1>Hola ${name}, tienes ${age} años </h1>`);
    const notes = [
      "Nota 1", "Nota 2", "Nota 3",  
    ];
    res.render("index", {notes} );
});

app.get("/notes/new", (req, res) => {
    res.render("new");
});

app.post("/notes", (req, res) => {
    console.log(req.body);
    res.redirect("/");
});

app.get("/users/:name", (req, res) => {
    const name = req.params.name;
    res.send(`<h1>Hola ${name}</h1>`);
});

app.post("/users", (req, res) => {
    res.status(404);
    res.set("X-api-Version", "1.0");
    res.send("no se encontró la ruta");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Algo salio mal");
});

app.listen(3000, () => console.log("Listening on port 3000"));
