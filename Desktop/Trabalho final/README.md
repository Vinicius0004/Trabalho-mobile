## API utilizada

Base URL:

```text
https://dummyjson.com
```

Rotas usadas no projeto:

- `/auth/login`
- `/auth/me`
- `/products`
- `/products/add`
- `/products/search`

## Estrutura base do projeto

```text
/files
/logs
/resources
    /requests
        auth_keywords.robot
        produtos_keywords.robot
        rotas.robot
    base.robot
/tests
    auth_tests.robot
    produtos_get_tests.robot
    produtos_crud_tests.robot
    produtos_negativos_tests.robot
.gitignore
.gitlab-ci.yml
requirements.txt
README.md
```

## Instalação

```bash
python -m pip install -r requirements.txt
```

## Executar todos os testes

```bash
python -m robot -d logs tests/
```

## Executar por tags

Somente autenticação:

```bash
python -m robot -d logs -i auth tests/
```

Somente produtos:

```bash
python -m robot -d logs -i produtos tests/
```

Somente cenários negativos:

```bash
python -m robot -d logs -i negativo tests/
```

## Relatórios

Depois da execução, os relatórios ficam na pasta `logs`:

```text
logs/log.html
logs/report.html
logs/output.xml
```

## Cenários criados

### Autenticação

- Login válido
- Consulta de usuário autenticado
- Login inválido
- Login sem username
- Login sem password
- Consulta com token inválido
- Consulta sem token

### Produtos

- Listar produtos
- Buscar produto por ID
- Listar produtos com limite
- Pesquisar produto
- Criar produto com massa dinâmica
- Atualizar produto
- Deletar produto
- Buscar produto inexistente
- Atualizar produto inexistente
- Deletar produto inexistente

## Requisitos atendidos

- GET
- POST
- PUT
- DELETE
- Validação de status code
- Validação de JSON
- Validação de campos retornados
- Autenticação com Bearer Token
- Massa dinâmica
- Keywords reutilizáveis
- Cenários negativos
- Relatórios do Robot Framework
