const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const sqlite = require("sqlite");
const dbConnect = sqlite.open("banco.sqlite", { Promise });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (request, response) => {
  const db = await dbConnect;
  const categoriasDB = await db.all("select * from categorias");
  const vagas = await db.all("select * from vagas");
  const categorias = categoriasDB.map(cat => {
    return {
      ...cat,
      vagas: vagas.filter(vaga => vaga.categoria === cat.id)
    };
  });
  response.render("home", {
    categorias
  });
});

app.get("/vaga/:id", async (request, response) => {
  const db = await dbConnect;
  const vaga = await db.get(
    "select * from vagas where id = " + request.params.id
  );
  response.render("vaga", { vaga });
});

app.get("/admin", (req, res) => {
  res.render("admin/home");
});

app.get("/admin/vagas", async (req, res) => {
  const db = await dbConnect;
  const vagas = await db.all("select * from vagas");
  res.render("admin/vagas", { vagas });
});

app.get("/admin/vaga/delete/:id", async (req, res) => {
  const db = await dbConnect;
  await db.run("delete from  vagas where id = " + req.params.id);
  res.redirect("/admin/vagas");
});

app.get("/admin/vagas/nova", async (req, res) => {
  const db = await dbConnect;
  const categorias = await db.all("select * from categorias");
  res.render("admin/nova-vaga", { categorias });
});

app.get("/admin/vaga/editar/:id", async (req, res) => {
  const db = await dbConnect;
  const categorias = await db.all("select * from categorias");
  const vaga = await db.get("select * from vagas where id = " + req.params.id);
  res.render("admin/editar-vaga", { categorias, vaga });
});

app.post("/admin/vagas/nova", async (req, res) => {
  const db = await dbConnect;
  const { titulo, descricao, categoria } = req.body;
  await db.run(
    `insert into vagas (categoria, titulo, descricao) VALUES (${categoria}, '${titulo}', '${descricao}')`
  );
  res.redirect("/admin/vagas");
});

app.post("/admin/vaga/editar/:id", async (req, res) => {
  const db = await dbConnect;
  const { titulo, descricao, categoria } = req.body;
  const { id } = req.params;
  await db.run(
    `update vagas set categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}' WHERE id=${id}`
  );
  res.redirect("/admin/vagas");
});

const init = async () => {
  const db = await dbConnect;
  await db.run(
    "create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT)"
  );
  await db.run(
    "create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT)"
  );
  //const categoria = "Marketing team";
  //await db.run(`insert into categorias (categoria) VALUES ('${categoria}')`);
  //const vaga = "Marketing digital (San Francisco)";
  //const descricao = "Vaga de marketing digital developer";
  //await db.run(
  //  `insert into vagas (categoria, titulo, descricao) VALUES (2, '${vaga}', '${descricao}')`
  //);
};

init();

app.listen(3000, err => {
  if (err) {
    console.log("Erro ao iniciar o servidor");
  } else {
    console.log("Servidor ok");
  }
});
