const express = require("express");
const mongoose = require("mongoose");
const Note = require("./models/Note");
const User = require("./models/User");
const cookieSession = require("cookie-session");
const md = require("marked");

const app = express();

mongoose.connect("mongodb://localhost:27017/Notes", { useNewUrlParser: true});

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
    secret: "una_cadena_secreta",
    maxAge: 24 * 60 * 60 * 1000
}));
app.use("/assets", express.static("assets"));

// Muestra la lista de notas.

app.get('/', async (req, res) => {
   const notes = await Note.find();
    res.render("index", { notes });
});

// Muestra el formulario para crear una nota.

app.get("/notes/new", async (req, res) => {
    const notes = await Note.find();
    res.render("new", { notes });
});

// Permite crear una nota.

app.post("/notes", async (req, res, next) => {
    const data = {
        title: req.body.title,
        body: req.body.body
    };

    try {
        const note = new Note(data);
        await note.save();
    } catch(err) {
      return next (err);
    }

    res.redirect("/");
});

// Muestra una nota.

app.get("/notes/:id", async (req, res) => {
    const notes = await Note.find({ user: res.locals.user });
    const note = await Note.findById(req.params.id);
    res.render("show", { notes: notes, currentNote: note, md: md });
  });

// Muestra el formulario para editar.

app.get("/notes/:id/edit", async (req, res, next) => {
    try {
        const notes = await Note.find();
        const note = await Note.findById(req.params.id);

        res.render("edit", { notes: notes, currentNote: note});
    } catch (err) {
        return next (err);
    }
    
});


// Actualiza una nota.  

app.patch("/notes/:id", async  (req, res, next) => {
    const id = req.params.id;
    const note = await Note.findById(id);
    
    note.title = req.body.title;
    note.body = req.body.body

    try {
        await note.save({});
        res.status(204).send({});
    } catch(err) {
        return next(err);
    }

    
});

// Elimina una nota.

app.delete("/notes/:id", async (req, res, next) => {
    try {
        await Note.deleteOne({ _id: req.params.id});
        res.status(204).send({});
    } catch (err) {
        return next(err);
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res, next) => {
    try {
        const user = await User.create({
            email: req.body.email,
            password: req.body.password,
        });
        res.redirect("/login");
    } catch (err) {
        return next(err);
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res, next) => {
    try {
        const user = await User.authenticate(req.body.email, req.body.password);
        if (user) {
            req.session.userId = user._id;
            return res.redirect("/");
        } else {
            res.render("/login", { error: "wrong email or password. try again!"});
        }
    } catch (err) {
        return next(err);
    }
});

app.get("/logout", (req, res) => {
    res.session = null;
    res.clearCookie("session");
    res,clearCookie("session.sig");
    res.redirect("/login");
});

app.listen(3000, () => console.log("Listening on port 3000"));
