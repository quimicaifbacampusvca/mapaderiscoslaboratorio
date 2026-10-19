# UIUX-0.9.1.2 — Identidade isolada do PWA no desktop

**Base oficial:** `bc61deb8e5152402fb243834b5e4f4232bcd16d0`  
**Escopo:** corrigir colisão de identidade entre PWAs no desktop, sem alterar o editor, JSON v4, projetos ou geometria.

## Diagnóstico

O manifesto anterior declarava `"id": "./"`. Conforme a definição do identificador do manifesto, o valor relativo é interpretado a partir da origem do `start_url`. Isso podia mapear vários aplicativos instalados na mesma origem para um mesmo identificador de raiz, apesar de seus caminhos distintos. Em consequência, o navegador poderia associar a instalação do Mapa de Riscos a outro PWA do mesmo domínio. O conflito exato do dispositivo do usuário não pôde ser reproduzido neste ambiente.

## Correção

- `id: /mapaderiscoslaboratorio/` é estável e explícito; `name: MRL — Mapa de Riscos do Laboratório` e `short_name: MRL · Riscos Lab`.
- `start_url: ./` e `scope: ./` permanecem relativos à pasta do aplicativo, tanto no GitHub Pages quanto no servidor portátil.
- O servidor Python e o fallback PowerShell da distribuição portátil passam a servir o aplicativo somente em `/mapaderiscoslaboratorio/`, não na raiz `/`.
- Mantida a porta 8765 para não trocar a origem do IndexedDB/localStorage já existente. Não há migração nem exclusão de projetos.
- Atualizado o cache do PWA para `uiux-0.9.1.2-pwa-identity-v1`.
- Scripts de testes de cache, validação HTTP e identidade atualizados.

## Testes executados

- **16/16 suítes Node aplicáveis** passaram, incluindo contrato de instalação PWA, rollback de cache, migração da biblioteca e nova regressão de identidade.
- **36/36 hashes SHA-256** da distribuição portátil verificados.
- **31/31 recursos HTTP** do pacote respondendo corretamente na rota dedicada, incluindo manifesto e service worker.
- **10/10 verificações negativas** de caminhos fora do pacote.
- Os arquivos enviados ao GitHub foram comparados por SHA com os testados na cópia local.

## Restrições

Não foi possível verificar a associação de PWAs instalados no desktop do usuário nem validar a remoção de um aplicativo já instalado no Edge/Chrome. Também continuam pendentes Firefox e WebKit. Se outro aplicativo usar efetivamente a mesma porta `127.0.0.1:8765`, não será possível executar os dois servidores simultaneamente: isso exige uma porta própria e transferência documentada dos projetos por JSON, a ser feita com aprovação do usuário.

## Orientações seguras para instalação anterior

1. Exportar os projetos relevantes para JSON e confirmar o arquivo.
2. Abrir a versão nova no endereço hospedado `https://quimicaifbacampusvca.github.io/mapaderiscoslaboratorio/` ou a versão portátil em `http://127.0.0.1:8765/mapaderiscoslaboratorio/`.
3. Remover apenas o atalho/instalação antiga e incorreta do Mapa de Riscos, sem marcar opção de apagar dados do site. Não desinstalar outro PWA funcional e não limpar dados da origem.
4. Instalar novamente o MRL a partir do endereço correto; conferir nome, ícone, janela e acesso à biblioteca.

Esta correção não inclui os desenhos experimentais Parede/Porta da UIUX-0.9.2.
