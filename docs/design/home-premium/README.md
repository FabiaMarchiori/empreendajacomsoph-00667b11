# Inspeção do kit visual da Home

Organização somente de recursos na branch `codex/redesign-home-premium`; nenhum componente ou integração alterado.

## Resultado

- 24 PNGs decodificados integralmente e verificados pelo Pillow, sem erro de integridade. Cópias conferidas por SHA-256; nomes, bytes, qualidade e canal alfa preservados.
- Nenhuma duplicata exata por arquivo nem por pixels RGBA decodificados.
- 19 ícones possuem transparência efetiva; Heroes e referências são opacas, inclusive quando o modo é RGBA. Não há fundo retangular opaco nos ícones.
- Inspeção visual de todos os ícones sobre branco, cinza e azul-escuro: sem halo retangular ou fundo sólido residual evidente na escala de prévia (até 290 px). Brilhos e sombras acompanham os objetos. Há pequenas irregularidades de contorno, especialmente à direita do círculo Estruture seu Negócio; revisar em escala nativa antes da aprovação visual definitiva. A inspeção não certifica ausência de artefatos em qualquer escala.
- Cards, botões de rodapé e demais círculos: disponíveis para prototipação; confirmar bordas no tamanho final de exibição. Nenhum retoque realizado.
- Hero desktop: íntegra e disponível; conferir composição na implementação autorizada.
- Hero mobile: proposta horizontal (1752 × 897), pendente de validação responsiva no navegador. Nenhum corte ou reenquadramento aplicado.
- Card Central de Fornecedores tem alfa máximo 254 (não 255); conteúdo quase opaco, preservado como recebido. Demais ícones também contêm muitos pixels parcialmente transparentes. Isso, isoladamente, não comprova defeito.
- O manifesto original está desatualizado: nomes das Heroes/círculos divergem; Hero desktop real é 2172 × 724 e círculos reais são 512 × 512. Tamanhos reais constam abaixo e no inventory.json.
- Os cinco recursos de rodapé adicionais estão em `src/assets/home/navigation/`, separados dos nove cards. As três referências estão exclusivamente em `docs/design/home-premium/references/`.
- Metadados recebidos preservados em `original-metadata/` como documentos de origem, sem tratá-los como autorização para implementar.

## Inventário medido

Dimensões em pixels; tamanho exato em bytes. Todos os arquivos são PNG.

| Caminho final | Dimensões | Bytes | Modo | Transparência efetiva |
|---|---:|---:|---|---|
| `src/assets/home/navigation/Imagem do botão do rodape - Home.png` | 1254 × 1254 | 939516 | RGBA | Sim |
| `src/assets/home/navigation/Imagem do botão do rodape Fornecedores.png` | 1254 × 1254 | 973848 | RGBA | Sim |
| `src/assets/home/navigation/Imagem do botão do rodape Gestão.png` | 1254 × 1254 | 1062458 | RGBA | Sim |
| `src/assets/home/navigation/Imagem do botão do rodape Mais.png` | 1254 × 1254 | 773149 | RGBA | Sim |
| `src/assets/home/navigation/Imagem do botão do rodape Vendas.png` | 1254 × 1254 | 1010226 | RGBA | Sim |
| `src/assets/home/cards/01-central-fornecedores.png` | 1536 × 1024 | 1598550 | RGBA | Sim |
| `src/assets/home/cards/02-abrir-mei.png` | 1254 × 1254 | 1132181 | RGBA | Sim |
| `src/assets/home/cards/03-identidade-visual.png` | 1254 × 1254 | 1182044 | RGBA | Sim |
| `src/assets/home/cards/04-registrar-marca.png` | 1402 × 1122 | 924669 | RGBA | Sim |
| `src/assets/home/cards/05-dominio-site.png` | 1254 × 1254 | 1061417 | RGBA | Sim |
| `src/assets/home/cards/06-marketplaces.png` | 1254 × 1254 | 1118704 | RGBA | Sim |
| `src/assets/home/cards/07-erp.png` | 1254 × 1254 | 1123785 | RGBA | Sim |
| `src/assets/home/cards/08-precificacao.png` | 1254 × 1254 | 900762 | RGBA | Sim |
| `src/assets/home/cards/09-soph-ia.png` | 1254 × 1254 | 1139510 | RGBA | Sim |
| `src/assets/home/categories/01-Botão circular fornecedores.png` | 512 × 512 | 209726 | RGBA | Sim |
| `src/assets/home/categories/02- Botão circular estruture-seu-negocio.png` | 512 × 512 | 226049 | RGBA | Sim |
| `src/assets/home/categories/03-Botão circular  vendas-e-presenca.png` | 512 × 512 | 198097 | RGBA | Sim |
| `src/assets/home/categories/04- Botão circular  gestao-do-negocio.png` | 512 × 512 | 170244 | RGBA | Sim |
| `src/assets/home/categories/05- Botão circular  soph-socia-digital.png` | 512 × 512 | 216302 | RGBA | Sim |
| `src/assets/home/hero/Desktop 01.png` | 2172 × 724 | 2997785 | RGBA | Não |
| `src/assets/home/hero/Versão Mobile.png` | 1752 × 897 | 2905546 | RGBA | Não |
| `docs/design/home-premium/references/Imagem de Referencia - Novo desing Mobile.png` | 1024 × 1536 | 1610856 | RGB | Não |
| `docs/design/home-premium/references/home-desktop.png` | 2048 × 1523 | 357433 | RGBA | Não |
| `docs/design/home-premium/references/home-mobile.png` | 683 × 2048 | 310564 | RGBA | Não |
