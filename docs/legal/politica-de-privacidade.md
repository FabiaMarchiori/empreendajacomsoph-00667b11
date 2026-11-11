# Política de Privacidade e LGPD

Versão 1.0 · Atualização: 11 de novembro de 2026.

## 1. Quem atende você

Esta política explica o tratamento de dados no EmpreendaJá com Soph. A responsável pela plataforma informou o CNPJ **21.121.633/0001-28**. A denominação utilizada não representa confirmação do nome empresarial no cadastro oficial.

Para privacidade e exercício de direitos, use [acesso@empreendajacomsoph.com.br](mailto:acesso@empreendajacomsoph.com.br) ou [WhatsApp (11) 98334-8749](https://wa.me/5511983348749). Esse é o canal de atendimento da responsável; não se declara aqui a designação formal de encarregado.

## 2. Dados e finalidades

Tratamos dados necessários à operação dos recursos utilizados por você:

- **Cadastro e autenticação:** e-mail, nome, dados de autenticação e informações de sessão, para criar e proteger a conta, confirmar o e-mail, permitir login e recuperar o acesso.
- **Compras e assinaturas:** identificadores de cliente, contrato, pedido e produto, e-mail da compra, status, valores e datas recebidos da Kiwify, para reconhecer a contratação, conferir pagamento e disponibilizar o acesso correspondente. Os registros de eventos podem conter outros dados preenchidos no checkout e transmitidos pela Kiwify.
- **Perfil:** informações fornecidas para identificar a conta e personalizar a experiência, como nome e demais campos que você optar por preencher.
- **Gestão e precificação:** informações de produtos, custos, margens, canais, simulações e outros dados que você inserir nos módulos disponíveis, para executar cálculos, organizar o negócio e apresentar os resultados solicitados. Conforme o recurso, podem existir registros vinculados à conta no banco de dados ou preferências mantidas no navegador.
- **Soph IA:** mensagens da conversa e contexto enviado pelo aplicativo, como nome utilizado na interface, módulo e situação de acesso, para elaborar a resposta solicitada.
- **Operação e atendimento:** registros técnicos, solicitações de suporte e evidências necessárias para diagnosticar erros, prevenir fraudes, conciliar eventos de compra e responder dúvidas ou exercer direitos.

Não envie senhas, números completos de cartão ou informações desnecessárias pelos canais de atendimento ou pela Soph. Ao inserir dados de outras pessoas, observe a necessidade, a informação aos titulares e a base legal adequada.

## 3. Bases legais por finalidade

A LGPD não exige consentimento para todo tratamento. A base deve corresponder à operação efetivamente realizada:

- **Execução de contrato e procedimentos preliminares solicitados pelo titular — artigo 7º, V:** cadastro necessário à prestação, acesso aos benefícios contratados, gestão de compras, ferramentas utilizadas e resposta da Soph solicitada por você.
- **Cumprimento de obrigação legal ou regulatória — artigo 7º, II:** registros e informações que precisem ser mantidos ou apresentados por determinação aplicável.
- **Exercício regular de direitos — artigo 7º, VI:** documentação estritamente necessária a reclamações, disputas e defesa de direitos.
- **Legítimo interesse — artigo 7º, IX:** operações proporcionais de segurança, prevenção de uso indevido e suporte operacional, quando essa hipótese for adequada, com avaliação de necessidade, expectativas do titular e salvaguardas. Não é autorização para uso irrestrito ou publicidade não informada.
- **Consentimento — artigo 7º, I:** quando essa for a hipótese necessária para uma finalidade específica, deve ser livre, informado, destacado e revogável. Não se presume consentimento para marketing pela simples criação da conta.

Dados pessoais sensíveis têm regras próprias no **artigo 11 da LGPD**. O consentimento não é a única hipótese legal possível. A ferramenta não solicita informações sensíveis para orientações gerais; se uma operação envolver esses dados, deverá ser avaliada sob uma hipótese específica do artigo 11, com necessidade e proteção compatíveis. O legítimo interesse do artigo 7º não substitui essas exigências.

## 4. Mensagens da Soph e serviços de IA

Na implementação revisada, as mensagens são mantidas no estado da interface da conversa e transmitidas, com o contexto necessário, à função que consulta o **Lovable AI Gateway**, utilizando modelo do **Google Gemini**. Não foi identificada, nesse componente, gravação do histórico da conversa em tabela do Supabase.

Isso não significa retenção zero: o gateway, o provedor do modelo e a infraestrutura podem processar ou conservar dados conforme seus contratos e políticas. Não se afirma ausência de armazenamento, proibição de treinamento ou processamento exclusivamente no Brasil sem comprovação desses termos. Evite inserir segredos comerciais, documentos pessoais ou dados de terceiros que não sejam necessários. Consulte o [Aviso de Uso da Soph IA](/aviso-soph-ia).

## 5. Compartilhamento e fornecedores tecnológicos

Os dados são encaminhados conforme a finalidade do recurso:

- **Supabase:** autenticação, sessões, banco de dados e execução de funções do backend. Recebe dados de conta, registros comerciais e informações dos módulos que utilizam esse armazenamento.
- **Kiwify:** checkout, processamento de pagamento, contratação e eventos de assinatura. A plataforma recebe os dados de compra necessários à identificação e ao acesso. O ambiente de pagamento também segue as políticas da Kiwify.
- **Brevo:** envio de comunicações transacionais, como a mensagem de boas-vindas/acesso. Recebe os dados necessários ao destinatário e à mensagem, como e-mail e nome, e produz registros de entrega.
- **Netlify:** hospedagem e distribuição do aplicativo. Requisições podem gerar dados técnicos, como endereço IP, informações do navegador e registros de acesso.
- **Lovable AI Gateway e Google Gemini:** processamento das mensagens e do contexto da Soph para geração das respostas. A Lovable também integra o ambiente de desenvolvimento e prévia do aplicativo.
- **Google Fonts:** fornecimento das fontes visuais carregadas pelo aplicativo; a conexão externa pode transmitir dados técnicos da requisição, como IP e características do navegador. Carregar uma fonte não é, por si só, comprovação de um rastreador publicitário.

Também pode haver comunicação a autoridades ou destinatários necessários para cumprir exigência legal ou exercer direitos, nos limites aplicáveis. A qualificação de cada fornecedor como operador ou controlador depende do tratamento e dos contratos; não se presume que todos atuem sob o mesmo papel.

## 6. Armazenamento, segurança e retenção

A arquitetura utiliza recursos de autenticação, controle de acesso e comunicação por HTTPS. Medidas de segurança reduzem riscos, mas não eliminam incidentes. A apuração e as comunicações cabíveis devem observar as obrigações legais e o risco para os titulares.

A retenção considera a finalidade de cada categoria, a duração da relação contratual, a necessidade de conciliar pagamentos e atendimento, obrigações legais e o exercício regular de direitos. Não há um prazo único aplicável a todos os dados, e este documento não atribui períodos ainda não confirmados.

Encerrada a necessidade e inexistindo obrigação ou outra hipótese que justifique conservação, deve ocorrer eliminação ou anonimização adequada. Solicitações são analisadas por categoria; apagar a conta não implica eliminar imediatamente registros que devam ser preservados por lei, nem torna instantânea a remoção em todos os ciclos de backup dos fornecedores. O canal de privacidade pode esclarecer os critérios aplicáveis ao seu caso.

## 7. Transferências internacionais

A infraestrutura e os serviços integrados podem envolver tratamento fora do Brasil. Não se garante localização exclusivamente nacional. Transferências internacionais devem observar o capítulo V da LGPD e os mecanismos legais pertinentes, conforme o caso, como cláusulas contratuais adequadas ou outras hipóteses admitidas. Informações sobre os destinos e as garantias aplicáveis podem ser solicitadas ao canal de privacidade.

## 8. Direitos dos titulares

Nos termos da LGPD, você pode solicitar, conforme o tratamento e as hipóteses legais:

- confirmação da existência de tratamento e acesso;
- correção de dados incompletos, inexatos ou desatualizados;
- anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;
- portabilidade, observada a regulamentação aplicável;
- informação sobre compartilhamentos;
- informação sobre a possibilidade de não consentir e suas consequências, quando o consentimento for solicitado;
- revogação do consentimento e eliminação dos dados tratados com essa base, ressalvadas as hipóteses legais de conservação;
- oposição nos casos previstos em lei e revisão de decisões tomadas unicamente com base em tratamento automatizado que afetem seus interesses.

Escreva para [acesso@empreendajacomsoph.com.br](mailto:acesso@empreendajacomsoph.com.br). Ao receber uma solicitação, registramos o pedido, confirmamos a identidade de forma proporcional, identificamos os sistemas e serviços envolvidos, avaliamos o direito solicitado e eventuais hipóteses legais de conservação e respondemos conforme os prazos aplicáveis. Poderemos pedir informações adicionais estritamente necessárias para localizar os dados. Não envie sua senha. Se houver limitação legal, explicaremos o motivo. Você também pode recorrer à ANPD e aos órgãos de defesa do consumidor.

## 9. Armazenamento no dispositivo e atualizações

Sessão, preferências, checklists e cache do PWA são detalhados na [Política de Cookies e Armazenamento Local](/cookies). Esta política deve ser revista quando os tratamentos ou fornecedores mudarem, com informação adequada sobre alterações relevantes e respeito aos direitos existentes.
