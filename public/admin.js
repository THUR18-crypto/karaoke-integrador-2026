
"use strict";

let idEmEdicao = null;
let envioEmAndamento = false;

const formulario = document.getElementById("formulario-musica");
const campoNome = document.getElementById("nome");
const campoArtista = document.getElementById("artista");
const botaoSalvar = document.getElementById("salvar-musica");
const botaoExcluir = document.getElementById("excluir-musica");
const botaoNova = document.getElementById("nova-musica");
const tituloFormulario = document.getElementById("titulo-formulario");

function atualizarControles() {
    campoNome.disabled = envioEmAndamento;
    campoArtista.disabled = envioEmAndamento;
    botaoSalvar.disabled = envioEmAndamento;
    botaoNova.disabled = envioEmAndamento;
    botaoExcluir.disabled = envioEmAndamento || idEmEdicao === null;
}

function apresentarSelecao(evento) {
    const musica = evento.detail;

    idEmEdicao = musica ? musica.id : null;

    campoNome.value = musica ? musica.nome : "";
    campoArtista.value = musica ? musica.artista.nome : "";

    tituloFormulario.textContent = musica
        ? "Editar música"
        : "Cadastrar música";

    botaoSalvar.textContent = musica
        ? "Salvar alterações"
        : "Cadastrar música";

    mostrarMensagem(
        "estado-formulario",
        musica ? "Editando: " + musica.nome : ""
    );

    atualizarControles();
}

function prepararCadastro() {
    limparSelecao();

    idEmEdicao = null;
    campoNome.value = "";
    campoArtista.value = "";

    tituloFormulario.textContent = "Cadastrar música";
    botaoSalvar.textContent = "Cadastrar música";

    mostrarMensagem("estado-formulario", "");

    atualizarControles();
    campoNome.focus();
}

async function salvarMusica(evento) {
    evento.preventDefault();

    if (envioEmAndamento) return;

    const nome = campoNome.value.trim();
    const artista = campoArtista.value.trim();

    if (!nome || !artista) {
        mostrarMensagem(
            "estado-formulario",
            "Preencha o nome da música e o artista.",
            true
        );
        return;
    }

    const editando = idEmEdicao !== null;

    const caminho = editando
        ? `/api/musicas/${idEmEdicao}`
        : "/api/musicas";

    envioEmAndamento = true;
    atualizarControles();
    definirCatalogoOcupado(true);

    mostrarMensagem("estado-formulario", "Salvando música...");

    try {
        await consultarApi(caminho, {
            method: editando ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, artista })
        });

        prepararCadastro();
        await carregarMusicas();

        mostrarMensagem(
            "estado-formulario",
            editando
                ? "Música atualizada com sucesso!"
                : "Música cadastrada com sucesso!"
        );

    } catch (erro) {
        mostrarMensagem(
            "estado-formulario",
            "Erro ao salvar música: " + erro.message,
            true
        );

    } finally {
        envioEmAndamento = false;
        definirCatalogoOcupado(false);
        atualizarControles();
    }
}

async function excluirMusica() {
    if (envioEmAndamento || idEmEdicao === null) return;

    const nome = campoNome.value;

    const confirmar = window.confirm(
        `Deseja realmente excluir a música "${nome}"?`
    );

    if (!confirmar) return;

    envioEmAndamento = true;
    atualizarControles();
    definirCatalogoOcupado(true);

    mostrarMensagem("estado-formulario", "Excluindo música...");

    try {
        await consultarApi(`/api/musicas/${idEmEdicao}`, {
            method: "DELETE"
        });

        prepararCadastro();
        await carregarMusicas();

        mostrarMensagem(
            "estado-formulario",
            "Música excluída com sucesso!"
        );

    } catch (erro) {
        mostrarMensagem(
            "estado-formulario",
            "Erro ao excluir música: " + erro.message,
            true
        );

    } finally {
        envioEmAndamento = false;
        definirCatalogoOcupado(false);
        atualizarControles();
    }
}

formulario.addEventListener("submit", salvarMusica);

document.addEventListener("musica-selecionada", apresentarSelecao);

botaoNova.addEventListener("click", prepararCadastro);

botaoExcluir.addEventListener("click", excluirMusica);

atualizarControles();
