# MVP Scope

## Objetivo do MVP

Entregar uma primeira versão utilizável do Bolso em Dia, com autenticação, isolamento por usuário, cadastro de gastos, leitura inicial de comprovante Pix, confirmação antes de salvar e dashboard básica responsiva/mobile-first.

## Entra na primeira versão

1. Cadastro manual de gastos.
2. Listagem simples de gastos.
3. Dashboard básica.
4. Upload de comprovante Pix.
5. Extração OCR.
6. Tela ou etapa de confirmação do gasto extraído.
7. Categoria e tipo sugeridos por palavras-chave na revisão inicial, sempre editáveis.
8. Forma de pagamento manual na revisão inicial.
9. Filtros básicos.
10. Autenticação e isolamento de dados por usuário.
11. Proteção básica de comprovantes enviados.
12. Layout responsivo para celular e computador.
13. Telas de login, cadastro de conta e logout.
14. Área unificada de lançamentos com nova despesa, novo comprovante e extrato.

## Fica para depois

- Dashboard avançada com comparações mais profundas.
- Login social.
- Recuperação de senha avançada.
- Perfil completo.
- Permissões de administrador.
- Compartilhamento de gastos.
- Regras inteligentes mais sofisticadas.
- Relatórios exportáveis.
- Notificações.
- Offline completo.
- Integração direta com bancos.
- Compartilhamento familiar.
- Limites por categoria com alertas avançados.

## Não será feito agora

- Deploy.
- Integração real com serviço externo de OCR.
- PDF no upload de comprovantes.
- Sugestão automática avançada de categoria no fluxo unificado de lançamentos.
- IA externa, aprendizado por histórico e PDF para comprovantes.
- Aplicativo nativo.
- Cobrança ou assinatura.
- Dashboard avançada.
- Gráficos avançados.

## Riscos do MVP

- OCR pode errar dados importantes.
- Upload de comprovante exige cuidado de segurança desde o início.
- Dashboard pode ficar poluída se tentar mostrar informação demais.
- Sugestões automáticas podem parecer definitivas se a interface não deixar claro que são editáveis.
- Sem RLS correta, há risco grave de vazamento entre usuários.
- Sem autenticação real, o cadastro manual não pode ser considerado completo.
- Armazenamento local temporário não é seguro para multiusuário.
- Performance de filtros pode piorar sem índices quando o volume crescer.
- Interface pode parecer pronta no desktop e quebrar no celular se responsividade não for testada.

## Critérios para considerar o MVP pronto

- Usuário autenticado consegue cadastrar gasto manual.
- Usuário autenticado consegue listar os próprios gastos.
- Usuário consegue criar conta, entrar e sair.
- Usuário não autenticado não consegue acessar cadastro/listagem de gastos.
- Usuário consegue enviar comprovante Pix válido.
- Sistema extrai pelo menos valor, data e recebedor quando possível.
- Sistema exibe etapa de confirmação antes de salvar gasto extraído.
- Usuário consegue corrigir dados extraídos.
- Sistema permite preencher categoria, tipo e forma de pagamento antes de confirmar o gasto extraído.
- Sistema pode sugerir categoria e tipo por palavra-chave, sem impedir correção manual.
- Dashboard mostra total do mês e filtros básicos.
- Usuário não consegue acessar dados de outro usuário.
- Comprovante privado não fica público.
- Fluxo principal funciona bem no celular.
- Fluxo principal funciona bem no computador.

## Assumptions

- O MVP pode usar regras simples de classificação antes de qualquer modelo mais avançado.
- A dashboard básica pode começar com cards e filtros, deixando gráficos mais ricos para fatias futuras.
- A primeira fatia corrigida deve priorizar Auth + cadastro/listagem por usuário antes de Pix/OCR.
