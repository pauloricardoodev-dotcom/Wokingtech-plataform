Gerador de Backgrounds para Hero — Workshop de Frontend
Contexto
Vou dar um workshop de desenvolvimento frontend de 2 dias para dezenas de alunos. Cada aluno vai construir um site e precisa de um background de hero único para dar personalidade ao projeto. Este app é onde eles geram, escolhem e baixam esse background.

Prazo: 3 dias até o workshop. Prioridade é algo simples, estável e no ar — não perfeito.

Objetivo
Um site onde o aluno:

Escolhe duas cores: principal (fundo, silhuetas, 1ª cor) e secundária (2ª cor). A 3ª cor é o meio do caminho entre as duas.
Escolhe um estilo, em 4 grupos (20 no total):
  Abstratos: blobs, ondas, memphis, bauhaus, aurora
  Tech: códigos, hardware, neon, Y2K
  Paisagens: cidade cyberpunk, floresta, oriental, espaço, tropical
  Cultura: gamer, nerd, música, livros, graffiti, café
Temas são ilustração flat/silhueta, sem texto. Cada semente sorteia variantes de cena e extras.
"Nerd" = cultura pop genérica (robô, disco voador, TV retrô, espadas laser, quadrinhos, VHS...), nunca personagens/marcas reais.
Sorteios devem usar só o PRNG da semente (nada de sort com comparador aleatório: varia entre navegadores).
Cor "detail" (paleta): destaque para detalhes pequenos (estrelas, brilhos); clara no dark, escura no light.
Dia/noite: aurora, floresta e cidade desenham noite no dark e dia no light. O que muda com o tema usa rand.fork(),
para o resto do desenho ficar idêntico nos dois temas.
Ajusta alguns controles simples (intensidade, suavidade, posição do texto).
Clica em "Gerar outro" até gostar (cada clique sorteia uma nova semente).
Vê o preview dentro de um hero de exemplo (título + botão), alternando dark / light.
Baixa o background em PNG 1920×1080 (único formato de download, decisão do Paulo).
O background não contém texto nem nome de ninguém — é só arte para o fundo do hero.

Fora do escopo
Contas de usuário / login.
Reservas / banco de dados (decidido: sem reservas). Todos podem escolher as mesmas opções; a semente sorteada (1 em 1 milhão) é que deixa cada resultado único.
Painel administrativo.
Geração de imagem bitmap por IA (cara e lenta). A IA, se entrar, só sugere parâmetros.
Stack
Front: React + Tailwind CSS (v4) com Vite, em JavaScript (JSX), na pasta web/. O código precisa ser legível para alunos iniciantes — ele também é material didático.
O gerador (web/src/lib/) é JS puro, sem React: funções puras config → SVG.
Identidade visual da Work in Tech (logo em web/public/logo.png): roxo #1A052E, lime #C1FF72, lavanda #F9F6FF; fontes Archivo Black (títulos) e Space Grotesk (texto).
Back: não há back nas fases 1–3 (o app é 100% front). Na Fase 4 (IA), um back mínimo só para esconder a chave — NestJS ou função serverless da Vercel, decidir quando chegar lá.
Geração em SVG no navegador. PNG exportado via <canvas> a partir do SVG.
Vercel para hospedagem do front.
Estrutura
web/
├─ index.html
├─ public/logo.png
└─ src/
   ├─ main.jsx / App.jsx  # liga UI ↔ gerador ↔ preview
   ├─ index.css           # Tailwind + tema Work in Tech
   ├─ components/         # Header, HeroPreview, Controls, ...
   └─ lib/                # JS puro, sem React
      ├─ random.js        # PRNG com semente (mulberry32)
      ├─ palette.js       # cor base → paletas dark e light (HSL)
      ├─ generate.js      # (config, tema) → string SVG
      ├─ export.js        # download do PNG 1920×1080 (via canvas)
      └─ styles/          # um arquivo por estilo, cada um exporta uma função pura
         ├─ helpers.js     # funções compartilhadas (posição, curvas, morros)
         └─ um arquivo por estilo (blobs.js, city.js, gamer.js...), registrado em generate.js
Regras do gerador
Determinístico: generate(config) é função pura. Mesma config → mesmo SVG, sempre.
Config (descreve o background por completo; a imagem sai sempre dela):
{ hue: 220, secondaryHue: 330, style: "blobs", seed: 123456, intensity: 0.5, softness: 0.6, textArea: "left" }
Tema: dark e light saem da mesma config; só a paleta muda. Preferir cores como variáveis CSS dentro do SVG para trocar de tema sem regenerar.
Formato: viewBox="0 0 1920 1080" com preserveAspectRatio="xMidYMid slice". Exportar só PNG 1920×1080.
Área do texto: cada estilo respeita textArea (left | center), mantendo essa região mais calma (menos formas e/ou uma máscara de suavização) para o título ser legível.
Contraste: o texto de exemplo do hero deve passar contraste WCAG AA nos dois temas.
Leveza: SVG final idealmente < 50 KB.
Fases (implementar uma por vez, eu testo entre cada uma)
Fase 1 — Gerador local
PRNG, paleta, 2 estilos (blobs e ondas), controles, botão "Gerar outro".
Preview em hero de exemplo com toggle dark/light.
Pronto quando: rodo localmente, mudo cor/estilo e vejo o hero atualizar na hora.
Fase 2 — Estilos e exportação
Estilos e temas (ver lista acima). Respeitar textArea.
Download em PNG 1920×1080.
Pronto quando: baixo o PNG e ele abre igual ao preview.
Fase 3 — Deploy
Deploy do front na Vercel.
Pronto quando: abro o link no celular e no computador e consigo gerar e baixar no computador (no celular o gerador fica escondido, com um aviso).
Fase 4 — IA (opcional, só se sobrar tempo)
Campo "descreva o que você quer" (ex: "ondas calmas tipo oceano").
Um endpoint de back (Nest ou serverless) chama a API do Claude (modelo claude-haiku-5-5) e devolve somente uma config JSON válida para o gerador (estilo, hue, intensity, softness, textArea).
Validar o JSON no servidor; se falhar, cair num estilo padrão.
Chave em variável de ambiente, nunca no front. Limitar requisições por IP.
Pronto quando: descrevo algo e o gerador aplica a sugestão; sem chave, o app segue funcionando.
Convenções
Comentários e textos da interface em português.
Funções pequenas, nomes claros, sem abstrações desnecessárias.
Front: sem dependências além de React, Vite e Tailwind. Back: o mínimo do Nest (+ SDK da Anthropic na fase 4).
Desktop: o gerador é usado só em computadores (não precisa otimizar para celular).
Como trabalhar comigo
Implementar uma fase por vez e parar para eu testar.
Antes de comandos de deploy, criar contas ou mexer em chaves: me perguntar.
Se algo for ficar complexo demais para o prazo, propor a alternativa mais simples.