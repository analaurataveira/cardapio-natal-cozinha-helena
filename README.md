# Cardápio de Natal – Cozinha de Helena

Site do cardápio natalino da Cozinha de Helena. O cliente escolhe os produtos, monta a sacola e envia o pedido pelo WhatsApp.

## Como funciona

- Cada produto segue as regras do cardápio (sabores, quilos do salpicão, ingredientes que podem ser retirados, etc.).
- A sacola permite adicionar e remover itens e ajustar quantidades.
- Em **Finalizar pedido**, o cliente informa nome e telefone e o pedido segue para o WhatsApp de Helena em uma mensagem pronta.

## Arquivos

- `index.html`: página
- `style.css`: estilos
- `app.js`: sacola e envio para o WhatsApp
- `img/` e `fonts/`: imagens e fontes

## Como alterar

- Número do WhatsApp: constante `WHATSAPP` no início do `app.js` e links no rodapé do `index.html`.
- Produtos e preços: lista `PRODUTOS` no `app.js`.
