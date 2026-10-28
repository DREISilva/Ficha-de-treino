# Caderno de Treino

Aplicativo web pessoal para consultar e editar a ficha A–F, registrar sessões e manter histórico no próprio aparelho.

## O que está incluído

- Treinos A–F e exercícios transcritos da imagem enviada, com opção de criar novos treinos.
- Edição dos treinos e exercícios, variações, séries planejadas, faixa de repetições e observações.
- Registro de carga e repetições por série, com salvamento automático.
- Conclusão de sessão, histórico e referência da sessão anterior.
- Jornada RPG local: criação de personagem, classes, níveis, XP e missões ligadas aos treinos concluídos.
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

Para corrigir o carregamento e publicar a jornada RPG, substitua todos os arquivos do app pelos desta pasta. No GitHub, abra o repositório, escolha **Add file → Upload files**, envie os arquivos extraídos (não apenas o ZIP) para a pasta principal e confirme em **Commit changes**.

Depois, abra novamente o endereço do site no mesmo celular e navegador. A atualização troca a versão em cache. Não use “limpar dados do site” nem desinstale o app durante a atualização: os registros de treino e o progresso RPG ficam armazenados localmente no navegador e podem ser apagados se os dados do site forem removidos.

## Observação sobre a ficha inicial

A imagem contém exercícios e variações, mas não contém prescrição de séries e repetições. Esses campos começam em branco para você preencher conforme sua ficha. O app não recomenda séries, repetições nem cargas.

## Mecânica RPG inicial

O jogador cria um personagem com nome e uma entre três classes visuais. Cada treino concluído rende 20 XP; cada 100 XP sobe um nível. Quatro missões sem prazo concedem XP extra: o primeiro treino, três treinos, completar a ficha A–F e registrar carga e repetições em cinco sessões. Descanso não reduz XP. O sistema não recomenda exercícios, cargas ou frequência de treino.
