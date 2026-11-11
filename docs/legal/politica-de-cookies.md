# Política de Cookies e Armazenamento Local

Versão 1.0 · Atualização: 11 de novembro de 2026.

## 1. O que esta política abrange

Esta página descreve os mecanismos encontrados no código do EmpreendaJá com Soph revisado para esta versão. **Cookie, localStorage e Cache API são tecnologias diferentes.** Não chamamos toda persistência no navegador de cookie nem presumimos a presença de ferramentas de publicidade.

A responsável informou o CNPJ **21.121.633/0001-28**. Para dúvidas: [acesso@empreendajacomsoph.com.br](mailto:acesso@empreendajacomsoph.com.br) ou [WhatsApp (11) 98334-8749](https://wa.me/5511983348749).

## 2. Cookie funcional identificado

O componente de navegação registra o cookie próprio **`sidebar:state`** ao abrir ou fechar o menu lateral. Ele contém o estado aberto/fechado e tem duração configurada de **sete dias**. É uma preferência funcional de interface; não foi identificado nesse código uso desse cookie para medir audiência ou publicidade.

A avaliação jurídica de necessidade e proporcionalidade dessa preferência deve considerar seu uso efetivo. Não se utiliza a categoria “funcional” como autorização para rastrear a pessoa usuária. Você pode remover ou bloquear o cookie nas configurações do navegador.

## 3. Sessão em localStorage

O aplicativo utiliza **localStorage**, e não um cookie de autenticação próprio identificado no cliente revisado, para persistir informações da sessão do Supabase. Isso permite continuar autenticada entre acessos, com o fluxo de renovação de sessão do serviço. A permanência dos dados locais e a validade de uma sessão são coisas diferentes: remover o armazenamento não equivale a cancelar uma assinatura.

Em prévias integradas ao editor Lovable, o código também permite sincronizar o armazenamento da sessão com o editor autorizado. Esse mecanismo de prévia não é uma ferramenta de análise de audiência.

## 4. Outras preferências locais

Também foram encontradas estas chaves de localStorage:

- **`importadoras25_favorites`:** lista de favoritos da ferramenta correspondente;
- **`empreendaja_last_page`:** referência para continuidade da navegação;
- **`abrir-mei-checklist`, `logo-marca-checklist` e `registrar-marca-checklist`:** progresso dos respectivos checklists.

Esses registros não têm prazo automático de expiração definido nesses trechos do código. Podem permanecer no dispositivo até alteração ou limpeza pelo aplicativo/navegador. Quem compartilha um dispositivo deve considerar que preferências locais podem continuar nele após o uso.

## 5. PWA, Service Worker e Cache API

O PWA utiliza Service Worker e **Cache API** para recursos do aplicativo, como a estrutura inicial e ícones. O código revisado restringe esse cache a recursos selecionados da própria origem; isso não é um cookie e não demonstra armazenamento de todo o banco ou de toda conversa da Soph no dispositivo.

A disponibilidade offline é limitada aos recursos efetivamente guardados. Apagar os dados do site pode remover esses recursos. O cache é gerenciado por versões e pela limpeza do navegador; não se atribui aqui um prazo fixo não definido no código.

## 6. Scripts externos e rastreamento

Não foram encontrados scripts explícitos de **Google Analytics, Google Tag Manager, Meta Pixel, Hotjar, Clarity, PostHog ou Segment** no código revisado. Também não foi identificado uso de sessionStorage nos arquivos da aplicação examinados. Isso não substitui a conferência das configurações da hospedagem, do checkout, de páginas externas ou de scripts que venham a ser adicionados posteriormente.

O aplicativo carrega fontes pelo **Google Fonts**, o que gera uma requisição externa. Esse carregamento pode transmitir dados técnicos, como IP e informações do navegador; não é apresentado como prova de cookies analíticos ou publicitários. Links para Kiwify, WhatsApp e outros serviços levam a ambientes sujeitos às respectivas políticas.

Esta implementação não acrescenta rastreadores ou um banner genérico de consentimento. Se forem introduzidas tecnologias não necessárias que dependam de consentimento, elas deverão permanecer desativadas até uma escolha válida, com opções acessíveis de aceitar, rejeitar e personalizar, revisão posterior e registro da versão da escolha. Publicidade ou análise de audiência não são autorizadas por este texto.

## 7. Como gerenciar

Nas configurações de privacidade do seu navegador, você pode consultar e excluir cookies e dados do site, bloquear armazenamento e gerenciar permissões. A limpeza pode encerrar a sessão, apagar favoritos e progresso local e retirar recursos offline. Guarde informações que precise conservar antes da limpeza.

Sair da conta, limpar dados locais, excluir a conta e cancelar cobranças são procedimentos distintos. Para encerrar renovações, consulte [Cancelamento, Reembolso e Renovação](/cancelamento-reembolso). Para direitos sobre dados pessoais, consulte a [Política de Privacidade](/privacidade).
