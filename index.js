const express = require('express');
const mongoose = require('mongoose');
const Note = require("./models/Note")
const cookieSession = require('cookie-session')
const app = express();

mongoose.connect("mongodb://localhost:27017/Notes", { useNewUrlParser: true});



/*const logger = (req, res, next) => {
    console.log("Nueva petición http");
    next();
};*/

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
    secret: "una_cadena_secreta",
    maxAge: 24 * 60 * 60 * 1000
}));
app.use(express.static("public"));
/*app.use(logger);*/

// muestra la lista de notas
app.get('/', async (req, res) => {
    /*const name = req.query.name;
    const age = req.query.age;

    req.session.views = ( req.session.views || 0) + 1*/

   const notes = await Note.find();
    res.render("index", { notes });
});

// muestra el formulario para crear una nota
app.get("/notes/new", (req, res) => {
    res.render("new");
});

// permite crear una nota
app.post("/notes", async (req, res, next) => {
    const data = {
        title: req.body.title,
        body: req.body.body
    };

    try {
        const note = new Note(data);
        await note.save();
    } catch(err) {
      return next (e);
    }

    res.redirect("/");
});

/*app.get("/users/:name", (req, res) => {
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
});*/

app.listen(3000, () => console.log("Listening on port 3000"));
