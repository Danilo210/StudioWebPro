# StudioWeb Pro

**Editor profissional de HTML, CSS e JavaScript diretamente no navegador**, com edição de código e visual, explorador de arquivos, prévia interativa, importação/exportação de projetos e persistência local.

## Como abrir

1. Extraia **todo o ZIP da ferramenta**, mantendo as pastas `css`, `js` e `vendor`.
2. Abra o arquivo **`index.html`** com Chrome, Edge ou Firefox atuais.
3. Para mais compatibilidade com armazenamento local, APIs web e isolamento da prévia, prefira abrir via servidor estático. No Windows, execute `iniciar_windows.bat` (precisa de Python 3), ou rode `python -m http.server 8765` na pasta e acesse `http://localhost:8765`.
4. Não precisa instalar bibliotecas, baixar pacotes, criar contas ou configurar banco de dados. **CodeMirror e JSZip acompanham a ferramenta e funcionam offline.**

> Algumas políticas de segurança de navegadores podem restringir armazenamento ou APIs quando um arquivo é aberto por `file://`. Usar `localhost` é a opção mais confiável. Se o navegador não permitir persistência, exporte o projeto em ZIP.

## Funcionalidades

- **Código**: editor com realce de tags HTML, atributos, CSS e JavaScript, numeração de linhas, seleção e correspondência de tags/chaves, preenchimento automático, fechamento automático de tags e delimitadores, comentários, desdobramento de blocos, múltiplas abas, undo/redo e comandos de busca.
- **Design**: escolha o modo *Design*, clique em um elemento para editar ID, classes, links, fonte de imagem, CSS inline e texto (para elementos sem filhos). Dê **duplo clique** em um elemento de texto da prévia para editar seu conteúdo diretamente e clique fora para aplicar a alteração ao HTML.
- **Dividir**: código à esquerda e página renderizada à direita, com divisor ajustável. Alterações nos arquivos ligados ao documento HTML aparecem na prévia.
- **Prévia**: modos desktop, tablet (768px) e celular (390px), botão de atualizar, nova aba isolada, navegação entre arquivos HTML do projeto, console de JavaScript e inspeção básica de referências/erros de sintaxe.
- **Arquivos e pastas**: criar, renomear, excluir, mover por arrastar-e-soltar no explorador, selecionar pastas, importar arquivos individualmente ou pastas inteiras e visualizar recursos gráficos.
- **Projetos**: importar projeto ZIP, exportar todos os arquivos e subpastas como ZIP, baixar apenas o arquivo ativo, criar projeto do zero e salvar automaticamente no navegador com **IndexedDB** (ou armazenamento alternativo, conforme disponibilidade).
- **Temas**: claro e escuro, inclusive no editor de código.
- **Pesquisa**: localizar texto nos arquivos ou no projeto inteiro, substituir texto e abrir arquivos rapidamente.

## Atalhos

| Atalho | Ação |
|---|---|
| `Ctrl+S` | Salvar projeto no armazenamento do navegador |
| `Ctrl+Shift+S` | Exportar projeto ZIP |
| `Ctrl+N` | Novo arquivo |
| `Ctrl+O` | Importar arquivo(s) |
| `Ctrl+P` | Abrir arquivo rapidamente |
| `Ctrl+F` | Buscar no arquivo ativo |
| `Ctrl+H` | Substituir no arquivo |
| `Ctrl+Shift+F` | Buscar em todo o projeto |
| `Ctrl+Espaço` | Autocompletar código |
| `Ctrl+/` | Comentar/descomentar seleção |
| `Alt+G` | Ir para linha |
| `Ctrl+Z / Ctrl+Y` | Desfazer / refazer |

Nos dispositivos Mac, use `Cmd` nos atalhos equivalentes quando aplicável.

## Como os arquivos se comunicam

Os arquivos HTML do projeto podem carregar CSS, JS e imagens usando **caminhos relativos**, como em um site comum:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles/style.css">
</head>
<body>
  <h1>Meu projeto</h1>
  <img src="assets/foto.png" alt="Minha foto">
  <script src="scripts/app.js"></script>
</body>
</html>
```

Ao editar `styles/style.css`, o HTML que o referencia recebe as alterações na prévia; o mesmo vale para `scripts/app.js`. Se você abrir `sobre.html` em uma aba e navegar pelo link na prévia, o editor passa para essa página. **Aba é a interface de edição de um arquivo**, não uma página de browser independente.

O motor de prévia substitui referências a recursos **presentes no projeto virtual** por conteúdo adequado dentro de um `iframe` isolado. Os arquivos exportados têm referências relativas originais, para funcionar em hospedagens estáticas.

**Arquivos importados:** HTML, HTM, CSS, JS, MJS, JSON, TXT, MD, XML, SVG, PNG, JPG, GIF, WEBP, ICO, AVIF, fontes comuns e outros tipos leves autorizados pelo seletor. Limites de segurança: importação avulsa de até 500 arquivos / 65 MB por lote / 12 MB por arquivo; ZIP de até 35 MB compactados e 70 MB de conteúdo compatível descompactado.

## Publicação / hospedagem

- Para publicar **um site criado na ferramenta**, escolha **Exportar projeto**, extraia o ZIP e envie as pastas e os arquivos para a raiz pública do seu provedor (ex.: `htdocs` no InfinityFree). O `index.html` deve ficar no diretório principal do site.
- Para publicar **o próprio editor**, envie todos os arquivos desta pasta (inclusive `vendor`) para seu provedor de páginas estáticas. O editor usa armazenamento **local por navegador/origem**, não sincroniza projetos entre visitantes ou computadores.
- Para editar um projeto em outro computador, exporte o ZIP e importe no editor do outro computador.

## Limitações técnicas importantes

Este é um **IDE front-end**, não um servidor/backend. A prévia foi projetada para HTML + CSS + JavaScript clássico, URLs relativas e recursos binários embutidos. Recursos como PHP, WordPress, banco de dados, `fetch()` de arquivos virtuais, ES modules locais com `import`/`export`, NPM, Vite, APIs de backend e rotas de servidor **precisam de um ambiente de execução real** e não são emulados no `iframe`. Bibliotecas externas via CDN dependem de conexão e de políticas de CORS/CSP do recurso.

A edição visual atual permite selecionar elementos, alterar atributos/estilos, editar texto e aplicar as mudanças ao HTML. **Não é um construtor drag-and-drop com layout absoluto** e não inclui os motores completos de design, FTP ou depuração remota do Adobe Dreamweaver. Ajustes visuais podem normalizar a formatação original do HTML ao atualizar seus elementos; use o botão desfazer do editor quando necessário.

Por segurança, a prévia executa JavaScript dentro de `iframe` com `sandbox`, **sem permissão de acesso direto ao armazenamento ou DOM do editor**. Projetos desconhecidos podem conter código malicioso; abra ZIPs somente de origens confiáveis. Recursos externos carregados pela página ainda podem realizar solicitações de rede. Evite incluir senhas e tokens diretamente nos arquivos HTML/JS.

Os dados locais dependem do perfil e do armazenamento do navegador: limpar os dados do site, usar modo privativo ou mudar a origem (por exemplo, trocar `file://` por `localhost`) pode fazer o editor apresentar um espaço de trabalho diferente. **Exporte ZIPs como backup de seus projetos.**

## Estrutura da ferramenta

```
StudioWeb_Pro/
├── index.html                # Interface principal
├── favicon.svg               # Ícone da aplicação
├── css/app.css               # Visual e temas
├── js/app.js                 # Explorador, abas, importação, exportação, persistência
├── js/preview.js             # Motor de prévia e edição visual
├── vendor/codemirror/        # Editor com realce de sintaxe (versão local)
├── vendor/jszip/             # Compactação e leitura ZIP (versão local)
├── iniciar_windows.bat       # Inicialização opcional via servidor HTTP
└── README.md                 # Este manual
```

## Licenças

StudioWeb Pro é uma implementação independente. Usa **CodeMirror 5** (MIT) e **JSZip** (MIT ou GPLv3, conforme distribuição). Consulte `LICENCAS_TERCEIROS.md` e `vendor/jszip/LICENSE.markdown`.
