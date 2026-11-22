(function () {
  'use strict';

  var WHATSAPP = '5583994025995'; // WhatsApp da Cozinha de Helena: (83) 9 9402-5995
  var CHAVE = 'cozinha-helena-sacola-natal';

  /* ---------- produtos ---------- */
  var INGREDIENTES = ['Azeitona', 'Uva-passa', 'Muçarela', 'Presunto', 'Milho', 'Ervilha', 'Cenoura', 'Batata palha'];

  var PRODUTOS = [
    { id: 'lasanha', tipo: 'unico', foto: 'lasanha.jpg', titulo: 'Lasanha', sub: 'O preço muda conforme o sabor',
      rotulo: 'Sabor', padrao: 'frango',
      opcoes: [{ id: 'frango', nome: 'Frango', preco: 110 }, { id: 'carne', nome: 'Carne', preco: 120 }],
      comPreco: true, dica: 'Escolha um dos dois sabores.' },
    { id: 'empadao', tipo: 'fixo', foto: 'empadao.jpg', titulo: 'Empadão', sub: 'Tamanho grande (G)', preco: 110,
      nomePedido: 'Empadão de frango', descPedido: 'Tamanho G',
      fixos: ['Sabor: frango', 'Tamanho: G'], dica: 'Esta receita não tem escolha de sabor.' },
    { id: 'bolo-acetato', tipo: 'multi', foto: 'bolo-acetato.jpg', titulo: 'Bolo no acetato', sub: 'Rende 10 fatias', preco: 80,
      rotulo: 'Sabores · um ou os dois', padrao: ['ninho', 'brigadeiro'],
      opcoes: [{ id: 'ninho', nome: 'Ninho' }, { id: 'brigadeiro', nome: 'Brigadeiro' }] },
    { id: 'salpicao', tipo: 'quilo', foto: 'salpicao.jpg', titulo: 'Salpicão', sub: 'R$ 80,00 por quilo', preco: 80 },
    { id: 'caixa-doces', tipo: 'exato', foto: 'caixa-doces.jpg?v=2', titulo: 'Caixa com 20 doces natalinos',
      sub: 'Personalizados · 20 unidades', preco: 50, exatos: 2, rotulo: 'Escolha exatamente 2 sabores',
      padrao: ['brigadeiro', 'ninho'],
      opcoes: [{ id: 'brigadeiro', nome: 'Brigadeiro' }, { id: 'ninho', nome: 'Ninho' }, { id: 'surpresa', nome: 'Surpresa de uva' }] },
    { id: 'guirlanda-brownie', tipo: 'unico', foto: 'guirlanda-brownie.jpg', titulo: 'Guirlanda de brownie',
      sub: 'Tamanho M · aro 20', preco: 50, rotulo: 'Sabor', padrao: 'ninho',
      opcoes: [{ id: 'ninho', nome: 'Ninho' }, { id: 'chocolate', nome: 'Chocolate' }],
      descPedido: 'Tamanho M · aro 20', dica: 'Escolha um único sabor.' },
    { id: 'guirlanda-bolo', tipo: 'unico', foto: 'guirlanda-bolo.jpg', titulo: 'Guirlanda de bolo',
      sub: 'Tamanho M · aro 20', preco: 50, rotulo: 'Sabor', padrao: 'chocolate',
      opcoes: [{ id: 'ninho', nome: 'Ninho' }, { id: 'chocolate', nome: 'Chocolate' }],
      descPedido: 'Tamanho M · aro 20', dica: 'Escolha um único sabor.' }
  ];

  /* ---------- utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function dinheiro(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function kg(v) { return String(v).replace('.', ',') + ' kg'; }
  function minusculo(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function listaE(arr) {
    if (arr.length <= 1) return arr.join('');
    return arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1];
  }
  function unidades(n) { return n + (n === 1 ? ' unidade' : ' unidades'); }
  function itensTxt(n) { return n + (n === 1 ? ' item' : ' itens'); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* ---------- estado ---------- */
  var sacola = [];
  var estado = {}; // escolhas atuais de cada card

  PRODUTOS.forEach(function (p) {
    if (p.tipo === 'unico') estado[p.id] = { sel: p.padrao };
    else if (p.tipo === 'multi' || p.tipo === 'exato') estado[p.id] = { sel: p.padrao.slice() };
    else if (p.tipo === 'quilo') estado[p.id] = { kg: 1, tirados: [] };
  });

  function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE) || '[]');
      if (Array.isArray(s)) sacola = s.filter(function (i) {
        return i && typeof i.nome === 'string' && typeof i.preco === 'number' && typeof i.qtd === 'number' && i.qtd > 0;
      });
    } catch (e) { sacola = []; }
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(sacola)); } catch (e) { /* sem armazenamento */ }
  }

  /* ---------- montagem dos cards ---------- */
  function precoAtual(p) {
    if (p.tipo === 'unico' && p.comPreco) {
      var o = p.opcoes.filter(function (x) { return x.id === estado[p.id].sel; })[0];
      return o.preco;
    }
    if (p.tipo === 'quilo') return estado[p.id].kg * p.preco;
    return p.preco;
  }
  function textoTag(p) { return p.tipo === 'quilo' ? dinheiro(p.preco) + '/kg' : dinheiro(precoAtual(p)); }

  function chipHtml(p, o, ativo, desativado) {
    var rot = esc(o.nome) + (p.comPreco ? ' · ' + dinheiro(o.preco) : '');
    return '<button type="button" class="chip" data-opcao="' + o.id + '" aria-pressed="' + (ativo ? 'true' : 'false') + '"' +
      (desativado ? ' disabled' : '') + '><i aria-hidden="true"></i>' + rot + '</button>';
  }

  function corpoCard(p) {
    var e = estado[p.id], h = '';
    if (p.tipo === 'unico') {
      h += '<fieldset class="grupo"><div class="grupo__cab"><legend class="grupo__rotulo">' + p.rotulo + '</legend></div><div class="chips">' +
        p.opcoes.map(function (o) { return chipHtml(p, o, e.sel === o.id, false); }).join('') + '</div></fieldset>';
      h += '<p class="dica" aria-live="polite">' + p.dica + '</p>';
    } else if (p.tipo === 'fixo') {
      h += '<div class="grupo"><span class="grupo__rotulo">Opção fixa</span><div class="chips">' +
        p.fixos.map(function (f) { return '<span class="chip chip--fixo">' + f + '</span>'; }).join('') + '</div></div>';
      h += '<p class="dica">' + p.dica + '</p>';
    } else if (p.tipo === 'multi') {
      h += '<fieldset class="grupo"><div class="grupo__cab"><legend class="grupo__rotulo">' + p.rotulo + '</legend><span class="grupo__contagem" data-contagem-sabores>' +
        e.sel.length + (e.sel.length === 1 ? ' sabor' : ' sabores') + '</span></div><div class="chips">' +
        p.opcoes.map(function (o) { return chipHtml(p, o, e.sel.indexOf(o.id) > -1, false); }).join('') + '</div></fieldset>';
      h += '<p class="dica" aria-live="polite" data-dica></p>';
    } else if (p.tipo === 'exato') {
      h += '<fieldset class="grupo"><div class="grupo__cab"><legend class="grupo__rotulo">' + p.rotulo + '</legend><span class="grupo__contagem" data-contagem-sabores></span></div><div class="chips">' +
        p.opcoes.map(function (o) { return chipHtml(p, o, e.sel.indexOf(o.id) > -1, false); }).join('') + '</div></fieldset>';
      h += '<p class="dica" aria-live="polite" data-dica></p>';
    }
    h += '<div class="card__acao"><button type="button" class="btn-add" data-adicionar>Adicionar à sacola</button></div>';
    return h;
  }

  function cardHtml(p) {
    if (p.tipo === 'quilo') {
      return '<article class="card card--larga card--salpicao" data-id="' + p.id + '">' +
        '<div class="card__foto"><img src="img/' + p.foto + '" alt="Salpicão" loading="lazy"><span class="tag" data-tag>' + textoTag(p) + '</span></div>' +
        '<div class="card__corpo"><div><h3 class="card__titulo">' + p.titulo + '</h3><p class="card__sub">' + p.sub.replace('R$ 80,00', 'R$ 80,00') + '</p></div>' +
        '<div class="grupo" role="group" aria-label="Quantidade em quilos"><span class="grupo__rotulo">Quantos quilos?</span>' +
        '<div class="qtd"><button type="button" class="qtd__btn" data-menos aria-label="Diminuir meio quilo">−</button>' +
        '<div class="qtd__valor" role="status" aria-label="Quantidade escolhida" data-kg></div>' +
        '<button type="button" class="qtd__btn qtd__btn--mais" data-mais aria-label="Aumentar meio quilo">+</button>' +
        '<span class="qtd__nota">Aceita mais de 1 kg, de meio em meio quilo.</span></div></div>' +
        '<fieldset class="grupo"><div class="grupo__cab"><legend class="grupo__rotulo">Ingredientes · toque para retirar</legend><span class="grupo__contagem" data-contagem-ing></span></div>' +
        '<div class="chips">' + INGREDIENTES.map(function (n) {
          return '<button type="button" class="chip" data-ing="' + esc(n) + '" aria-pressed="true"><i aria-hidden="true"></i>' + n + '</button>';
        }).join('') + '</div></fieldset>' +
        '<div class="calculo"><div><small data-conta></small><strong data-total-card></strong></div>' +
        '<button type="button" class="btn-add" data-adicionar>Adicionar à sacola</button></div></div></article>';
    }
    return '<article class="card" data-id="' + p.id + '">' +
      '<div class="card__foto"><img src="img/' + p.foto + '" alt="' + esc(p.titulo) + '" loading="lazy"><span class="tag" data-tag>' + textoTag(p) + '</span></div>' +
      '<div class="card__corpo"><div><h3 class="card__titulo">' + p.titulo + '</h3><p class="card__sub">' + p.sub + '</p></div>' + corpoCard(p) + '</div></article>';
  }

  function montar() {
    var grade = $('#grade-produtos');
    var html = PRODUTOS.map(cardHtml).join('');
    html += '<aside class="card card--resumo" aria-label="Resumo da sacola"><span class="grupo__rotulo">Sua sacola</span>' +
      '<p class="resumo__n" data-resumo-n>0 itens</p><p class="resumo__t" data-resumo-t>Total: R$ 0,00</p>' +
      '<a class="btn-revisar" href="#sacola">Revisar sacola</a></aside>';
    grade.innerHTML = html;
    PRODUTOS.forEach(atualizarCard);
  }

  /* ---------- atualização de cada card ---------- */
  function nomesSelecionados(p) {
    var e = estado[p.id];
    return p.opcoes.filter(function (o) { return e.sel.indexOf(o.id) > -1; }).map(function (o) { return o.nome; });
  }

  function atualizarCard(p) {
    var card = $('[data-id="' + p.id + '"]'), e = estado[p.id];
    if (!card) return;
    var tag = $('[data-tag]', card);
    if (tag) tag.textContent = textoTag(p);

    if (p.tipo === 'unico') {
      $$('[data-opcao]', card).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-opcao') === e.sel ? 'true' : 'false'); });
    }
    if (p.tipo === 'multi') {
      $$('[data-opcao]', card).forEach(function (b) { b.setAttribute('aria-pressed', e.sel.indexOf(b.getAttribute('data-opcao')) > -1 ? 'true' : 'false'); });
      $('[data-contagem-sabores]', card).textContent = e.sel.length + (e.sel.length === 1 ? ' sabor' : ' sabores');
      $('[data-dica]', card).textContent = e.sel.length === p.opcoes.length
        ? 'Os dois sabores, sem divisão fixa de fatias.'
        : 'Só o sabor ' + nomesSelecionados(p)[0] + '. Toque no outro para incluir os dois.';
    }
    if (p.tipo === 'exato') {
      var cheio = e.sel.length >= p.exatos;
      $$('[data-opcao]', card).forEach(function (b) {
        var ativo = e.sel.indexOf(b.getAttribute('data-opcao')) > -1;
        b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        b.disabled = cheio && !ativo;
      });
      $('[data-contagem-sabores]', card).textContent = e.sel.length + ' de ' + p.exatos;
      var falta = p.exatos - e.sel.length;
      $('[data-dica]', card).textContent = cheio
        ? 'Pronto! Toque em um sabor escolhido para trocar.'
        : 'Escolha mais ' + falta + (falta === 1 ? ' sabor.' : ' sabores.');
      $('[data-adicionar]', card).disabled = !cheio;
    }
    if (p.tipo === 'quilo') {
      $('[data-kg]', card).textContent = kg(e.kg);
      $('[data-menos]', card).disabled = e.kg <= 0.5;
      $$('[data-ing]', card).forEach(function (b) {
        var tirado = e.tirados.indexOf(b.getAttribute('data-ing')) > -1;
        b.setAttribute('aria-pressed', tirado ? 'false' : 'true');
        b.classList.toggle('chip--tirado', tirado);
      });
      var n = INGREDIENTES.length - e.tirados.length;
      $('[data-contagem-ing]', card).textContent = n + ' de ' + INGREDIENTES.length + ' ingredientes';
      $('[data-conta]', card).textContent = kg(e.kg) + ' × ' + dinheiro(p.preco);
      $('[data-total-card]', card).textContent = dinheiro(e.kg * p.preco);
    }
  }

  /* ---------- itens da sacola ---------- */
  function criarItem(p) {
    var e = estado[p.id], nome, desc;
    if (p.tipo === 'unico') {
      var o = p.opcoes.filter(function (x) { return x.id === e.sel; })[0];
      if (p.id === 'lasanha') { nome = 'Lasanha de ' + minusculo(o.nome); desc = ''; }
      else { nome = p.titulo; desc = o.nome + ' · ' + minusculo(p.descPedido.charAt(0)) + p.descPedido.slice(1); }
      return { chave: p.id + '|' + o.id, nome: nome, desc: desc, preco: p.comPreco ? o.preco : p.preco, qtd: 1 };
    }
    if (p.tipo === 'fixo') return { chave: p.id, nome: p.nomePedido, desc: p.descPedido, preco: p.preco, qtd: 1 };
    if (p.tipo === 'multi') {
      var n = nomesSelecionados(p);
      return { chave: p.id + '|' + e.sel.slice().sort().join('+'), nome: p.titulo, desc: n.join(' + ') + ' · 10 fatias', preco: p.preco, qtd: 1 };
    }
    if (p.tipo === 'exato') {
      return { chave: p.id + '|' + e.sel.slice().sort().join('+'), nome: p.titulo, desc: nomesSelecionados(p).join(' + '), preco: p.preco, qtd: 1 };
    }
    if (p.tipo === 'quilo') {
      var tirados = e.tirados.map(minusculo);
      var d = kg(e.kg) + ' · ' + (tirados.length ? 'sem ' + listaE(tirados) : 'todos os ingredientes');
      return { chave: p.id + '|' + e.kg + '|' + e.tirados.slice().sort().join('+'), nome: p.titulo, desc: d, preco: e.kg * p.preco, qtd: 1 };
    }
  }

  function adicionar(p) {
    var item = criarItem(p);
    var igual = sacola.filter(function (i) { return i.chave === item.chave; })[0];
    if (igual) igual.qtd += 1; else sacola.push(item);
    salvar(); desenhar();
    aviso(item.nome + ' foi para a sacola.');
    var topo = $('#btn-sacola-topo');
    topo.classList.remove('pulou'); void topo.offsetWidth; topo.classList.add('pulou');
  }

  function totais() {
    var n = 0, t = 0;
    sacola.forEach(function (i) { n += i.qtd; t += i.qtd * i.preco; });
    return { n: n, t: t };
  }

  function desenhar() {
    var tot = totais();
    $$('[data-contagem]').forEach(function (el) { el.textContent = tot.n; });
    var rn = $('[data-resumo-n]'), rt = $('[data-resumo-t]');
    if (rn) rn.textContent = itensTxt(tot.n);
    if (rt) rt.textContent = 'Total: ' + dinheiro(tot.t);
    $('#total-sacola').textContent = dinheiro(tot.t);
    $('#sacola-vazia').hidden = sacola.length > 0;
    $('#btn-finalizar').disabled = sacola.length === 0;
    $('#lista-sacola').innerHTML = sacola.map(function (i, idx) {
      var desc = [i.desc, i.qtd > 1 ? unidades(i.qtd) : (i.desc ? '' : '1 unidade')].filter(Boolean).join(' · ');
      return '<li><span class="sacola__nome">' + esc(i.nome) + '</span>' +
        '<span class="sacola__preco">' + dinheiro(i.preco * i.qtd) + '</span>' +
        '<span class="sacola__desc">' + esc(desc) + '</span>' +
        '<button type="button" class="sacola__rem" data-remover="' + idx + '" aria-label="Remover ' + esc(i.nome) + ' da sacola">Remover</button>' +
        '<span class="sacola__ctrl"><button type="button" class="mini" data-menos-item="' + idx + '" aria-label="Diminuir quantidade de ' + esc(i.nome) + '">−</button>' +
        '<span class="sacola__qtd" aria-label="Quantidade">' + i.qtd + '</span>' +
        '<button type="button" class="mini" data-mais-item="' + idx + '" aria-label="Aumentar quantidade de ' + esc(i.nome) + '">+</button></span></li>';
    }).join('');
  }

  var tAviso;
  function aviso(t) {
    var el = $('#aviso');
    el.textContent = t; el.classList.add('mostra');
    clearTimeout(tAviso); tAviso = setTimeout(function () { el.classList.remove('mostra'); }, 2400);
  }

  /* ---------- eventos dos cards ---------- */
  document.addEventListener('click', function (ev) {
    var alvo = ev.target.closest('button');
    if (!alvo) return;
    var card = alvo.closest('[data-id]');

    if (card) {
      var p = PRODUTOS.filter(function (x) { return x.id === card.getAttribute('data-id'); })[0], e = estado[p.id];
      if (alvo.hasAttribute('data-opcao')) {
        var id = alvo.getAttribute('data-opcao');
        if (p.tipo === 'unico') e.sel = id;
        else if (p.tipo === 'multi') {
          var pos = e.sel.indexOf(id);
          if (pos > -1) { if (e.sel.length > 1) e.sel.splice(pos, 1); } else e.sel.push(id);
        } else if (p.tipo === 'exato') {
          var q = e.sel.indexOf(id);
          if (q > -1) e.sel.splice(q, 1); else if (e.sel.length < p.exatos) e.sel.push(id);
        }
        atualizarCard(p);
      } else if (alvo.hasAttribute('data-ing')) {
        var nome = alvo.getAttribute('data-ing'), i = e.tirados.indexOf(nome);
        if (i > -1) e.tirados.splice(i, 1);
        else if (INGREDIENTES.length - e.tirados.length > 1) e.tirados.push(nome);
        else aviso('Deixe pelo menos um ingrediente no salpicão.');
        atualizarCard(p);
      } else if (alvo.hasAttribute('data-mais')) { e.kg = Math.min(50, e.kg + 0.5); atualizarCard(p); }
      else if (alvo.hasAttribute('data-menos')) { e.kg = Math.max(0.5, e.kg - 0.5); atualizarCard(p); }
      else if (alvo.hasAttribute('data-adicionar')) adicionar(p);
      return;
    }

    if (alvo.hasAttribute('data-remover')) {
      var r = +alvo.getAttribute('data-remover'); var rem = sacola.splice(r, 1)[0];
      salvar(); desenhar(); if (rem) aviso(rem.nome + ' saiu da sacola.');
    } else if (alvo.hasAttribute('data-mais-item')) {
      sacola[+alvo.getAttribute('data-mais-item')].qtd += 1; salvar(); desenhar();
    } else if (alvo.hasAttribute('data-menos-item')) {
      var k = +alvo.getAttribute('data-menos-item');
      if (sacola[k].qtd > 1) sacola[k].qtd -= 1; else sacola.splice(k, 1);
      salvar(); desenhar();
    }
  });

  /* ---------- finalização / WhatsApp ---------- */
  var dialogo = $('#dialogo-pedido'), form = $('#form-pedido');
  var inNome = $('#cliente-nome'), inTel = $('#cliente-telefone');

  function mascaraTelefone(v) {
    var d = v.replace(/\D/g, '');
    if (d.indexOf('55') === 0 && d.length > 11) d = d.slice(2);
    d = d.slice(0, 11);
    if (d.length > 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    if (d.length > 2) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return d;
  }
  inTel.addEventListener('input', function () { inTel.value = mascaraTelefone(inTel.value); });

  function resumoNoDialogo() {
    var tot = totais();
    $('#resumo-qtd').textContent = '(' + itensTxt(tot.n) + ')';
    $('#resumo-lista').innerHTML = sacola.map(function (i) {
      var d = [i.desc, i.qtd > 1 ? unidades(i.qtd) : ''].filter(Boolean).join(' · ');
      return '<li><span>' + esc(i.nome) + (d ? '<small>' + esc(d) + '</small>' : '') + '</span><b>' + dinheiro(i.preco * i.qtd) + '</b></li>';
    }).join('');
    $('#resumo-total').textContent = dinheiro(tot.t);
  }

  $('#btn-finalizar').addEventListener('click', function () {
    if (!sacola.length) return;
    resumoNoDialogo();
    $('#erro-nome').textContent = ''; $('#erro-telefone').textContent = '';
    inNome.removeAttribute('aria-invalid'); inTel.removeAttribute('aria-invalid');
    if (dialogo.showModal) dialogo.showModal(); else dialogo.setAttribute('open', '');
    inNome.focus();
  });
  $('#btn-voltar').addEventListener('click', function () { dialogo.close ? dialogo.close() : dialogo.removeAttribute('open'); });
  dialogo.addEventListener('click', function (ev) { if (ev.target === dialogo) dialogo.close(); });

  function montarMensagem(nome, tel) {
    var tot = totais(), linhas = [];
    linhas.push('Olá, Helena! Quero fazer um pedido do Cardápio de Natal 🎄');
    linhas.push('');
    linhas.push('*Cliente:* ' + nome);
    linhas.push('*Telefone:* ' + tel);
    linhas.push('');
    linhas.push('*Pedido (' + itensTxt(tot.n) + '):*');
    sacola.forEach(function (i, idx) {
      var d = [i.desc, i.qtd > 1 ? unidades(i.qtd) : (i.desc ? '' : '1 unidade')].filter(Boolean).join(' · ');
      linhas.push((idx + 1) + '. ' + i.nome + (d ? ' (' + d + ')' : '') + ' — ' + dinheiro(i.preco * i.qtd));
    });
    linhas.push('');
    linhas.push('*Total: ' + dinheiro(tot.t) + '*');
    return linhas.join('\n');
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var nome = inNome.value.trim().replace(/\s+/g, ' '), digitos = inTel.value.replace(/\D/g, ''), ok = true;
    if (nome.length < 2) { $('#erro-nome').textContent = 'Digite o seu nome.'; inNome.setAttribute('aria-invalid', 'true'); ok = false; }
    else { $('#erro-nome').textContent = ''; inNome.removeAttribute('aria-invalid'); }
    if (digitos.length < 10) { $('#erro-telefone').textContent = 'Digite o telefone com DDD.'; inTel.setAttribute('aria-invalid', 'true'); ok = false; }
    else { $('#erro-telefone').textContent = ''; inTel.removeAttribute('aria-invalid'); }
    if (!ok) { (inNome.getAttribute('aria-invalid') ? inNome : inTel).focus(); return; }
    if (!sacola.length) return;
    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(montarMensagem(nome, inTel.value));
    var w = window.open(url, '_blank', 'noopener');
    if (!w) window.location.href = url;
    dialogo.close();
    aviso('Pedido aberto no WhatsApp. Basta tocar em enviar.');
  });

  /* ---------- início ---------- */
  carregar();
  montar();
  desenhar();
})();
