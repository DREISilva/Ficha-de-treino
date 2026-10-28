# Caderno de Treino

Aplicativo web pessoal para consultar e editar a ficha A–F, registrar sessões e manter histórico no próprio aparelho.

## O que está incluído

- Treinos A–F e exercícios transcritos da imagem enviada, com opção de criar novos treinos.
- Edição dos treinos e exercícios, variações, séries planejadas, faixa de repetições e observações.
- Exclusão confirmada de exercícios e missões da ficha; as sessões concluídas permanecem no histórico.
- Registro de carga e repetições por série, com salvamento automático.
- Conclusão de sessão, histórico e referência da sessão anterior.
- Jornada RPG em pixel art com escolha de personagem mulher ou homem, classes Arqueiro, Explorador e Alquimista, progressão até o nível 10 e campanha de missões recorrentes.
- Exportação e restauração de backup JSON.
- Interface adaptada ao celular e arquivos preparados para funcionamento offline depois da primeira visita.

## Dados e privacidade

O app não tem conta, servidor de dados nem sincronização. A ficha, o histórico e a jornada RPG ficam no armazenamento local do navegador deste aparelho. O código do site pode ficar público quando hospedado gratuitamente; os registros de treino não são enviados ao repositório. Exporte backups e guarde-os em local seguro.

O armazenamento local pode ser apagado se os dados do site forem removidos no navegador ou se houver perda do aparelho. Abrir o mesmo app em outro aparelho não transfere os dados automaticamente.

## Como publicar sem pagar com GitHub Pages

A publicação requer uma conta GitHub e um repositório público. Os arquivos deste diretório são o conteúdo a publicar.

1. Crie um repositório público no GitHub, por exemplo `caderno-de-treino`.
2. Envie todos os arquivos deste diretório para a pasta principal do repositório: `index.html`, `app.js`, `styles.css`, `manifest.json`, `service-worker.js` e `icon.svg`.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha publicar a partir da branch principal e da pasta `/ (root)`, e salve.
5. Aguarde a publicação e abra no celular o endereço `https://SEU-USUARIO.github.io/caderno-de-treino/`.
6. No menu do navegador, escolha **Adicionar à tela inicial** ou **Instalar app**, se essa opção aparecer.
7. Abra o app uma vez com internet. Depois disso, os arquivos principais ficam disponíveis para uso offline no mesmo navegador.

O GitHub Pages está disponível gratuitamente para repositórios públicos no plano gratuito do GitHub. O código-fonte publicado será visível a qualquer pessoa. Não coloque dados pessoais ou arquivos de backup dentro do repositório.

## Atualizar a versão publicada

Para publicar esta atualização em pixel art, substitua todos os arquivos do app pelos desta pasta, incluindo a pasta `assets`. No GitHub, abra o repositório, escolha **Add file → Upload files**, envie todos os arquivos e a pasta `assets` extraídos do ZIP para a pasta principal e confirme em **Commit changes**.

Depois, abra novamente o endereço do site no mesmo celular e navegador. A atualização troca a versão em cache. Não use “limpar dados do site” nem desinstale o app durante a atualização: os registros de treino e o progresso RPG ficam armazenados localmente no navegador e podem ser apagados se os dados do site forem removidos.

## Observação sobre a ficha inicial

A imagem contém exercícios e variações, mas não contém prescrição de séries e repetições. Esses campos começam em branco para você preencher conforme sua ficha. O app não recomenda séries, repetições nem cargas.

## Campanha RPG

Crie um personagem mulher ou homem e escolha entre Arqueiro, Explorador ou Alquimista. Cada combinação tem um retrato pixelado. O app oferece 10 marcos únicos e uma missão recorrente que reinicia a cada dois treinos concluídos. Cada sessão também concede 20 XP. A progressão chega ao nível 10 após 5.650 XP; em torno de três treinos por semana, a campanha foi calibrada para durar aproximadamente um ano. Não há prazo, perda de XP por descanso nem atualização automática por calendário.

A campanha é salva localmente. O mesmo personagem não sincroniza automaticamente entre aparelhos ou navegadores.

## Remoção de itens da ficha

Para excluir um exercício, abra a missão, escolha **Editar ficha** e use **Excluir exercício** no cartão correspondente. Para apagar um treino, toque em **⌫ Excluir treino** no próprio cartão do mapa ou em **Excluir missão** dentro da edição. O app pede confirmação; o histórico concluído é mantido. Se houver uma sessão em andamento, o aviso explica que ela também será descartada caso a exclusão seja confirmada.
