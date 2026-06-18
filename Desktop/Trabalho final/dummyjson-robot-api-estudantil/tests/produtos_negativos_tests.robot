*** Settings ***
Documentation     Testes negativos de produtos.
Resource          ../resources/base.robot
Resource          ../resources/requests/produtos_keywords.robot
Suite Setup       Criar Sessao Da API
Test Tags         produtos    negativo

*** Test Cases ***
Buscar Produto Inexistente Deve Retornar 404
    [Tags]    get    recurso_inexistente
    ${response}=    Buscar Produto Por Id    ${PRODUTO_ID_INVALIDO}
    Validar Produto Nao Encontrado    ${response}

Atualizar Produto Inexistente Deve Retornar 404
    [Tags]    put    recurso_inexistente
    ${response}    ${payload}=    Atualizar Produto    ${PRODUTO_ID_INVALIDO}
    Validar Produto Nao Encontrado    ${response}

Deletar Produto Inexistente Deve Retornar 404
    [Tags]    delete    recurso_inexistente
    ${response}=    Deletar Produto    ${PRODUTO_ID_INVALIDO}
    Validar Produto Nao Encontrado    ${response}
