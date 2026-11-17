# A Jornada — Tiago e o Almoço do Bispo

Jogo para celular baseado na história *“O dia em que o bispo veio almoçar!”*. O jogador controla o **Tiago** em 9 fases curtas, cada uma com um minijogo, seguindo a ordem do vídeo original.

▶ **Jogar:** https://tiagoheineck.github.io/a-jornada/

## Fases

| # | Fase | Minijogo |
|---|------|----------|
| 1 | Café especial no IFC | Servir café (segurar e soltar na faixa) e pão de queijo antes das 11h45 |
| 2 | O sinal das 11h45 | Reflexo: tocar só nos balões “É UM SINAL!” |
| 3 | Trânsito tranquilo | Corrida em 2 faixas, desviando e pegando marmitas |
| 4 | A voz que veio do céu | Sequência: guardar o carro, pegar a mochila, abrir o portão |
| 5 | Vocês são os Denardi? | Diálogo de escolhas (respostas erradas viram piada) |
| 6 | Quem chegou? | Achar as meninas escondidas e coletar corações do abraço |
| 7 | Pânico na cozinha | Bloquear o bispo e puxar conversa enquanto a Dona Elir esconde os ossos |
| 8 | A foto para a história | Arrastar todos para o sofá e fotografar quando todos sorrirem |
| 9 | Esquerda, esquerda, esquerda | Memória de setas (estilo Genius) |

Ao final, a tela **FIM!** mostra as estrelas (até 27) e o tempo total. Zerando em até 4 minutos, aparece o selo **“4 minutos cravados!”**.

## Requisitos não funcionais atendidos

- HTML5, CSS3 e JavaScript puro (módulos ES), sem framework e sem etapa de build.
- Mobile-first, retrato 9:16, controles só por toque (Pointer Events), botões ≥ 48 px.
- Respeita entalhe/barra de gestos (`safe-area-inset`), aviso para girar o celular em paisagem.
- Canvas com coordenadas lógicas 360×640 escaladas para qualquer tela, 60 fps com `requestAnimationFrame`.
- Sem arquivos de imagem ou áudio pesados: personagens desenhados em código e sons sintetizados com Web Audio.
- PWA: instala na tela inicial e funciona offline (service worker).
- Progresso, estrelas e melhor tempo salvos em `localStorage`.
- Áudio só após o primeiro toque; botão de mudo; respeita `prefers-reduced-motion`.

## Rodar localmente

```bash
python3 -m http.server 8080
# abra http://localhost:8080 (no celular, use o IP da máquina na mesma rede)
```

Os módulos ES exigem servidor HTTP; abrir o `index.html` direto pelo arquivo não funciona.

## Estrutura

```
index.html          página única
css/style.css       layout, telas e HUD
js/main.js          fluxo de telas (capa, intro, resultado, pausa, fim)
js/engine.js        canvas, toque e laço de animação
js/draw.js          personagens, balões e cenários
js/audio.js         efeitos e trilha sintetizados
js/save.js          progresso no localStorage
js/fases/f1..f9     uma fase por arquivo
sw.js               cache offline
.github/workflows/pages.yml   verificação + deploy no GitHub Pages
```

Cada fase exporta `{ titulo, legenda, dica, criar(api) }`. `criar` devolve um objeto com `update(dt)`, `draw(ctx)` e, opcionalmente, `down/move/up(p)`; quando a fase termina, chama `api.fim(estrelas)`.

## Deploy

Todo push na `main` roda o workflow **Publicar no GitHub Pages**: checa a sintaxe dos scripts, monta a pasta `_site` e publica. Em *Settings → Pages*, a fonte deve estar como **GitHub Actions**.
