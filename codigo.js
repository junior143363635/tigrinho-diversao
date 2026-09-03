// ========== CONFIGURAÇÕES GERAIS ==========
let saldoInicialPadrao = Number(localStorage.getItem('saldoInicialPadrao') || 1000);
let taxaVitoriaPadrao = Number(localStorage.getItem('taxaVitoriaPadrao') || 35);
let usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual') || 'null');

// ========== INICIO ==========
verificarSessaoAtual();

// ========== LOGIN E CADASTRO ==========
function abrirLogin() {
    document.getElementById('telaLogin').classList.remove('oculto');
    document.getElementById('telaCadastro').classList.add('oculto');
}

function abrirCadastro() {
    document.getElementById('telaCadastro').classList.remove('oculto');
    document.getElementById('telaLogin').classList.add('oculto');
}

function fecharFormularios() {
    document.getElementById('telaLogin').classList.add('oculto');
    document.getElementById('telaCadastro').classList.add('oculto');
}

function fazerCadastro() {
    const usuario = document.getElementById('cadastroUsuario').value.trim();
    const senha = document.getElementById('cadastroSenha').value;
    if (!usuario || !senha) return alert('Preencha tudo!');

    const todos = JSON.parse(localStorage.getItem('tigrinhoUsuarios') || '{}');
    if (todos[usuario]) return alert('Esse nome de usuário já existe!');

    todos[usuario] = {
        senha: senha,
        saldo: saldoInicialPadrao,
        data: new Date().toLocaleString('pt-BR')
    };
    localStorage.setItem('tigrinhoUsuarios', JSON.stringify(todos));
    alert('Conta criada com sucesso! 🎉');
    fecharFormularios();
    abrirLogin();
}

function fazerLogin() {
    const usuario = document.getElementById('loginUsuario').value.trim();
    const senha = document.getElementById('loginSenha').value;
    const todos = JSON.parse(localStorage.getItem('tigrinhoUsuarios') || '{}');

    if (!todos[usuario] || todos[usuario].senha !== senha) {
        return alert('Usuário ou senha incorretos!');
    }

    usuarioAtual = { nome: usuario, saldo: todos[usuario].saldo };
    localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual));
    fecharFormularios();
    atualizarInterfaceLogada();
}

function sair() {
    localStorage.removeItem('usuarioAtual');
    usuarioAtual = null;
    atualizarInterfaceDeslogada();
}

function verificarSessaoAtual() {
    if (usuarioAtual) atualizarInterfaceLogada();
}

function atualizarInterfaceLogada() {
    document.getElementById('nomeUsuario').textContent = '👤 ' + usuarioAtual.nome;
    document.getElementById('nomeUsuario').classList.remove('oculto');
    document.getElementById('caixaSaldo').classList.remove('oculto');
    document.getElementById('saldo').textContent = usuarioAtual.saldo.toLocaleString('pt-BR');
    document.getElementById('btnLogin').classList.add('oculto');
    document.getElementById('btnCadastro').classList.add('oculto');
    document.getElementById('btnSair').classList.remove('oculto');
    document.getElementById('avisoLogin').classList.add('oculto');
    document.getElementById('areaJogos').classList.remove('oculto');
}

function atualizarInterfaceDeslogada() {
    document.getElementById('nomeUsuario').classList.add('oculto');
    document.getElementById('caixaSaldo').classList.add('oculto');
    document.getElementById('btnLogin').classList.remove('oculto');
    document.getElementById('btnCadastro').classList.remove('oculto');
    document.getElementById('btnSair').classList.add('oculto');
    document.getElementById('avisoLogin').classList.remove('oculto');
    document.getElementById('areaJogos').classList.add('oculto');
}

// ========== JOGOS ==========
function iniciarJogo(tipo, valorAposta) {
    if (!usuarioAtual) return alert('Faça login primeiro!');
    if (usuarioAtual.saldo < valorAposta) return alert(`Saldo insuficiente! Precisa de ${valorAposta} moedas.`);

    // Deduzir aposta
    usuarioAtual.saldo -= valorAposta;
    salvarDadosUsuario();

    // Sorteio
    const ganhou = Math.random() * 100 < taxaVitoriaPadrao;
    let mensagem = '';

    if (ganhou) {
        const premio = valorAposta * 2;
        usuarioAtual.saldo += premio;
        salvarDadosUsuario();
        mensagem = `
            <h3>🎉 PARABÉNS! VOCÊ GANHOU!</h3>
            <p>Tipo: ${tipo}</p>
            <p>Você apostou: ${valorAposta} moedas</p>
            <p>Prêmio: +${premio} moedas</p>
            <h4>Novo saldo: ${usuarioAtual.saldo.toLocaleString('pt-BR')} moedas</h4>
        `;
    } else {
        mensagem = `
            <h3>😞 Não foi dessa vez</h3>
            <p>Tipo: ${tipo}</p>
            <p>Você apostou e perdeu: ${valorAposta} moedas</p>
            <h4>Saldo restante: ${usuarioAtual.saldo.toLocaleString('pt-BR')} moedas</h4>
        `;
    }

    document.getElementById('conteudoJogo').innerHTML = mensagem;
    document.getElementById('areaJogoAberto').classList.remove('oculto');
    document.getElementById('saldo').textContent = usuarioAtual.saldo.toLocaleString('pt-BR');
}

function fecharJogo() {
    document.getElementById('areaJogoAberto').classList.add('oculto');
}

function salvarDadosUsuario() {
    const todos = JSON.parse(localStorage.getItem('tigrinhoUsuarios') || '{}');
    todos[usuarioAtual.nome].saldo = usuarioAtual.saldo;
    localStorage.setItem('tigrinhoUsuarios', JSON.stringify(todos));
    localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtual));
}

// ========== PAINEL ADMINISTRATIVO ==========
function salvarSaldoInicial() {
    const val = Number(document.getElementById('saldoInicial').value);
    saldoInicialPadrao = val;
    localStorage.setItem('saldoInicialPadrao', val);
    alert('Saldo inicial salvo! Novos usuários começam com ' + val + ' moedas.');
}

function salvarTaxa() {
    const val = Number(document.getElementById('taxaVitoria').value);
    taxaVitoriaPadrao = val;
    localStorage.setItem('taxaVitoriaPadrao', val);
    alert('Taxa de vitória definida em ' + val + '%');
}

function carregarUsuarios() {
    const todos = JSON.parse(localStorage.getItem('tigrinhoUsuarios') || '{}');
    const caixa = document.getElementById('listaUsuarios');
    let html = '';
    if (Object.keys(todos).length === 0) {
        html = '<p>Nenhum usuário cadastrado ainda.</p>';
    } else {
        for (let nome in todos) {
            html += `<p>👤 ${nome} | 💰 Saldo: ${todos[nome].saldo} moedas | 📅 ${todos[nome].data}</p>`;
        }
    }
    caixa.innerHTML = html;
}

function resetarTudo() {
    if (confirm('Tem certeza? TODOS os usuários serão apagados!')) {
        localStorage.clear();
        saldoInicialPadrao = 1000;
        taxaVitoriaPadrao = 35;
        usuarioAtual = null;
        carregarUsuarios();
        alert('Sistema resetado completamente!');
    }
}

// Carregar valores na página admin
if (document.getElementById('saldoInicial')) {
    document.getElementById('saldoInicial').value = saldoInicialPadrao;
    document.getElementById('taxaVitoria').value = taxaVitoriaPadrao;
    carregarUsuarios();
}