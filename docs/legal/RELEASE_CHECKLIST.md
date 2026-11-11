# Checklist de publicação das políticas jurídicas

**Status: conteúdo e interface preparados para publicação no aplicativo.** Esta entrega corresponde exclusivamente ao PR #5 e à branch `codex/politica-juridica`, criada a partir da `main`. Não incorpora as Etapas 1 e 2 do PR #4.

## Decisões e informações confirmadas pela responsável

- Identificação e contatos conforme informados pela responsável: EmpreendaJá com Soph, CNPJ 21.121.633/0001-28, acesso@empreendajacomsoph.com.br e WhatsApp (11) 98334-8749.
- Matriz comercial descrita nos Termos: Ecossistema/Anual/Mensal com Soph IA, ERP e funcionalidades do Ecossistema; Bolsas, Mochilas e Malas com nicho de Bolsas e Soph IA; ERP no plano Bolsas somente por concessão promocional individual.
- Página de vendas e checkout Kiwify conferidos por capturas fornecidas em 11/11/2026. O checkout apresenta cartão, boleto e Pix Automático; o plano anual está configurado como recorrente, com parcelamento disponível. Os valores e ofertas podem mudar e, por isso, não são fixados nestas políticas.
- Renovação descrita por meio de pagamento: cartão e Pix Automático com cobrança recorrente; boleto e Pix manual com pagamento manual por ciclo. O Pix Automático é o padrão das novas assinaturas via Pix na Kiwify, sujeito às configurações/compatibilidade do checkout.
- Cancelamento pode ser solicitado a qualquer momento. Cancelar a recorrência impede novas renovações e não equivale a reembolso automático. O direito de arrependimento e os demais direitos legais são preservados.
- A responsável aprovou o procedimento operacional para solicitações LGPD: receber por e-mail, registrar, confirmar identidade de forma proporcional, verificar sistemas/serviços envolvidos e responder conforme os direitos e prazos aplicáveis.
- A responsável dispensou a revisão jurídica profissional externa para esta publicação. Isso não constitui certificação de conformidade nem parecer jurídico.

## Transparência e limites do conteúdo

- A Política de Privacidade descreve finalidades, bases legais, fornecedores identificados no código, direitos, critérios de retenção e a possibilidade de tratamento internacional por fornecedores tecnológicos. Não promete retenção zero, ausência de treinamento ou processamento exclusivamente no Brasil sem comprovação contratual.
- A Política de Cookies descreve os mecanismos encontrados no repositório: cookie funcional `sidebar:state`, localStorage, Service Worker/Cache API e Google Fonts. A busca no código não identificou scripts explícitos de analytics ou publicidade. Essa análise não equivale a inspeção de todas as configurações externas da hospedagem ou de scripts injetados por painéis de terceiros.
- Os textos não inventam prazos fixos de retenção nem afirmam que todos os fornecedores têm o mesmo papel jurídico.
- Não foi implementado checkbox nem registro técnico de aceite/versionamento dos termos. A interface apenas disponibiliza os documentos publicamente; não se deve afirmar que ela coleta aceite formal.

## Interface e escopo publicados no PR #5

Rotas públicas: `/termos`, `/privacidade`, `/cookies`, `/cancelamento-reembolso` e `/aviso-soph-ia`. Os documentos ficam acessíveis sem login ou assinatura. Links foram adicionados ao Footer e à tela de Login/Cadastro.

A publicação do PR #5 altera apenas documentos, páginas jurídicas, navegação, Footer/Login e testes correspondentes. Não altera Supabase, migrations, Edge Functions, Kiwify, Brevo, secrets, assinaturas, autenticação, permissões, fornecedores, precificação, Soph funcional ou ERP funcional.

A página de vendas externa e as configurações do checkout Kiwify não foram alteradas por este PR. A responsável fará a atualização dos benefícios na página de vendas. Os documentos devem ser acessados pelos links públicos do aplicativo; eventual inclusão de links adicionais no checkout/página de vendas é uma alteração separada nesses ambientes.

## Validação técnica

- 15 testes da aplicação aprovados: 10 jurídicos e 5 existentes na main.
- 30 testes de navegador aprovados em Chromium, mobile e desktop, incluindo acesso público, navegação entre documentos, Footer/Login/Cadastro, recuperação de senha e proteções existentes.
- Reflow em 320 px, contraste de texto, títulos/landmarks, foco visível, teclado e contatos clicáveis verificados. Isso não constitui auditoria completa de conformidade WCAG.
- Build de produção, TypeScript, lint dos arquivos alterados e `git diff --check` aprovados.
- A mesma suíte de 30 testes passou contra o preview Netlify `https://deploy-preview-5--appempreendajacomsoph.netlify.app`, com APIs externas simuladas. Não foram realizados pagamentos, chamadas reais de IA, webhooks ou envios de e-mail.

## Publicação e reversão

- PR separado: [#5](https://github.com/FabiaMarchiori/empreendajacomsoph-00667b11/pull/5).
- Preview: https://deploy-preview-5--appempreendajacomsoph.netlify.app.
- O merge do PR #5 publica somente as páginas e os documentos jurídicos no aplicativo por meio do fluxo normal da branch `main`/Netlify.
- O PR #4, que contém alterações de permissões e assinaturas, permanece separado e não será incorporado por esta publicação.
- A reversão do PR #5 é feita por reversão do commit de interface/documentos; não requer operação no banco nem altera dados de clientes.
