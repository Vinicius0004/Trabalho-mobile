*** Settings ***
Documentation     Testes negativos de produtos.
Resource          ../resources/base.robot
Resource          ../resources/requests/produtos_keywords.robot
Suite Setup       Abrir Sessao Da API
Test Tags         produtos    negativo

*** Test Cases ***
Buscar produto inexistente deve retornar 404
    [Tags]    get    recurso_inexistente
    ${response}=    Buscar Produto Pelo ID    ${PRODUTO_ID_INVALIDO}
    Verificar Produto Nao Encontrado    ${response}

Atualizar produto inexistente deve retornar 404
    [Tags]    put    recurso_inexistente
    ${response}    ${payload}=    Atualizar Titulo Do Produto    ${PRODUTO_ID_INVALIDO}
    Verificar Produto Nao Encontrado    ${response}

Deletar produto inexistente deve retornar 404
    [Tags]    delete    recurso_inexistente
    ${response}=    Excluir Produto    ${PRODUTO_ID_INVALIDO}
    Verificar Produto Nao Encontrado    ${response}
